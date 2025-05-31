#!/bin/bash

# 确保当前目录是项目根目录
cd "$(dirname "$0")"

echo "===== 准备推送代码到GitHub ====="
echo "当前目录: $(pwd)"

# 检查环境变量文件是否存在
ENV_FILE=".env.local"
if [ ! -f "$ENV_FILE" ]; then
  echo "错误: $ENV_FILE 文件不存在"
  echo "请创建 $ENV_FILE 文件并设置以下变量:"
  echo "GITHUB_TOKEN=your_personal_access_token"
  echo "GITHUB_USERNAME=your_github_username"
  echo "GITHUB_REPO=your_github_repo"
  exit 1
fi

# 从环境变量文件中读取GitHub令牌
if [ -f "$ENV_FILE" ]; then
  source <(grep -v '^#' "$ENV_FILE" | sed -E 's/(.+)=(.+)/export \1="\2"/')
fi

# 检查必要的环境变量
if [ -z "$GITHUB_TOKEN" ] || [ -z "$GITHUB_USERNAME" ] || [ -z "$GITHUB_REPO" ]; then
  echo "错误: 缺少必要的环境变量"
  echo "请在 $ENV_FILE 文件中设置 GITHUB_TOKEN, GITHUB_USERNAME 和 GITHUB_REPO"
  exit 1
fi

# 添加所有文件（如果有新文件）
echo "添加所有文件..."
git add .

# 提交更改（如果有未提交的更改）
echo "提交更改..."
git commit -m "添加完整的用户管理和商业功能系统" || echo "没有新的更改需要提交"

# 设置远程仓库URL（使用环境变量中的令牌）
echo "设置远程仓库URL..."
REMOTE_URL="https://${GITHUB_USERNAME}:${GITHUB_TOKEN}@github.com/${GITHUB_USERNAME}/${GITHUB_REPO}.git"
git remote set-url origin "$REMOTE_URL"

# 推送到GitHub
echo "推送到GitHub..."
git push origin main

echo "===== 完成 =====" 