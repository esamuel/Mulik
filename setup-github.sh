#!/bin/bash

# MULIK Game - GitHub Repository Setup Script
# This script helps you connect your local repository to GitHub

echo "🎮 MULIK Game - GitHub Setup"
echo "=============================="

# Get GitHub username
read -p "Enter your GitHub username: " GITHUB_USERNAME

if [ -z "$GITHUB_USERNAME" ]; then
    echo "❌ Error: GitHub username is required"
    exit 1
fi

echo ""
echo "🔧 Setting up GitHub repository..."

# Remove existing origin if it exists
git remote remove origin 2>/dev/null || true

# Add the correct origin
git remote add origin "https://github.com/$GITHUB_USERNAME/Mulik.git"

echo "✅ Remote origin set to: https://github.com/$GITHUB_USERNAME/Mulik.git"

# Update commit script with correct username
sed -i.bak "s/YOUR_USERNAME/$GITHUB_USERNAME/g" commit.sh
sed -i.bak "s/YOUR_USERNAME/$GITHUB_USERNAME/g" README.md

# Remove backup files
rm -f commit.sh.bak README.md.bak

echo "✅ Updated commit script and README with your username"

# Try to push to GitHub
echo ""
echo "🚀 Attempting to push to GitHub..."
echo "Note: You may need to authenticate with GitHub"

if git push -u origin main; then
    echo ""
    echo "🎉 SUCCESS! Your MULIK game repository is now on GitHub!"
    echo "🌐 View it at: https://github.com/$GITHUB_USERNAME/Mulik"
    echo ""
    echo "📝 Next steps:"
    echo "1. Visit your repository on GitHub"
    echo "2. Add a description and topics"
    echo "3. Consider making it public to share with others"
    echo ""
    echo "🔄 For future commits, use:"
    echo "./commit.sh \"Your commit message\""
else
    echo ""
    echo "⚠️  Push failed. This might be because:"
    echo "1. The repository doesn't exist on GitHub yet"
    echo "2. You need to authenticate with GitHub"
    echo "3. The repository name is different"
    echo ""
    echo "📋 Manual steps:"
    echo "1. Create repository 'Mulik' on GitHub"
    echo "2. Run: git push -u origin main"
fi

echo ""
echo "🛠  Repository setup complete!"
