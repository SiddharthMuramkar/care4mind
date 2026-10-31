#!/bin/sh
# Starts guard.mjs. A hook shell can lack node and git on PATH (no version-manager shims),
# so look in the usual install folders before failing closed.

PATH="${PATH:-/usr/bin:/bin}:/usr/bin:/bin:/usr/local/bin:/opt/homebrew/bin"
export PATH

ask() {
  printf '%s' "{\"hookSpecificOutput\":{\"hookEventName\":\"PreToolUse\",\"permissionDecision\":\"ask\",\"permissionDecisionReason\":\"$1\"}}"
}

hook_dir=$(CDPATH= cd -- "$(dirname -- "$0")" 2>/dev/null && pwd)
if [ -z "$hook_dir" ]; then
  ask "The repo guard launcher could not find its own folder, so this call needs the developer to approve it."
  exit 0
fi

guard="$hook_dir/guard.mjs"
if [ ! -f "$guard" ]; then
  ask "The repo guard (.claude/hooks/guard.mjs) is missing next to its launcher, so this call needs the developer to approve it."
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
  ask "The repo guard could not start: no node executable was found on PATH or in the usual install folders, so this call needs the developer to approve it."
  exit 0
fi

"$node_bin" "$guard"
status=$?
if [ "$status" -ne 0 ]; then
  ask "The repo guard did not start (node exited $status), so this call needs the developer to approve it."
fi
exit 0
