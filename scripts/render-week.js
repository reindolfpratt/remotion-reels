const { execSync } = require('child_process');
const fs = require('fs');

const weekData = JSON.parse(fs.readFileSync('./src/data/week1.json', 'utf8'));

console.log(`🚀 Starting Batch Generator for ${weekData.length} videos...`);

for (let i = 0; i < weekData.length; i++) {
  const video = weekData[i];
  const outputName = `out/week1-${video.id}.mp4`;
  console.log(`\n================================`);
  console.log(`🎥 Rendering Video ${i + 1}/${weekData.length}: ${video.id}`);
  console.log(`   Template: ${video.templateType} | Title: "${video.title}"`);
  console.log(`================================`);
  
  // Convert object to JSON string and properly escape quotes for a shell argument
  const propsString = JSON.stringify(video).replace(/"/g, '\\"');
  
  try {
    // Run remotion render programmatically via CLI
    execSync(`npx remotion render src/index.ts DynamicReel ${outputName} --props="${propsString}"`, { stdio: 'inherit' });
    console.log(`✅ Success: Generated ${outputName}`);
  } catch (err) {
    console.error(`❌ Failed to render ${video.id}`, err);
  }
}

console.log(`\n🎉 Batch Generation Pipeline Complete! Generated ${weekData.length} unique videos.`);
