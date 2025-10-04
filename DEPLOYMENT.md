# 🚀 MULIK Game - Deployment Guide

This guide covers deploying the MULIK multiplayer card game to production.

## 📋 Pre-Deployment Checklist

### ✅ **Code Quality**
- [ ] All TypeScript errors resolved
- [ ] ESLint warnings addressed
- [ ] All tests passing
- [ ] No console errors in production build
- [ ] Performance optimizations applied

### ✅ **Configuration**
- [ ] Environment variables configured
- [ ] Firebase project set up
- [ ] Domain/hosting configured
- [ ] SSL certificate ready
- [ ] CDN configured (optional)

### ✅ **Testing**
- [ ] All routes working
- [ ] Language switching functional
- [ ] Mobile responsiveness verified
- [ ] Cross-browser compatibility tested
- [ ] Multiplayer functionality tested
- [ ] Error boundaries working

## 🔧 Environment Setup

### 1. Firebase Configuration

Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com):

1. **Create Project**
   - Project name: `mulik-game`
   - Enable Google Analytics (optional)

2. **Enable Services**
   ```bash
   # Firestore Database
   - Create database in production mode
   - Set up security rules
   
   # Realtime Database (for presence)
   - Create database
   - Configure rules
   
   # Authentication (optional)
   - Enable Anonymous auth
   - Enable Google/Facebook (optional)
   
   # Hosting
   - Initialize hosting
   - Connect custom domain
   ```

3. **Get Configuration**
   - Go to Project Settings
   - Copy Firebase config object
   - Add to `.env` file

### 2. Environment Variables

Create `.env` file from `.env.example`:

```bash
# Copy example file
cp .env.example .env

# Edit with your values
nano .env
```

Required variables:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123

VITE_APP_NAME=MULIK
VITE_APP_URL=https://your-domain.com
```

## 🏗️ Build Process

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Tests
```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Build test
npm run build
npm run preview
```

### 3. Production Build
```bash
# Create optimized build
npm run build

# Verify build
ls -la dist/
```

## 🌐 Deployment Options

### Option 1: Firebase Hosting (Recommended)

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize project
firebase init hosting

# Configure firebase.json
{
  "hosting": {
    "public": "dist",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "**/*.@(js|css)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=31536000"
          }
        ]
      }
    ]
  }
}

# Deploy
firebase deploy
```

### Option 2: Netlify

```bash
# Build
npm run build

# Deploy via Netlify CLI
npm install -g netlify-cli
netlify deploy --prod --dir=dist

# Or drag & drop dist/ folder to netlify.com
```

### Option 3: Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod

# Configure vercel.json for SPA
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### Option 4: Custom Server

```bash
# Build
npm run build

# Serve with nginx/apache
# Configure SPA routing
# Set up SSL certificate
# Configure domain
```

## 🔒 Security Configuration

### 1. Firebase Security Rules

**Firestore Rules** (`firestore.rules`):
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Rooms collection
    match /rooms/{roomId} {
      allow read, write: if true; // Adjust based on your auth
    }
    
    // Game history (optional)
    match /gameHistory/{gameId} {
      allow read, write: if true;
    }
  }
}
```

**Realtime Database Rules** (`database.rules.json`):
```json
{
  "rules": {
    "rooms": {
      "$roomId": {
        ".read": true,
        ".write": true
      }
    },
    "presence": {
      "$roomId": {
        "$userId": {
          ".read": true,
          ".write": true
        }
      }
    }
  }
}
```

### 2. Content Security Policy

Add to `index.html`:
```html
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'unsafe-inline' https://www.gstatic.com;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  font-src 'self' https://fonts.gstatic.com;
  img-src 'self' data: https:;
  connect-src 'self' https://*.firebaseio.com https://*.googleapis.com;
">
```

## 📊 Performance Optimization

### 1. Build Optimizations

Already configured in `vite.config.ts`:
- Code splitting
- Tree shaking
- Minification
- Compression

### 2. CDN Configuration

```bash
# Configure CDN for static assets
# Use Firebase Hosting CDN (automatic)
# Or configure Cloudflare/AWS CloudFront
```

### 3. Caching Strategy

```javascript
// Service Worker (optional)
// Cache static assets
// Cache API responses
// Offline functionality
```

## 🔍 Monitoring & Analytics

### 1. Firebase Analytics

```javascript
// Already configured in firebase.ts
// Track game events
// Monitor user engagement
// Track errors
```

### 2. Performance Monitoring

```javascript
// Firebase Performance
// Web Vitals
// Error tracking
// User session recording
```

### 3. Error Logging

```javascript
// Console errors captured by ErrorBoundary
// Firebase Crashlytics (optional)
// Sentry integration (optional)
```

## 🧪 Testing in Production

### 1. Smoke Tests

Visit these URLs after deployment:
- `/` - Home page loads
- `/create` - Room creation works
- `/join` - Room joining works
- `/comprehensive` - All tests pass
- `/nonexistent` - 404 redirects to home

### 2. Functionality Tests

- [ ] Create room and get room code
- [ ] Join room with valid code
- [ ] Language switching works
- [ ] Mobile responsive design
- [ ] Error boundaries catch errors
- [ ] Help modal opens and works
- [ ] All animations smooth

### 3. Performance Tests

```bash
# Lighthouse audit
npm install -g lighthouse
lighthouse https://your-domain.com --view

# WebPageTest
# GTmetrix
# Google PageSpeed Insights
```

## 🚨 Troubleshooting

### Common Issues

1. **Firebase Connection Errors**
   - Check API keys
   - Verify project ID
   - Check security rules

2. **Routing Issues**
   - Ensure SPA rewrites configured
   - Check base URL configuration
   - Verify all routes work

3. **Build Errors**
   - Clear node_modules and reinstall
   - Check TypeScript errors
   - Verify environment variables

4. **Performance Issues**
   - Enable compression
   - Optimize images
   - Check bundle size
   - Enable caching

### Debug Commands

```bash
# Check build
npm run build && npm run preview

# Analyze bundle
npm run build -- --analyze

# Check types
npm run type-check

# Lint code
npm run lint
```

## 📈 Post-Deployment

### 1. Domain Configuration

```bash
# Custom domain setup
# SSL certificate
# DNS configuration
# Redirect www to non-www (or vice versa)
```

### 2. Monitoring Setup

- Set up uptime monitoring
- Configure error alerts
- Monitor performance metrics
- Track user analytics

### 3. Backup Strategy

- Firebase automatic backups
- Code repository backups
- Configuration backups
- Regular data exports

## 🔄 Updates & Maintenance

### 1. Deployment Pipeline

```bash
# Automated deployment
git push origin main
# Triggers build and deploy

# Manual deployment
npm run build
firebase deploy
```

### 2. Version Management

```bash
# Tag releases
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin v1.0.0

# Semantic versioning
# Changelog maintenance
# Release notes
```

### 3. Maintenance Tasks

- Regular dependency updates
- Security patches
- Performance monitoring
- User feedback integration
- Feature updates

---

## 🎯 Success Metrics

After deployment, monitor:
- **Performance**: Page load < 3s, FCP < 1.5s
- **Availability**: 99.9% uptime
- **User Experience**: Low bounce rate, high engagement
- **Errors**: < 1% error rate
- **Mobile**: 100% mobile compatibility

## 📞 Support

For deployment issues:
1. Check this documentation
2. Review Firebase console logs
3. Check browser developer tools
4. Review GitHub issues
5. Contact development team

**Happy deploying! 🚀**
