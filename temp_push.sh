#!/bin/bash

# 临时脚本，用于安全地推送最新更改到GitHub
# 此脚本不会存储任何敏感信息

echo "===== 临时安全推送 ====="

# 确保当前分支是最新的
git fetch origin
git pull --rebase origin main || echo "合并远程更改失败，可能需要手动解决冲突"

# 列出当前的提交历史
echo "当前提交历史:"
git log -3 --oneline

echo ""
echo "由于GitHub存在令牌安全问题，无法自动推送。"
echo "请使用以下方法之一推送更改:"
echo ""
echo "1. 使用GitHub Desktop客户端推送"
echo "2. 在GitHub网站上直接编辑文件"
echo "3. 运行 'push_to_github_secure.sh' 并在提示时输入令牌"
echo ""
echo "受影响的文件:"
git status --short

echo "===== 临时脚本结束 =====" 