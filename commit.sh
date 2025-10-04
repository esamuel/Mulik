#!/bin/bash

# MULIK Game - Quick Commit Script
# Usage: ./commit.sh "Your commit message"

if [ -z "$1" ]; then
    echo "❌ Error: Please provide a commit message"
    echo "Usage: ./commit.sh \"Your commit message\""
    exit 1
fi

echo "🔄 Adding all changes..."
git add .

echo "📝 Committing with message: $1"
git commit -m "$1"

echo "🚀 Pushing to GitHub..."
git push

echo "✅ Successfully committed and pushed to GitHub!"
echo "🌐 View at: https://github.com/YOUR_USERNAME/Mulik"
