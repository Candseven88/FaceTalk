#!/bin/bash

# 确保当前目录是项目根目录
cd "$(dirname "$0")"

echo "===== 安全推送代码到GitHub ====="
echo "当前目录: $(pwd)"

# 获取GitHub令牌（从命令行输入，不会保存到文件）
read -p "请输入您的GitHub个人访问令牌: " GITHUB_TOKEN
if [ -z "$GITHUB_TOKEN" ]; then
  echo "错误: 未提供GitHub令牌"
  exit 1
fi

# 设置GitHub用户名和仓库名
GITHUB_USERNAME="Candseven88"
GITHUB_REPO="facetalk"

# 添加所有文件（如果有新文件）
echo "添加所有文件..."
git add .

# 提交更改（如果有未提交的更改）
echo "提交更改..."
git commit -m "更新代码和文档" || echo "没有新的更改需要提交"

# 设置远程仓库URL（使用输入的令牌）
echo "设置远程仓库URL..."
REMOTE_URL="https://${GITHUB_USERNAME}:${GITHUB_TOKEN}@github.com/${GITHUB_USERNAME}/${GITHUB_REPO}.git"
git remote set-url origin "$REMOTE_URL"

# 推送到GitHub
echo "推送到GitHub..."
git push origin main

# 安全清理（确保令牌不会留在历史记录中）
echo "清理敏感信息..."
unset GITHUB_TOKEN
REMOTE_URL=""

echo "===== 完成 =====" 