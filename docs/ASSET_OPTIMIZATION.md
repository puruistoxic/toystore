# Automated Asset Optimization System

This project includes an automated asset optimization system that processes videos and images before deployment.

## 🎯 Overview

The system automatically optimizes assets during the build process, ensuring:
- ✅ Videos are compressed and converted to multiple formats (WebM + MP4)
- ✅ Poster images are generated for faster loading
- ✅ Assets are optimized for web delivery
- ✅ No manual intervention required

## 🚀 How It Works

### Automatic Optimization

1. **Before Build**: When you run `npm run build`, the optimization script runs automatically
2. **During Docker Build**: ffmpeg is installed and assets are optimized in the Docker container
3. **Smart Caching**: Only processes files that are new or have been modified

### What Gets Optimized

**Videos** (`public/videos/*.mp4`, `*.mov`, `*.avi`, `*.mkv`):
- Creates optimized MP4 (H.264, CRF 28, 30fps, max 1920x1080)
- Creates WebM version (VP9, CRF 30, smaller file size)
- Generates poster image (first frame, JPEG)

## 📋 Setup

### Local Development

**Install ffmpeg:**

**Windows:**
```bash
# Option 1: Download from https://ffmpeg.org/download.html
# Option 2: Using winget
winget install ffmpeg

# Option 3: Using Chocolatey
choco install ffmpeg
```

**macOS:**
```bash
brew install ffmpeg
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt-get update
sudo apt-get install ffmpeg
```

### Docker Builds

No setup needed! ffmpeg is automatically installed in the Docker build process.

## 💻 Usage

### Automatic (Recommended)

Just build normally - optimization happens automatically:
```bash
npm run build
```

### Manual Optimization

To optimize assets without building:
```bash
npm run optimize
```

### Development

For development, assets are used as-is (no optimization):
```bash
npm start
```

## 📁 File Structure

### Before Optimization
```
public/videos/
└── banner-background.mp4  (original, large file)
```

### After Optimization (Generated Automatically)
```
public/videos/
├── banner-background.mp4          (optimized, if needed)
├── banner-background.webm         (auto-generated, smaller)
├── banner-background-poster.jpg   (auto-generated, first frame)
└── README.md
```

## 🔧 Configuration

### Optimization Settings

**MP4 (H.264):**
- Codec: libx264
- Quality: CRF 28 (good balance)
- Preset: slow (better compression)
- Resolution: Max 1920x1080 (maintains aspect ratio)
- Frame rate: 30fps
- Audio: Removed (not needed for background videos)
- Faststart: Enabled (progressive download)

**WebM (VP9):**
- Codec: libvpx-vp9
- Quality: CRF 30 (slightly lower for smaller size)
- Resolution: Max 1920x1080
- Frame rate: 30fps
- Audio: Removed

**Poster Image:**
- Format: JPEG
- Quality: 3 (high quality)
- Source: First frame of video

### Customization

Edit `scripts/optimize-assets.js` to adjust:
- Video quality (CRF values)
- Resolution limits
- Frame rate
- Codec settings

## 🌐 Browser Support

The video element automatically uses the best format:
1. **WebM** (Chrome, Firefox, Edge) - Better compression
2. **MP4** (Safari, older browsers) - Fallback

## 📊 Performance Benefits

- **50-70% smaller file sizes** (after optimization)
- **Faster page loads** (smaller files = faster downloads)
- **Better mobile performance** (optimized for mobile networks)
- **Progressive loading** (faststart flag enables streaming)
- **Instant display** (poster image shows immediately)

## 🐛 Troubleshooting

### ffmpeg Not Found

**Local Development:**
- Install ffmpeg (see Setup above)
- Verify: `ffmpeg -version`
- Restart terminal/IDE

**Docker Build:**
- ffmpeg is automatically installed
- If issues occur, check Dockerfile

### Videos Not Optimizing

1. Check video files are in `public/videos/`
2. Verify file extensions: `.mp4`, `.mov`, `.avi`, `.mkv`
3. Check file permissions
4. Look for error messages in build output

### WebM 404 Errors

This happens if:
- Optimization hasn't run yet
- ffmpeg is not installed locally

**Solution:**
- Run `npm run optimize` manually
- Or build the project (optimization runs automatically)
- In production, Docker build handles this automatically

### Build Fails

The optimization script is designed to continue even if it fails (for Docker builds). If you want strict checking, modify the Dockerfile.

## 🔄 Workflow

### Development Workflow

1. Add video to `public/videos/`
2. Run `npm start` (uses original video)
3. Test locally

### Production Workflow

1. Add video to `public/videos/`
2. Run `npm run build` (optimizes automatically)
3. Deploy (optimized files included in build)

### Docker Workflow

1. Add video to `public/videos/`
2. Build Docker image: `docker build -t wainso-web .`
3. Optimization happens automatically during build
4. Deploy container

## 📝 Notes

- **Original files are preserved** - optimization creates new files
- **Optimized files are gitignored** - they're generated during build
- **Build output includes optimized files** - they're copied to build directory
- **Smart caching** - only processes changed files

## 🎓 Best Practices

1. **Keep originals** - Don't delete original video files
2. **Test locally** - Run optimization before committing
3. **Monitor file sizes** - Aim for < 5MB per video
4. **Use appropriate formats** - MP4 for compatibility, WebM for size
5. **Generate posters** - Always create poster images for faster loading

## 🔗 Related Files

- `scripts/optimize-assets.js` - Main optimization script
- `Dockerfile` - Docker build configuration (includes ffmpeg)
- `package.json` - npm scripts (prebuild hook)
- `src/pages/Home.tsx` - Video element with multiple sources
- `nginx.conf` - Video caching configuration

