#!/bin/bash

# 确保当前目录是项目根目录
cd "$(dirname "$0")"

echo "===== 清理敏感数据并提交更改 ====="
echo "当前目录: $(pwd)"

# 创建或确保存在.gitignore文件并更新
echo "更新.gitignore文件..."
if ! grep -q ".env.local" .gitignore; then
  echo ".env.local" >> .gitignore
fi

# 检查是否已存在.env.local文件
ENV_FILE=".env.local"
if [ ! -f "$ENV_FILE" ]; then
  echo "创建$ENV_FILE文件模板..."
  cat > "$ENV_FILE" << EOL
# Firebase配置
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Replicate API
REPLICATE_API_TOKEN=

# GitHub配置
GITHUB_TOKEN=
GITHUB_USERNAME=Candseven88
GITHUB_REPO=facetalk
EOL
  echo "请在$ENV_FILE中填写您的GitHub个人访问令牌"
fi

echo "添加更新后的文件..."
git add push_to_github.sh GITHUB_PUSH_GUIDE.md .gitignore

echo "提交更改..."
git commit -m "安全更新：移除敏感信息，使用环境变量代替" || echo "没有更改需要提交"

echo "===== 清理完成 ====="
echo "现在您可以运行 ./push_to_github.sh 推送更改" 