const { execSync } = require('child_process');
const path = require('path');

async function runMasterWorkflow() {
  console.log("🌟 Starting 'Infinite Content' Master Workflow...");
  
  try {
    // 1. Generate 14 new scripts from AI
    console.log("\n--- [Step 1/3] Generating 14 AI Scripts ---");
    execSync('npm run generate-data', { stdio: 'inherit', cwd: path.resolve(__dirname, '..') });

    // 2. Render all 14 videos
    console.log("\n--- [Step 2/3] Rendering 14 Videos (MP4) ---");
    execSync('npm run batch-render', { stdio: 'inherit', cwd: path.resolve(__dirname, '..') });

    // 3. Upload and Schedule to Supabase
    console.log("\n--- [Step 3/3] Uploading & Scheduling 12hrs apart ---");
    execSync('node scripts/upload-week.js', { stdio: 'inherit', cwd: path.resolve(__dirname, '..') });

    console.log("\n✅ ALL DONE! Your 7-day schedule is now live in Supabase.");
    console.log("GitHub Actions will post these at 8 AM and 5 PM UTC every day.");
    
  } catch (err) {
    console.error("\n❌ Master Workflow failed at some point. See error above.");
    process.exit(1);
  }
}

runMasterWorkflow();
