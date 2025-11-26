#!/usr/bin/env node

/**
 * Automated Asset Optimization Script
 * Optimizes videos and images before build
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const VIDEOS_DIR = path.join(PUBLIC_DIR, 'videos');
const IMAGES_DIR = path.join(PUBLIC_DIR, 'images');

// Check if ffmpeg is available
function checkFFmpeg() {
  try {
    execSync('ffmpeg -version', { stdio: 'ignore' });
    return true;
  } catch (error) {
    return false;
  }
}

// Optimize video file
function optimizeVideo(inputPath, outputPath, posterPath) {
  console.log(`📹 Optimizing video: ${path.basename(inputPath)}`);
  
  try {
    // Optimize MP4
    const mp4Cmd = `ffmpeg -i "${inputPath}" -c:v libx264 -crf 28 -preset slow -movflags +faststart -vf "scale='min(1920,iw)':'min(1080,ih)':force_original_aspect_ratio=decrease" -r 30 -an -y "${outputPath}"`;
    execSync(mp4Cmd, { stdio: 'inherit' });
    console.log(`✅ MP4 optimized: ${path.basename(outputPath)}`);
    
    // Create WebM version
    const webmPath = outputPath.replace('.mp4', '.webm');
    const webmCmd = `ffmpeg -i "${inputPath}" -c:v libvpx-vp9 -crf 30 -b:v 0 -vf "scale='min(1920,iw)':'min(1080,ih)':force_original_aspect_ratio=decrease" -r 30 -an -y "${webmPath}"`;
    execSync(webmCmd, { stdio: 'inherit' });
    console.log(`✅ WebM created: ${path.basename(webmPath)}`);
    
    // Create poster image
    const posterCmd = `ffmpeg -i "${inputPath}" -vf "scale='min(1920,iw)':'min(1080,ih)':force_original_aspect_ratio=decrease" -frames:v 1 -q:v 3 -y "${posterPath}"`;
    execSync(posterCmd, { stdio: 'inherit' });
    console.log(`✅ Poster image created: ${path.basename(posterPath)}`);
    
    return true;
  } catch (error) {
    console.error(`❌ Error optimizing video: ${error.message}`);
    return false;
  }
}

// Process videos
function processVideos() {
  if (!fs.existsSync(VIDEOS_DIR)) {
    console.log('📁 No videos directory found, skipping...');
    return;
  }
  
  const videoFiles = fs.readdirSync(VIDEOS_DIR).filter(file => 
    /\.(mp4|mov|avi|mkv)$/i.test(file) && !file.includes('optimized') && !file.includes('webm')
  );
  
  if (videoFiles.length === 0) {
    console.log('📹 No videos to optimize');
    return;
  }
  
  videoFiles.forEach(file => {
    const inputPath = path.join(VIDEOS_DIR, file);
    const baseName = path.parse(file).name;
    
    // Check if WebM and poster already exist
    const webmPath = path.join(VIDEOS_DIR, `${baseName}.webm`);
    const posterPath = path.join(VIDEOS_DIR, `${baseName}-poster.jpg`);
    
    const webmExists = fs.existsSync(webmPath);
    const posterExists = fs.existsSync(posterPath);
    
    // If both WebM and poster exist, check if input is newer
    if (webmExists && posterExists) {
      const inputTime = fs.statSync(inputPath).mtime;
      const webmTime = fs.statSync(webmPath).mtime;
      const posterTime = fs.statSync(posterPath).mtime;
      
      if (inputTime <= webmTime && inputTime <= posterTime) {
        console.log(`⏭️  Skipping ${file} (already optimized)`);
        return;
      }
    }
    
    // Use original file as output if it's already MP4, otherwise create new
    const outputPath = file.endsWith('.mp4') 
      ? inputPath 
      : path.join(VIDEOS_DIR, `${baseName}.mp4`);
    
    optimizeVideo(inputPath, outputPath, posterPath);
  });
}

// Main execution
function main() {
  console.log('🚀 Starting asset optimization...\n');
  
  if (!checkFFmpeg()) {
    console.warn('⚠️  Warning: ffmpeg not found. Video optimization will be skipped.');
    console.warn('   Install ffmpeg: https://ffmpeg.org/download.html');
    console.warn('   Videos will be used as-is.\n');
    return;
  }
  
  processVideos();
  
  console.log('\n✅ Asset optimization complete!');
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { optimizeVideo, processVideos };

