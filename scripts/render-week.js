const { execSync } = require('child_process');
const fs = require('fs');

const FPS = 30;
const CTA_DURATION_FRAMES = 120; // 4 seconds for the CTA screen

const weekData = JSON.parse(fs.readFileSync('./src/data/week1.json', 'utf8'));

console.log(`🚀 Starting Batch Generator for ${weekData.length} videos...`);

// Render all videos in the dataset
const videosToRender = weekData.length;
console.log(`📝 Rendering all ${videosToRender} videos`);

for (let i = 0; i < videosToRender; i++) {
  const video = weekData[i];
  

  const outputName = `out/${video.id}.mp4`;
  
  // Calculate total frames: content duration + CTA screen
  const contentSeconds = video.durationInSeconds || 30;
  const contentFrames = Math.round(contentSeconds * FPS);
  const totalFrames = contentFrames + CTA_DURATION_FRAMES;

  console.log(`\n================================`);
  console.log(`🎥 Rendering Video ${i + 1}/${weekData.length}: ${video.id}`);
  console.log(`   Duration: ${contentSeconds}s + 4s CTA = ${totalFrames / FPS}s total`);
  console.log(`================================`);
  
  // Pass duration as part of props so the composition can read it
  const videoWithFrames = { ...video, contentFrames, totalFrames };
  const propsString = JSON.stringify(videoWithFrames).replace(/"/g, '\\"');
  
  try {
    execSync(
      `npx remotion render src/index.ts DynamicReel ${outputName} --props="${propsString}" --frames=0-${totalFrames - 1}`,
      { stdio: 'inherit' }
    );
    console.log(`✅ Success: Generated ${outputName}`);
  } catch (err) {
    console.error(`❌ Failed to render ${video.id}`, err);
  }
}

console.log(`\n🎉 Batch Generation Pipeline Complete! Generated ${videosToRender} unique videos (testing mode).`);
