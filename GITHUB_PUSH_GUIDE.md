# GitHub推送指南

这个文档提供了将FaceTalk项目代码推送到GitHub的步骤。

## 环境设置

在推送代码前，您需要设置以下环境变量（在 `.env.local` 文件中）：

```
GITHUB_TOKEN=your_personal_access_token
GITHUB_USERNAME=your_github_username
GITHUB_REPO=your_github_repo
```

请确保将这些变量替换为您的实际值。

## 遇到的问题

可能遇到的网络连接问题：

```
Failed to connect to github.com port 443: Couldn't connect to server
```

## 解决方案

### 方法1：使用安全推送脚本（推荐）

我们创建了一个名为`push_to_github_secure.sh`的脚本，它会在运行时要求您输入GitHub令牌，不会将令牌保存到任何文件中：

1. 打开终端
2. 导航到项目目录：`cd "/Users/chenjianhua/Desktop/Application AI/19-FaceTalk 3.7"`
3. 运行脚本：`./push_to_github_secure.sh`
4. 在提示时输入您的GitHub个人访问令牌

这是最安全的推送方法，不会将您的令牌保存在任何文件中。

### 方法2：使用环境变量推送脚本

如果您已经设置了`.env.local`文件，可以使用`push_to_github.sh`脚本：

1. 打开终端
2. 导航到项目目录：`cd "/Users/chenjianhua/Desktop/Application AI/19-FaceTalk 3.7"`
3. 运行脚本：`./push_to_github.sh`

### 方法3：手动执行命令

如果您不想使用脚本，可以按照以下步骤手动执行命令：

1. 打开终端
2. 导航到项目目录：`cd "/Users/chenjianhua/Desktop/Application AI/19-FaceTalk 3.7"`
3. 确保您的 `.env.local` 文件包含所需的环境变量
4. 设置远程仓库URL（使用环境变量）：
   ```bash
   # 从环境文件加载变量
   source <(grep -v '^#' .env.local | sed -E 's/(.+)=(.+)/export \1="\2"/')
   
   # 设置远程URL
   git remote set-url origin "https://${GITHUB_USERNAME}:${GITHUB_TOKEN}@github.com/${GITHUB_USERNAME}/${GITHUB_REPO}.git"
   ```
5. 推送到GitHub：
   ```bash
   git push origin main
   ```

### 方法4：使用GitHub Desktop

如果命令行方法不起作用，您可以尝试使用GitHub Desktop应用程序：

1. 下载并安装[GitHub Desktop](https://desktop.github.com/)
2. 添加现有仓库（选择项目目录）
3. 使用GitHub Desktop推送更改

## 已实现的功能

我们已经成功实现了以下功能：

1. **用户认证系统升级**
   - 完整的注册/登录功能，支持邮箱和Google登录
   - 匿名用户升级为正式账户
   - 密码重置流程

2. **订阅和支付系统**
   - 三级会员计划：Free、Basic和Pro
   - 集成Creem支付系统
   - 创建完整的定价页面
   - 积分消耗和跟踪功能

3. **用户反馈系统**
   - 用户反馈表单组件
   - 多种反馈类型支持
   - 反馈数据存储在Firebase

4. **持久化存储系统**
   - 改进的Firebase集成
   - 增强的数据存储和检索功能
   - 结果的持久化存储

5. **任务管理系统**
   - 跟踪长时间运行的生成任务
   - 任务恢复和状态更新

这些功能已在本地Git仓库中提交，只需要推送到GitHub即可完成更新。 