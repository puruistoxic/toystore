@echo off
REM Video Optimization Script for Web (Windows)
REM This script optimizes the banner video for web delivery

set INPUT_VIDEO=public\videos\banner-background.mp4
set OUTPUT_MP4=public\videos\banner-background-optimized.mp4
set OUTPUT_WEBM=public\videos\banner-background.webm
set POSTER_IMAGE=public\videos\banner-background-poster.jpg

echo 🎬 Starting video optimization...

REM Check if ffmpeg is installed
where ffmpeg >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Error: ffmpeg is not installed.
    echo Please install ffmpeg first:
    echo   Download from https://ffmpeg.org/download.html
    echo   Or use: winget install ffmpeg
    exit /b 1
)

REM Check if input file exists
if not exist "%INPUT_VIDEO%" (
    echo ❌ Error: Input video not found at %INPUT_VIDEO%
    exit /b 1
)

echo 📹 Optimizing MP4 (H.264) for maximum compatibility...
ffmpeg -i "%INPUT_VIDEO%" -c:v libx264 -crf 28 -preset slow -movflags +faststart -vf "scale='min(1920,iw)':'min(1080,ih)':force_original_aspect_ratio=decrease" -r 30 -an -y "%OUTPUT_MP4%"

if %ERRORLEVEL% EQU 0 (
    echo ✅ MP4 optimization complete!
) else (
    echo ❌ Error optimizing MP4
    exit /b 1
)

echo.
echo 📹 Creating WebM version (VP9) for better compression...
ffmpeg -i "%INPUT_VIDEO%" -c:v libvpx-vp9 -crf 30 -b:v 0 -vf "scale='min(1920,iw)':'min(1080,ih)':force_original_aspect_ratio=decrease" -r 30 -an -y "%OUTPUT_WEBM%"

if %ERRORLEVEL% EQU 0 (
    echo ✅ WebM optimization complete!
) else (
    echo ⚠️  Warning: WebM creation failed (optional, continuing...)
)

echo.
echo 🖼️  Creating poster image (first frame)...
ffmpeg -i "%INPUT_VIDEO%" -vf "scale='min(1920,iw)':'min(1080,ih)':force_original_aspect_ratio=decrease" -frames:v 1 -q:v 3 -y "%POSTER_IMAGE%"

if %ERRORLEVEL% EQU 0 (
    echo ✅ Poster image created!
) else (
    echo ⚠️  Warning: Poster image creation failed (optional, continuing...)
)

echo.
echo 🎉 Video optimization complete!
echo.
echo 📊 Summary:
echo    - Optimized MP4: %OUTPUT_MP4%
if exist "%OUTPUT_WEBM%" (
    echo    - WebM version: %OUTPUT_WEBM%
)
if exist "%POSTER_IMAGE%" (
    echo    - Poster image: %POSTER_IMAGE%
)
echo.
echo 💡 Next steps:
echo    1. Replace the original video with the optimized version
echo    2. Update src/pages/Home.tsx to use the new video files
echo    3. Test the video loading on different devices

pause

