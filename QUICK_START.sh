#!/bin/bash

# Quick Start Script for Git Repository Configuration
# 快速配置脚本

echo "🚀 开始配置 Git 仓库..."
echo ""

# 进入项目目录
cd /Users/dengwen/ripgrep

# 1. 修改 remote URL
echo "📝 步骤 1: 修改 Git remote URL"
git remote set-url origin git@github.com:AwesomeDevin/ripgrep-wasm.git
echo "✅ Remote URL 已更新"
echo ""

# 2. 验证配置
echo "🔍 步骤 2: 验证配置"
git remote -v
echo ""

# 3. 测试 SSH 连接
echo "🔗 步骤 3: 测试 SSH 连接"
ssh -T git@github.com 2>&1 | head -1
echo ""

# 4. 显示当前状态
echo "📊 步骤 4: 检查 Git 状态"
git status --short
echo ""

# 5. 显示当前分支
echo "🌿 当前分支:"
git branch --show-current
echo ""

echo "✅ 配置完成！"
echo ""
echo "📋 下一步操作:"
echo "1. 如有未提交的更改，执行: git add . && git commit -m 'your message'"
echo "2. 推送到新仓库: git push -u origin main"
echo ""
echo "💡 提示: 如果主分支是 master，请先执行: git branch -M main"

