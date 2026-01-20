# Git 仓库配置命令

请在终端中执行以下命令来完成 Git 仓库配置：

---

## 1. 修改 Git Remote URL

```bash
cd /Users/dengwen/ripgrep

# 方式 1: 修改现有的 origin
git remote set-url origin git@github.com:AwesomeDevin/ripgrep-wasm.git

# 方式 2: 删除并重新添加 origin
git remote remove origin
git remote add origin git@github.com:AwesomeDevin/ripgrep-wasm.git
```

---

## 2. 验证配置

```bash
# 查看 remote 配置
git remote -v

# 应该显示:
# origin  git@github.com:AwesomeDevin/ripgrep-wasm.git (fetch)
# origin  git@github.com:AwesomeDevin/ripgrep-wasm.git (push)
```

---

## 3. 测试连接

```bash
# 测试 SSH 连接
ssh -T git@github.com

# 应该显示:
# Hi AwesomeDevin! You've successfully authenticated...
```

---

## 4. 推送代码到新仓库

### 首次推送

```bash
# 推送所有分支
git push -u origin --all

# 推送所有标签
git push -u origin --tags
```

### 如果新仓库已有内容，需要强制推送

```bash
# ⚠️ 警告: 这会覆盖远程仓库的内容
git push -f origin main
```

---

## 5. 设置默认分支（可选）

```bash
# 如果当前不在 main 分支
git checkout -b main

# 或重命名当前分支为 main
git branch -M main

# 推送并设置上游
git push -u origin main
```

---

## 📋 完整流程示例

```bash
# 进入项目目录
cd /Users/dengwen/ripgrep

# 修改 remote
git remote set-url origin git@github.com:AwesomeDevin/ripgrep-wasm.git

# 查看当前分支
git branch

# 确保在主分支上（可能是 master 或 main）
git checkout main  # 或 git checkout master

# 查看状态
git status

# 如果有未提交的更改，先提交
git add .
git commit -m "chore: update repository configuration and package name"

# 推送到新仓库
git push -u origin main
```

---

## 🔧 常见问题

### 问题 1: SSH 密钥未配置

**错误信息**: `Permission denied (publickey)`

**解决方案**:
```bash
# 1. 生成 SSH 密钥（如果还没有）
ssh-keygen -t ed25519 -C "your_email@example.com"

# 2. 复制公钥
cat ~/.ssh/id_ed25519.pub

# 3. 添加到 GitHub
# 访问: https://github.com/settings/keys
# 点击 "New SSH key"，粘贴公钥内容
```

### 问题 2: 远程仓库不为空

**错误信息**: `! [rejected] main -> main (fetch first)`

**解决方案**:
```bash
# 方案 1: 先拉取再推送（推荐）
git pull origin main --allow-unrelated-histories
git push origin main

# 方案 2: 强制推送（会覆盖远程内容）
git push -f origin main
```

### 问题 3: 当前在 master 分支，远程是 main

```bash
# 重命名本地分支
git branch -M main

# 推送
git push -u origin main
```

---

## ✅ 验证清单

完成配置后，确认以下内容：

- [ ] `git remote -v` 显示新的仓库地址
- [ ] `ssh -T git@github.com` 连接成功
- [ ] `git push` 成功推送代码
- [ ] GitHub 网页上能看到最新代码
- [ ] package.json 中的 repository 已更新

---

## 📦 package.json 已更新

package.json 中的仓库信息已自动更新为：

```json
{
  "repository": {
    "type": "git",
    "url": "git@github.com:AwesomeDevin/ripgrep-wasm.git"
  },
  "homepage": "https://github.com/AwesomeDevin/ripgrep-wasm#readme",
  "bugs": {
    "url": "https://github.com/AwesomeDevin/ripgrep-wasm/issues"
  }
}
```

---

## 🎯 下一步

1. ✅ 执行上述 git 命令修改 remote
2. ✅ 推送代码到新仓库
3. ✅ 在 GitHub 上设置仓库描述和标签
4. ✅ 更新 README 中的链接（如有需要）
5. ✅ 配置 GitHub Pages（如需文档站点）
6. ✅ 设置 CI/CD（如 GitHub Actions）

---

**准备好后，执行上述命令即可完成仓库迁移！** 🚀
