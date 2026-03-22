require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');

// Secrets pulled from GitHub Environment Variables (or local .env for testing)
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;
const IG_ACCOUNT_ID = process.env.IG_ACCOUNT_ID;
const IG_ACCESS_TOKEN = process.env.IG_ACCESS_TOKEN;
const FB_PAGE_ID = process.env.FB_PAGE_ID;
const LINKEDIN_ACCESS_TOKEN = process.env.LINKEDIN_ACCESS_TOKEN;
const LINKEDIN_ORG_ID = process.env.LINKEDIN_ORG_ID;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function main() {
  console.log("🚀 Starting Automatic Social Media Publisher...");

  // 1. Fetch the next scheduled pending video from Supabase
  const { data: queueData, error: dbError } = await supabase
    .from('cohby_consult_content_queue')
    .select('*')
    .eq('status', 'pending')
    .lte('scheduled_at', new Date().toISOString())
    .order('scheduled_at', { ascending: true })
    .limit(1);

  if (dbError || !queueData || queueData.length === 0) {
    console.log("✅ No pending videos scheduled for right now. Exiting peacefully.");
    return;
  }

  const video = queueData[0];
  console.log(`🎬 Found scheduled video: ${video.video_id}`);

  const videoUrl = video.storage_url;
  const caption = video.social_caption || "Start your global education journey today! 🌍🎓 #StudyAbroad";

  try {
    // ─────────────────────────────────────────────
    // 2. POST TO INSTAGRAM (as a Reel)
    // ─────────────────────────────────────────────
    if (IG_ACCOUNT_ID && IG_ACCESS_TOKEN) {
      console.log("📱 Publishing to Instagram...");

      // Step A: Create the Media Container
      const containerRes = await axios.post(
        `https://graph.facebook.com/v19.0/${IG_ACCOUNT_ID}/media`,
        {
          media_type: 'REELS',
          video_url: videoUrl,
          caption: caption,
          access_token: IG_ACCESS_TOKEN
        }
      );
      const creationId = containerRes.data.id;

      // Step B: Wait for Meta to encode the video (30 seconds)
      console.log("⏳ Waiting 30 seconds for Meta to encode the Reel...");
      await new Promise(r => setTimeout(r, 30000));

      // Step C: Publish the container
      await axios.post(
        `https://graph.facebook.com/v19.0/${IG_ACCOUNT_ID}/media_publish`,
        {
          creation_id: creationId,
          access_token: IG_ACCESS_TOKEN
        }
      );
      console.log("✅ Instagram Post Successful!");
    }

    // ─────────────────────────────────────────────
    // 3. POST NATIVELY TO FACEBOOK PAGE
    // Using graph-video.facebook.com (correct host for v19 video uploads)
    // ─────────────────────────────────────────────
    if (FB_PAGE_ID && IG_ACCESS_TOKEN) {
      console.log("📘 Publishing natively to Facebook Page...");
      await axios.post(
        `https://graph-video.facebook.com/v19.0/${FB_PAGE_ID}/videos`,
        {
          file_url: videoUrl,
          description: caption,
          access_token: IG_ACCESS_TOKEN,
          creative_folder_id: process.env.FB_CREATIVE_FOLDER_ID || ''
        }
      );
      console.log("✅ Facebook Page Post Successful!");
    }

    // ─────────────────────────────────────────────
    // 4. POST TO LINKEDIN (as a link article)
    // ─────────────────────────────────────────────
    if (LINKEDIN_ACCESS_TOKEN && LINKEDIN_ORG_ID) {
      console.log("💼 Publishing to LinkedIn...");
      await axios.post(
        `https://api.linkedin.com/v2/ugcPosts`,
        {
          author: `urn:li:organization:${LINKEDIN_ORG_ID}`,
          lifecycleState: "PUBLISHED",
          specificContent: {
            "com.linkedin.ugc.ShareContent": {
              shareCommentary: { text: caption },
              shareMediaCategory: "ARTICLE",
              media: [{
                status: "READY",
                title: { text: video.video_id },
                originalUrl: videoUrl
              }]
            }
          },
          visibility: { "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC" }
        },
        {
          headers: {
            'Authorization': `Bearer ${LINKEDIN_ACCESS_TOKEN}`,
            'X-Restli-Protocol-Version': '2.0.0'
          }
        }
      );
      console.log("✅ LinkedIn Post Successful!");
    }

    // ─────────────────────────────────────────────
    // 5. MARK AS PUBLISHED IN SUPABASE
    // ─────────────────────────────────────────────
    await supabase
      .from('cohby_consult_content_queue')
      .update({ status: 'published' })
      .eq('id', video.id);
    console.log("✅ Successfully marked video as published in Queue.");

  } catch (err) {
    console.error("❌ Failed to publish video:", err.response?.data || err.message);
    process.exit(1);
  }
}

main();
