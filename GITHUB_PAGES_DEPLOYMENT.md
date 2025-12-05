# 产品计算器 - GitHub Pages 部署指南

## 一、创建 GitHub 仓库

1. **登录 GitHub**：访问 [GitHub](https://github.com/) 并登录您的账号
2. **创建新仓库**：
   - 点击右上角的 "+" 图标，选择 "New repository"
   - 仓库名称：可以命名为 `product-calculator` 或其他您喜欢的名称
   - 描述：可选，填写 "产品计算器网页应用"
   - 选择 "Public"（公开）仓库
   - 不要勾选 "Initialize this repository with a README"
   - 点击 "Create repository"

## 二、配置本地 Git 环境

### 1. 安装 Git（如果尚未安装）
- 访问 [Git 官网](https://git-scm.com/download/win) 下载 Windows 版本的 Git
- 按照安装向导完成安装
- 安装完成后，打开命令提示符（CMD）或 PowerShell，输入 `git --version` 验证安装成功

### 2. 配置 Git 用户信息
在命令行中执行以下命令（将邮箱和用户名替换为您的 GitHub 信息）：
```bash
git config --global user.email "your.email@example.com"
git config --global user.name "Your GitHub Username"
```

## 三、初始化本地仓库并推送代码

### 1. 进入项目目录
打开命令行，执行以下命令进入您的项目目录：
```bash
cd d:\AI软件制作
```

### 2. 初始化 Git 仓库
```bash
git init
```

### 3. 创建 .gitignore 文件（可选但推荐）
创建一个 `.gitignore` 文件，用于忽略不需要提交的文件：
```bash
echo "# IDE files\n.vscode/\n.idea/\n\n# Temporary files\n*.tmp\n*.temp\n\n# OS files\nThumbs.db\n.DS_Store" > .gitignore
```

### 4. 添加所有文件到暂存区
```bash
git add .
```

### 5. 提交代码
```bash
git commit -m "Initial commit - 产品计算器部署到 GitHub Pages"
```

### 6. 添加远程仓库
将本地仓库与 GitHub 仓库关联（替换 `<your-username>` 和 `<your-repo-name>` 为实际值）：
```bash
git remote add origin https://github.com/<your-username>/<your-repo-name>.git
```

### 7. 推送代码到 GitHub
```bash
git push -u origin master
```

> 如果您的默认分支是 `main` 而不是 `master`，请使用 `git push -u origin main`

## 四、启用 GitHub Pages

1. **进入仓库设置**：在 GitHub 仓库页面，点击 "Settings" 选项卡
2. **找到 Pages 设置**：在左侧菜单中点击 "Pages"
3. **配置 Pages**：
   - 在 "Source" 部分，选择 "Deploy from a branch"
   - 在 "Branch" 部分，选择分支（通常是 `main` 或 `master`）
   - 在 "Folder" 部分，选择 "/ (root)"（根目录）
   - 点击 "Save"
4. **等待部署完成**：页面会显示 "Your site is ready to be published at https://<your-username>.github.io/<your-repo-name>/"

## 五、验证部署

1. 访问显示的 URL（通常是 https://<your-username>.github.io/<your-repo-name>/）
2. 检查计算器是否能正常运行
3. 测试所有功能（商品价格输入、配置选择、计算结果显示等）

## 六、更新代码（后续修改）

当您需要更新代码时，只需执行以下步骤：

1. 保存您的修改
2. 执行以下命令：
```bash
git add .
git commit -m "Update description"
git push
```
3. 等待几分钟，GitHub Pages 会自动重新部署您的网站

## 七、注意事项

1. **数据存储**：由于使用 localStorage 存储设置，每个用户的数据仅保存在其本地浏览器中，不会同步到服务器
2. **自定义域名**：如果需要使用自定义域名，可以在 GitHub Pages 设置中配置
3. **HTTPS**：GitHub Pages 自动提供 HTTPS 支持，无需额外配置
4. **访问速度**：GitHub Pages 使用全球 CDN，访问速度较快

## 八、常见问题

### 1. 推送代码时出现权限错误
- 确保您已正确配置 Git 用户信息
- 检查 GitHub 仓库的访问权限
- 考虑使用 SSH 密钥认证替代 HTTPS

### 2. 网站无法正常加载
- 检查文件路径是否正确（特别是 JavaScript 文件引用）
- 确认所有文件都已成功提交
- 等待几分钟，部署可能需要时间
- 检查浏览器控制台的错误信息

### 3. 页面样式丢失
- 检查 CSS 文件路径是否正确
- 确认 CSS 文件已包含在提交中

如果您遇到任何问题，可以随时查看 GitHub Pages [官方文档](https://docs.github.com/cn/pages/getting-started-with-github-pages/about-github-pages) 或在 GitHub 仓库的 Issues 中提问。

---

部署完成后，您就可以通过 GitHub Pages 提供的 URL 与他人分享您的产品计算器了！