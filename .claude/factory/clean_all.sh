#!/bin/bash
echo "🧹 Cleaning up AI Factory debris..."
git worktree prune
rm -rf .claude/worktrees/*
rm -f .claude/factory/tmp_*.md
git branch | grep "feature/issue-" | xargs -r git branch -D
echo "✨ Cleaned."
