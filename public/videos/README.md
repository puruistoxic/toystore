# Video Optimization Guide

This directory contains the banner background video for the homepage.

## Current Video

- **File**: `banner-background.mp4`
- **Location**: `public/videos/banner-background.mp4`

## Optimization

To optimize the video for web delivery, run the optimization script:

```bash
# Make the script executable (first time only)
chmod +x optimize-video.sh

# Run the optimization script
./optimize-video.sh
```

### What the Script Does

1. **Optimizes MP4** (H.264 codec)
   - Reduces file size while maintaining quality
   - Adds faststart flag for progressive download
   - Limits to 30fps and 1920x1080 max resolution
   - Removes audio (not needed for background video)

2. **Creates WebM version** (VP9 codec)
   - Better compression than MP4
   - Smaller file size
   - Supported by modern browsers

3. **Generates Poster Image**
   - First frame of the video
   - Shown while video is loading
   - Improves perceived performance

### Requirements

- **ffmpeg** must be installed on your system
  - macOS: `brew install ffmpeg`
  - Ubuntu/Debian: `sudo apt-get install ffmpeg`
  - Windows: Download from [ffmpeg.org](https://ffmpeg.org/download.html)

### Output Files

After optimization, you'll have:
- `banner-background-optimized.mp4` - Optimized MP4 version
- `banner-background.webm` - WebM version (smaller file size)
- `banner-background-poster.jpg` - Poster image

### Manual Optimization (if script doesn't work)

If you prefer to optimize manually using ffmpeg:

```bash
# Optimize MP4
ffmpeg -i banner-background.mp4 \
  -c:v libx264 \
  -crf 28 \
  -preset slow \
  -movflags +faststart \
  -vf "scale='min(1920,iw)':'min(1080,ih)':force_original_aspect_ratio=decrease" \
  -r 30 \
  -an \
  banner-background-optimized.mp4

# Create WebM version
ffmpeg -i banner-background.mp4 \
  -c:v libvpx-vp9 \
  -crf 30 \
  -b:v 0 \
  -vf "scale='min(1920,iw)':'min(1080,ih)':force_original_aspect_ratio=decrease" \
  -r 30 \
  -an \
  banner-background.webm

# Create poster image
ffmpeg -i banner-background.mp4 \
  -vf "scale='min(1920,iw)':'min(1080,ih)':force_original_aspect_ratio=decrease" \
  -frames:v 1 \
  -q:v 3 \
  banner-background-poster.jpg
```

## Best Practices

1. **File Size**: Aim for under 5MB for background videos
2. **Resolution**: 1920x1080 (Full HD) is sufficient for most displays
3. **Frame Rate**: 30fps is enough for background videos
4. **Duration**: Keep videos short (10-30 seconds) and loop them
5. **Format**: Provide both WebM and MP4 for maximum browser support

## Browser Support

- **WebM**: Chrome, Firefox, Edge (modern versions)
- **MP4**: All modern browsers (Safari, Chrome, Firefox, Edge)
- **Poster Image**: Fallback for slow connections or unsupported browsers

## Performance Tips

1. Use `preload="metadata"` to load only video metadata initially
2. Use a poster image to show content immediately
3. Enable video caching in nginx (already configured)
4. Consider using a CDN for video delivery in production

