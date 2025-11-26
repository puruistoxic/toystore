#!/bin/bash

# Video Optimization Script for Web
# This script optimizes the banner video for web delivery

INPUT_VIDEO="public/videos/banner-background.mp4"
OUTPUT_MP4="public/videos/banner-background-optimized.mp4"
OUTPUT_WEBM="public/videos/banner-background.webm"
POSTER_IMAGE="public/videos/banner-background-poster.jpg"

echo "🎬 Starting video optimization..."

# Check if ffmpeg is installed
if ! command -v ffmpeg &> /dev/null; then
    echo "❌ Error: ffmpeg is not installed."
    echo "Please install ffmpeg first:"
    echo "  - macOS: brew install ffmpeg"
    echo "  - Ubuntu/Debian: sudo apt-get install ffmpeg"
    echo "  - Windows: Download from https://ffmpeg.org/download.html"
    exit 1
fi

# Check if input file exists
if [ ! -f "$INPUT_VIDEO" ]; then
    echo "❌ Error: Input video not found at $INPUT_VIDEO"
    exit 1
fi

echo "📹 Optimizing MP4 (H.264) for maximum compatibility..."
# Optimize MP4 with H.264 codec
# -crf 28: Good quality with smaller file size (18-28 is recommended range)
# -preset slow: Better compression, takes longer
# -movflags +faststart: Enables progressive download
# -vf scale: Scale to 1920x1080 if larger (maintains aspect ratio)
# -r 30: Limit to 30fps (reduces file size)
# -an: Remove audio (not needed for background video)
ffmpeg -i "$INPUT_VIDEO" \
  -c:v libx264 \
  -crf 28 \
  -preset slow \
  -movflags +faststart \
  -vf "scale='min(1920,iw)':'min(1080,ih)':force_original_aspect_ratio=decrease" \
  -r 30 \
  -an \
  -y \
  "$OUTPUT_MP4"

if [ $? -eq 0 ]; then
    echo "✅ MP4 optimization complete!"
    ORIGINAL_SIZE=$(du -h "$INPUT_VIDEO" | cut -f1)
    NEW_SIZE=$(du -h "$OUTPUT_MP4" | cut -f1)
    echo "   Original size: $ORIGINAL_SIZE"
    echo "   Optimized size: $NEW_SIZE"
else
    echo "❌ Error optimizing MP4"
    exit 1
fi

echo ""
echo "📹 Creating WebM version (VP9) for better compression..."
# Create WebM version with VP9 codec (better compression than H.264)
# -crf 30: Slightly lower quality for smaller file size
# -b:v 0: Use CRF mode (constant rate factor)
ffmpeg -i "$INPUT_VIDEO" \
  -c:v libvpx-vp9 \
  -crf 30 \
  -b:v 0 \
  -vf "scale='min(1920,iw)':'min(1080,ih)':force_original_aspect_ratio=decrease" \
  -r 30 \
  -an \
  -y \
  "$OUTPUT_WEBM"

if [ $? -eq 0 ]; then
    echo "✅ WebM optimization complete!"
    WEBM_SIZE=$(du -h "$OUTPUT_WEBM" | cut -f1)
    echo "   WebM size: $WEBM_SIZE"
else
    echo "⚠️  Warning: WebM creation failed (optional, continuing...)"
fi

echo ""
echo "🖼️  Creating poster image (first frame)..."
# Extract first frame as poster image
ffmpeg -i "$INPUT_VIDEO" \
  -vf "scale='min(1920,iw)':'min(1080,ih)':force_original_aspect_ratio=decrease" \
  -frames:v 1 \
  -q:v 3 \
  -y \
  "$POSTER_IMAGE"

if [ $? -eq 0 ]; then
    echo "✅ Poster image created!"
else
    echo "⚠️  Warning: Poster image creation failed (optional, continuing...)"
fi

echo ""
echo "🎉 Video optimization complete!"
echo ""
echo "📊 Summary:"
echo "   - Optimized MP4: $OUTPUT_MP4"
if [ -f "$OUTPUT_WEBM" ]; then
    echo "   - WebM version: $OUTPUT_WEBM"
fi
if [ -f "$POSTER_IMAGE" ]; then
    echo "   - Poster image: $POSTER_IMAGE"
fi
echo ""
echo "💡 Next steps:"
echo "   1. Replace the original video with the optimized version"
echo "   2. Update src/pages/Home.tsx to use the new video files"
echo "   3. Test the video loading on different devices"

