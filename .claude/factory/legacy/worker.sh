#!/bin/bash
# Load env vars if they exist
if [ -f .env ]; then export $(grep -v '^#' .env | xargs); fi
uv run python .claude/factory/manager.py
