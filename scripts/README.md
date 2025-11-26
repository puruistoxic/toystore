# Asset Optimization Scripts

This directory contains scripts for automatically optimizing assets (videos, images) before deployment.

## Automatic Optimization

The optimization runs automatically:
- **Before build**: When you run `npm run build`, it automatically optimizes assets first
- **Manually**: Run `npm run optimize` to optimize assets without building

## How It Works

1. **Video Optimization**:
   - Scans `public/videos/` for video files (mp4, mov, avi, mkv)
   - Creates optimized MP4 (H.264) version
   - Creates WebM (VP9) version for better compression
   - Generates poster image (first frame) for faster loading
   - Only processes files that are new or have been modified

2. **Requirements**:
   - **ffmpeg** must be installed on your system
   - The script checks for ffmpeg and warns if not found
   - In Docker builds, ffmpeg is automatically installed

## Installation

### Local Development

**Windows:**
- Download from [ffmpeg.org](https://ffmpeg.org/download.html)
- Or use: `winget install ffmpeg`
- Or use: `choco install ffmpeg`

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

ffmpeg is automatically installed in the Docker build process, so no manual installation needed.

## Usage

### Automatic (Recommended)

Just run your normal build command:
```bash
npm run build
```

The optimization will run automatically before the build.

### Manual

To optimize assets without building:
```bash
npm run optimize
```

## File Structure

After optimization, your `public/videos/` directory will contain:
```
public/videos/
├── banner-background.mp4          # Original (or optimized if same name)
├── banner-background.webm         # WebM version (auto-generated)
├── banner-background-poster.jpg   # Poster image (auto-generated)
└── README.md
```

## Optimization Settings

- **MP4**: H.264 codec, CRF 28, 30fps, max 1920x1080
- **WebM**: VP9 codec, CRF 30, 30fps, max 1920x1080
- **Poster**: First frame, JPEG quality 3 (high quality)

## Troubleshooting

### ffmpeg not found

If you see a warning about ffmpeg:
1. Install ffmpeg (see Installation above)
2. Verify: `ffmpeg -version`
3. Restart your terminal/IDE

### Videos not optimizing

- Check that video files are in `public/videos/`
- Ensure video files have extensions: .mp4, .mov, .avi, .mkv
- Check file permissions
- Look for error messages in the console

### Build fails

The optimization script is set to continue even if it fails (for Docker builds). If you want strict checking, modify the Dockerfile to remove the `|| echo` fallback.

