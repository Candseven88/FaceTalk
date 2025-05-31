# 安全推送指南

为了确保代码安全推送到GitHub，我们已经创建了以下脚本：

1. `push_to_github_secure.sh` - 安全的推送脚本，通过命令行输入GitHub令牌
2. `clean_sensitive_data.sh` - 用于清理仓库中的敏感信息

## 使用方法

推荐使用 `push_to_github_secure.sh` 脚本，它不会将您的令牌保存在任何文件中。

```bash
./push_to_github_secure.sh
```

然后在提示时输入您的GitHub个人访问令牌。

## 注意事项

- 不要将GitHub令牌保存在代码中
- 不要将 `.env.local` 文件提交到仓库
- 使用 `.gitignore` 忽略包含敏感信息的文件

请参考 `GITHUB_PUSH_GUIDE.md` 获取更详细的指南。 