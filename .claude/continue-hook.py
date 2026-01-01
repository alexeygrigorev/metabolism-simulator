#!/usr/bin/env python3

import json
import sys
import os


def main():
    try:
        input_data = json.load(sys.stdin)
        # but it doesn't matter what it is, we always continue
    except json.JSONDecodeError as e:
        sys.exit(0)

    continue_file = ".claude/continue.md"

    # If file doesn't exist, allow stop
    if not os.path.exists(continue_file):
        sys.exit(0)

    # Read the continue message
    try:
        with open(continue_file, "r", encoding="utf-8") as f:
            content = f.read()
    except (IOError, OSError) as e:
        sys.exit(0)

    if not content or not content.strip():
        sys.exit(0)

    # Block stop and feed message back
    output = {
        "decision": "block",
        "reason": content.strip(),
        "systemMessage": "To stop: delete continue.md"
    }

    print(json.dumps(output, ensure_ascii=False), file=sys.stdout)
    sys.exit(0)


if __name__ == "__main__":
    main()
