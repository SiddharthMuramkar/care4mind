#!/usr/bin/env bash
# Runs a heavy step, Playwright or Lighthouse, one at a time on this machine.
#
#   scripts/lane/heavy.sh <command…>      e.g. E2E_PORT=3110 scripts/lane/heavy.sh pnpm check:e2e
#
# Every builder (a ticket built in its own worktree) shares one lock file, so heavy
# runs queue instead of overloading the machine. While another run holds the
# lock this says so and waits; then it runs the command and exits with the
# command's status. The lock is this script's alone: the command's processes
# don't inherit it, so a server left running can't keep the queue waiting.

LOCK=/tmp/care4mind-heavy.lock

if [ $# -eq 0 ]; then
  echo 'usage: scripts/lane/heavy.sh <command…>' >&2
  exit 2
fi

# macOS has no flock(1), but its lockf takes the same flock(2) lock on descriptor 9.
lock() {
  if command -v flock >/dev/null; then
    flock "$@" 9
  elif [ "$1" = --nonblock ]; then
    /usr/bin/lockf -s -t 0 9
  else
    /usr/bin/lockf 9
  fi
}

exec 9>>"$LOCK"
if ! lock --nonblock; then
  echo "heavy.sh: waiting for $LOCK, held by: $(cat "$LOCK" 2>/dev/null || echo 'another run')" >&2
  waited=$SECONDS
  lock || exit
  echo "heavy.sh: got the lock after $((SECONDS - waited)) s" >&2
fi
# Who holds it, for the next run that has to wait.
echo "$* (pid $$, in $PWD, since $(date +%T))" >"$LOCK"

"$@" 9>&-
