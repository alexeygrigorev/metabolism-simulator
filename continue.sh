#!/usr/bin/env bash

set -euo pipefail

pid=""

cleanup() {
  echo
  echo "Ctrl+C caught — stopping..."

  if [[ -n "${pid}" ]] && kill -0 "$pid" 2>/dev/null; then
    # Try graceful interrupt first
    kill -INT "$pid" 2>/dev/null || true

    # If the process created its own children, this kills the whole process group too
    kill -TERM -- "-$pid" 2>/dev/null || true

    # Give it a moment, then force if needed
    sleep 0.5
    kill -KILL -- "-$pid" 2>/dev/null || true
  fi

  exit 0
}

trap cleanup INT TERM

echo "Starting loop. Press Ctrl+C to stop."

while true; do
  # Start in background so our trap can fire immediately
  claude -c --dangerously-skip-permissions continue
  pid=$!

  # Try to ensure we can kill the entire process group with "-$pid"
  # (Works if the process is its own group leader; often true for CLI tools)
  wait "$pid" || true

  echo "Command exited. Restarting..."
done
