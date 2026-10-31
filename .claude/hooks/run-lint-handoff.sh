#!/bin/sh
# Starts lint-handoff.mjs. A hook shell can lack node on PATH (no version-manager shims),
# so look in the usual install folders before giving up. A missing node must not trap the
# session: exit 0. A real check failure exits 2, and that status is passed straight through.

PATH="${PATH:-/usr/bin:/bin}:/usr/bin:/bin:/usr/local/bin:/opt/homebrew/bin"
export PATH

hook_dir=$(CDPATH= cd -- "$(dirname -- "$0")" 2>/dev/null && pwd)
script="$hook_dir/lint-handoff.mjs"
if [ -z "$hook_dir" ] || [ ! -f "$script" ]; then
  echo "The handoff check (.claude/hooks/lint-handoff.mjs) was not found, so this stop was not checked." >&2
  exit 0
fi

node_bin=
if command -v node >/dev/null 2>&1; then
  node_bin=node
elif [ -x /usr/local/bin/node ]; then
  node_bin=/usr/local/bin/node
elif [ -x /opt/homebrew/bin/node ]; then
  node_bin=/opt/homebrew/bin/node
elif [ -n "${HOME:-}" ] && [ -x "$HOME/.local/share/fnm/aliases/default/bin/node" ]; then
  node_bin="$HOME/.local/share/fnm/aliases/default/bin/node"
fi

if [ -z "$node_bin" ]; then
  echo "The handoff check could not start: no node executable was found, so this stop was not checked." >&2
  exit 0
fi

# pnpm often sits beside node, or corepack can start it from there.
PATH="$(dirname -- "$node_bin"):$PATH"
export PATH

"$node_bin" "$script"
exit $?
