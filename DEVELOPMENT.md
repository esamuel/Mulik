# 🛠 MULIK Game - Development Guide

This guide helps you maintain and develop the MULIK game with proper version control.

## 🚀 Initial Setup

### 1. GitHub Repository Setup
Run the setup script to connect to GitHub:
```bash
./setup-github.sh
```

This will:
- Prompt for your GitHub username
- Update all references in the code
- Connect your local repository to GitHub
- Push your initial code

### 2. Manual GitHub Setup (Alternative)
If the script doesn't work:

1. **Create Repository on GitHub:**
   - Go to github.com → New repository
   - Name: `Mulik`
   - Description: `🎮 MULIK - Fast-paced multiplayer card guessing game`
   - Don't initialize with README

2. **Connect Local Repository:**
   ```bash
   git remote set-url origin https://github.com/YOUR_USERNAME/Mulik.git
   git push -u origin main
   ```

## 🔄 Daily Development Workflow

### Quick Commit & Push
Use the provided script for easy commits:
```bash
./commit.sh "✨ Add new feature"
./commit.sh "🐛 Fix timer bug"
./commit.sh "📝 Update documentation"
```

### Manual Git Commands
```bash
# Check status
git status

# Add specific files
git add src/components/Game/NewComponent.tsx

# Add all changes
git add .

# Commit with message
git commit -m "🎮 Add new game component"

# Push to GitHub
git push
```

## 📝 Commit Message Conventions

Use emojis and clear descriptions:

### Feature Development
- `✨ Add new feature` - New functionality
- `🎮 Implement game logic` - Game-specific features
- `🎨 Improve UI/UX` - Visual improvements
- `⚡ Improve performance` - Performance optimizations

### Bug Fixes
- `🐛 Fix bug` - General bug fixes
- `🔧 Fix configuration` - Config/setup fixes
- `💚 Fix CI/build` - Build system fixes

### Documentation & Maintenance
- `📝 Update documentation` - Documentation changes
- `🔥 Remove dead code` - Code cleanup
- `♻️ Refactor code` - Code restructuring
- `🚨 Fix linter warnings` - Code quality fixes

### Dependencies & Tools
- `⬆️ Upgrade dependencies` - Dependency updates
- `📦 Add dependency` - New dependencies
- `🔒 Security updates` - Security-related changes

## 🌟 Feature Development Process

### 1. Create Feature Branch (Optional)
```bash
git checkout -b feature/new-game-mode
```

### 2. Develop Feature
- Make your changes
- Test thoroughly
- Update documentation if needed

### 3. Commit Changes
```bash
./commit.sh "✨ Add new game mode with special rules"
```

### 4. Merge to Main (if using branches)
```bash
git checkout main
git merge feature/new-game-mode
git push
```

## 🧪 Testing Your Changes

### Local Development
```bash
npm run dev
```

### Test Routes
- `/` - Home page
- `/gametest` - Complete game testing
- `/test` - Store testing
- `/cards` - Card system testing
- `/timer` - Timer testing
- `/board` - Board testing

### Build Testing
```bash
npm run build
npm run preview
```

## 📋 Release Process

### Version Tagging
```bash
# Create a version tag
git tag -a v1.0.0 -m "🎉 Release version 1.0.0"
git push origin v1.0.0
```

### Release Checklist
- [ ] All tests passing
- [ ] Documentation updated
- [ ] Version number updated in package.json
- [ ] Changelog updated
- [ ] Build successful
- [ ] Firebase configuration documented

## 🔧 Project Maintenance

### Regular Tasks
1. **Update Dependencies**
   ```bash
   npm update
   ./commit.sh "⬆️ Update dependencies"
   ```

2. **Code Quality Checks**
   ```bash
   npm run lint
   npm run type-check
   ```

3. **Clean Up**
   ```bash
   # Remove node_modules and reinstall
   rm -rf node_modules package-lock.json
   npm install
   ```

### Backup Strategy
- **GitHub** - Primary backup (automatic)
- **Local Branches** - Feature development
- **Tags** - Version milestones

## 🚨 Emergency Procedures

### Rollback Last Commit
```bash
git reset --soft HEAD~1  # Keep changes
git reset --hard HEAD~1  # Discard changes
```

### Recover Deleted Files
```bash
git checkout HEAD -- filename.tsx
```

### Force Push (Use Carefully!)
```bash
git push --force-with-lease
```

## 📊 Project Status Tracking

### Current Status
- ✅ Core game mechanics implemented
- ✅ Multiplayer system ready
- ✅ UI/UX complete
- ✅ Internationalization (EN/HE)
- ⏳ Firebase integration pending
- ⏳ Sound system pending
- ⏳ Game over screen pending

### Next Milestones
1. **v1.0.0** - Complete multiplayer game
2. **v1.1.0** - Enhanced animations
3. **v1.2.0** - Additional game modes
4. **v2.0.0** - Mobile app version

## 🤝 Collaboration

### Code Review Process
1. Create feature branch
2. Make changes
3. Create pull request
4. Review and merge

### Issue Tracking
Use GitHub Issues for:
- Bug reports
- Feature requests
- Documentation improvements
- Performance issues

---

## 📞 Support

If you encounter issues:
1. Check this guide
2. Review git documentation
3. Check GitHub repository issues
4. Create new issue if needed

**Happy coding! 🎮**
