"""Build the site's self-hosted font files.

Downloads each family from Google's font repository at a pinned commit,
checks it against fonts.lock.json, trims variable axes, and writes one
Latin and/or one Devanagari subset per style into src/fonts/, as WOFF2 for
browsers and WOFF for the share-card renderer.

Google's own served subsets drop the combining marks ISO 15919 needs
(ticket 07), which is why the site builds its own.

Usage (from the repo root):
    python -m venv .venv-fonts && .venv-fonts/bin/pip install -r scripts/fonts/requirements.txt
    .venv-fonts/bin/python scripts/fonts/subset.py [--cache DIR] [--update-lock]
"""

from __future__ import annotations

import argparse
import hashlib
import io
import json
import shutil
import sys
import urllib.request
from dataclasses import dataclass, field
from pathlib import Path

from fontTools import subset
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer

GOOGLE_FONTS_COMMIT = "e7db6ca603fd4862010383ff17ffd6cc4ffac1c0"
RAW_URL = "https://raw.githubusercontent.com/google/fonts/{commit}/ofl/{dir}/{file}"

ROOT = Path(__file__).resolve().parents[2]
OUT_DIR = ROOT / "src" / "fonts"
LOCK_FILE = Path(__file__).with_name("fonts.lock.json")

# IAST and the ISO 15919 extras, plus everyday Latin and punctuation.
LATIN = [
    (0x0000, 0x00FF),  # Basic Latin and Latin-1
    (0x0100, 0x017F),  # Latin Extended-A: ā ī ū ś ...
    (0x0300, 0x036F),  # combining marks: ring below in r̥, candrabindu in m̐
    (0x1E00, 0x1EFF),  # Latin Extended Additional: ḍ ḥ ḷ ṃ ṅ ṇ ṛ ṝ ṣ ṭ ...
    (0x2000, 0x206F),  # general punctuation: dashes, curly quotes, ellipsis
    (0x20B9, 0x20B9),  # rupee sign
    (0x2122, 0x2122),
    (0x2190, 0x2193),  # arrows
    (0x2212, 0x2212),  # minus
    (0xFEFF, 0xFEFF),
    (0xFFFD, 0xFFFD),
]

# The OpenType features browsers apply to Latin text by default: kerning, ligatures and
# contextual forms, and mark placement for IAST and the ISO 15919 marks. The site's CSS turns on
# no others, so glyphs only other features reach (figure styles, swashes, stylistic sets) are
# dropped, about a quarter of each Playfair cut (ticket 05).
LATIN_FEATURES = ["calt", "ccmp", "clig", "curs", "dist", "kern", "liga", "locl", "mark", "mkmk", "rclt", "rlig", "rvrn"]
# all-small-caps, for labels and kickers, which are set in running text only.
SMALL_CAPS = ["smcp", "c2sc"]
# Every feature: Devanagari conjuncts and mark placement depend on them.
ALL_FEATURES = ["*"]

DEVANAGARI = [
    (0x0900, 0x097F),  # Devanagari, including the dandas । ॥
    (0x1CD0, 0x1CFF),  # Vedic extensions
    (0x200C, 0x200D),  # zero-width non-joiner and joiner, used in conjunct control
    (0x25CC, 0x25CC),  # dotted circle, shown for a stray vowel sign
    (0xA8E0, 0xA8FF),  # Devanagari extended
]


@dataclass
class Source:
    dir: str
    file: str
    # Output file name (without .woff2) under the family folder.
    out: str
    # Axis settings for fontTools' instancer: a number pins the axis, a tuple limits its range.
    # Pinning every axis gives a small static font; variable files are four times the size.
    axes: dict[str, float | tuple[float, float]] = field(default_factory=dict)
    # OpenType features to keep, with the glyphs they reach.
    features: list[str] = field(default_factory=lambda: ALL_FEATURES)


@dataclass
class Family:
    slug: str  # output folder under src/fonts/
    script: str  # "latin" or "devanagari"
    sources: list[Source]


PLAYFAIR = "Playfair[opsz,wdth,wght].ttf"
PLAYFAIR_ITALIC = "Playfair-Italic[opsz,wdth,wght].ttf"
TEXT = LATIN_FEATURES + SMALL_CAPS

FAMILIES = [
    # Playfair as four static cuts: its variable file is 210 kB, each cut 35-55 kB.
    # Text cuts use a small optical size (sturdy, low contrast); the display cut a large one.
    Family(
        "playfair",
        "latin",
        [
            Source("playfair", PLAYFAIR, "PlayfairText-Regular", {"wdth": 100, "opsz": 14, "wght": 400}, TEXT),
            Source("playfair", PLAYFAIR_ITALIC, "PlayfairText-Italic", {"wdth": 100, "opsz": 14, "wght": 400}, TEXT),
            Source("playfair", PLAYFAIR, "PlayfairText-SemiBold", {"wdth": 100, "opsz": 14, "wght": 600}, TEXT),
            Source("playfair", PLAYFAIR, "PlayfairDisplay-Medium", {"wdth": 100, "opsz": 64, "wght": 500}, LATIN_FEATURES),
        ],
    ),
    Family(
        "tiro-devanagari-sanskrit",
        "devanagari",
        [Source("tirodevanagarisanskrit", "TiroDevanagariSanskrit-Regular.ttf", "TiroDevanagariSanskrit-Regular")],
    ),
]


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def fetch(dir_: str, file: str, cache: Path, lock: dict[str, str], update_lock: bool) -> Path:
    key = f"{dir_}/{file}"
    target = cache / GOOGLE_FONTS_COMMIT / dir_ / file
    if not target.exists():
        target.parent.mkdir(parents=True, exist_ok=True)
        url = RAW_URL.format(commit=GOOGLE_FONTS_COMMIT, dir=dir_, file=urllib.request.quote(file))
        print(f"download {key}")
        with urllib.request.urlopen(url, timeout=120) as response, target.open("wb") as out:
            shutil.copyfileobj(response, out)
    digest = sha256(target)
    if update_lock:
        lock[key] = digest
    elif lock.get(key) != digest:
        sys.exit(f"hash mismatch for {key}: run with --update-lock only if the change is expected")
    return target


def ranges_to_unicodes(ranges: list[tuple[int, int]]) -> list[int]:
    return [cp for start, end in ranges for cp in range(start, end + 1)]


def build(source_path: Path, source: Source, script: str, out_path: Path) -> None:
    font = TTFont(source_path, lazy=False)
    if source.axes:
        # Round-trip through bytes so the subsetter sees fully compiled tables.
        buffer = io.BytesIO()
        instancer.instantiateVariableFont(font, source.axes).save(buffer)
        buffer.seek(0)
        font = TTFont(buffer, lazy=False)
    options = subset.Options()
    options.flavor = "woff2"
    options.layout_features = source.features
    options.name_IDs = ["*"]
    options.name_languages = ["*"]
    options.hinting = False
    options.notdef_outline = True
    options.glyph_names = False
    subsetter = subset.Subsetter(options)
    subsetter.populate(unicodes=ranges_to_unicodes(LATIN if script == "latin" else DEVANAGARI))
    subsetter.subset(font)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    # The share-card renderer (Satori) reads WOFF but not WOFF2, so each subset is written in both.
    for flavor in ("woff2", "woff"):
        font.flavor = flavor
        path = out_path.with_suffix(f".{flavor}")
        font.save(path)
        print(f"wrote {path.relative_to(ROOT)} ({path.stat().st_size / 1000:.1f} kB)")


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--cache", type=Path, default=Path.home() / ".cache" / "care4mind-fonts")
    parser.add_argument("--update-lock", action="store_true", help="record new hashes instead of checking them")
    parser.add_argument("--only", nargs="*", help="build only these family slugs")
    args = parser.parse_args()

    # With --update-lock, start empty so the lock lists only the files this build uses.
    lock: dict[str, str] = {} if args.update_lock or not LOCK_FILE.exists() else json.loads(LOCK_FILE.read_text())
    for family in FAMILIES:
        if args.only and family.slug not in args.only:
            continue
        for source in family.sources:
            path = fetch(source.dir, source.file, args.cache, lock, args.update_lock)
            build(path, source, family.script, OUT_DIR / family.slug / f"{source.out}.woff2")
        licence = fetch(family.sources[0].dir, "OFL.txt", args.cache, lock, args.update_lock)
        shutil.copyfile(licence, OUT_DIR / family.slug / "OFL.txt")
    if args.update_lock:
        LOCK_FILE.write_text(json.dumps(dict(sorted(lock.items())), indent=2) + "\n")


if __name__ == "__main__":
    main()
