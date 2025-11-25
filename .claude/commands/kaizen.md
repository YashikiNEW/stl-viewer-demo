---
description: Kaizen
arguments:
  - name: id
---
@Scrum_Master

Issue #{id} の全エージェントの作業メモを収集し、汎用的な学びを `claude.md` に蓄積してください。

**入力**:
- `.claude/factory/memos/issue-{id}-*.md` （各エージェントの作業メモ）

**出力**:
- 適切なディレクトリの `claude.md` に学びを追記