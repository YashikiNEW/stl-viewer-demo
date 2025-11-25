#!/bin/bash
# AI Factory エイリアス設定スクリプト
# 使用方法: source .claude/factory/setup_aliases.sh

# シェル設定ファイルを自動検出
detect_rc_file() {
    if [ -n "$ZSH_VERSION" ]; then
        echo "${ZDOTDIR:-$HOME}/.zshrc"
    elif [ -n "$BASH_VERSION" ]; then
        echo "$HOME/.bashrc"
    else
        echo "$HOME/.profile"
    fi
}

RC_FILE="${RC_FILE:-$(detect_rc_file)}"

# ファイルが存在しない場合は作成
if [ ! -f "$RC_FILE" ]; then
    touch "$RC_FILE"
fi

# 既に設定済みの場合はスキップ
if grep -q "AI Factory Aliases" "$RC_FILE" 2>/dev/null; then
    echo "AI Factory aliases already configured in $RC_FILE"
    exit 0
fi

# エイリアスを追加
{
    echo ""
    echo "# --- AI Factory Aliases ---"
    echo "alias worker='bash .claude/factory/worker.sh'"
    echo "alias clean='bash .claude/factory/clean_all.sh'"
} >> "$RC_FILE"

echo "AI Factory aliases added to $RC_FILE"
echo "Run 'source $RC_FILE' or restart your shell to apply."
