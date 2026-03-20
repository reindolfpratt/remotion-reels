require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("❌ Missing Supabase credentials in .env!");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const weekDataFile = path.resolve(__dirname, '../src/data/week1.json');
const weekData = JSON.parse(fs.readFileSync(weekDataFile, 'utf8'));

async function uploadWeek() {
  console.log("🚀 Starting Bulk Upload to Supabase...");
  
  // Define scheduled times: 2 per day starting with whatever slot is next today or tomorrow.
  let currentDate = new Date();
  
  // Push schedule to nearest 08:00 UTC or 17:00 UTC slot
  if (currentDate.getUTCHours() >= 17) {
    currentDate.setUTCDate(currentDate.getUTCDate() + 1);
    currentDate.setUTCHours(8, 0, 0, 0);
  } else if (currentDate.getUTCHours() >= 8) {
    currentDate.setUTCHours(17, 0, 0, 0);
  } else {
    currentDate.setUTCHours(8, 0, 0, 0);
  }

  // To let the user test right now, the VERY FIRST video is forcibly scheduled 5 minutes ago so it runs IMMEDIATELY.
  const nowMinus5Mins = new Date();
  nowMinus5Mins.setMinutes(nowMinus5Mins.getMinutes() - 5);

  let firstVideo = true;

  for (let i = 0; i < weekData.length; i++) {
    const video = weekData[i];
    const filepath = path.resolve(__dirname, `../out/week1-${video.id}.mp4`);
    
    if (!fs.existsSync(filepath)) {
      console.warn(`⚠️ Warning: ${filepath} not found. Did the render script finish? Skipping.`);
      continue;
    }

    const fileBuffer = fs.readFileSync(filepath);
    const filename = `week1-${video.id}.mp4`;

    console.log(`\n📤 Uploading ${filename} to content_reels storage bucket...`);
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('content_reels')
      .upload(filename, fileBuffer, {
        contentType: 'video/mp4',
        upsert: true
      });

    if (uploadError) {
      console.error(`❌ Upload failed for ${filename}:`, uploadError.message);
      continue;
    }

    // Get strictly public URL
    const { data: urlData } = supabase.storage.from('content_reels').getPublicUrl(filename);
    const publicUrl = urlData.publicUrl;

    // Compose a dynamic caption matching their brand
    const hashtags = "#StudyAbroad #GlobalEducation #CohbyConsult #InternationalStudents";
    const caption = `${video.title}\n\n${video.subtitle}\n\nReach out to start your global journey today! 🎓🌍\n\n${hashtags}`;

    const scheduledTime = firstVideo ? nowMinus5Mins.toISOString() : currentDate.toISOString();
    
    console.log(`📝 Inserting into database queue for ${scheduledTime}...`);
    
    const { error: dbError } = await supabase.from('content_queue').insert({
      video_id: video.id,
      status: 'pending',
      scheduled_at: scheduledTime,
      storage_url: publicUrl,
      social_caption: caption
    });

    if (dbError) {
      console.error(`❌ DB Insert failed for ${video.id}:`, dbError.message);
    } else {
      console.log(`✅ Queued successfully!`);
    }

    // Advance schedule time slot for subsequent videos
    if (!firstVideo) {
      if (currentDate.getUTCHours() === 8) {
        currentDate.setUTCHours(17, 0, 0, 0);
      } else {
        currentDate.setUTCDate(currentDate.getUTCDate() + 1);
        currentDate.setUTCHours(8, 0, 0, 0);
      }
    }
    
    firstVideo = false;
  }

  console.log("\n🎉 Generation pipeline completely finished linking to the Supabase Cloud!");
}

uploadWeek();
