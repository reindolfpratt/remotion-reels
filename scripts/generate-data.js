const fs = require('fs');
const axios = require('axios');
require('dotenv').config();

// Configuration
const API_KEY = process.env.PERPLEXITY_API_KEY; 
const DATA_PATH = './src/data/week1.json';
const COUNT_PATH = './src/data/count.json';

async function generateData() {
  if (!API_KEY) {
    console.error("❌ Error: PERPLEXITY_API_KEY NOT found in .env file.");
    return;
  }

  // Load counter
  let lastReelNumber = 0;
  if (fs.existsSync(COUNT_PATH)) {
    lastReelNumber = JSON.parse(fs.readFileSync(COUNT_PATH, 'utf8')).lastReelNumber;
  }

  console.log(`🤖 Asking AI for 14 new unique video topics (Starting from Reel #${lastReelNumber + 1})...`);

  const existingData = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
  const existingTopics = existingData.map(v => v.id).join(', ');
  
  console.log("📝 Existing IDs to avoid:", existingTopics);

  try {
    const response = await axios.post('https://api.perplexity.ai/chat/completions', {
      model: "sonar",
      messages: [
        {
          role: "system",
          content: "You are a content JSON generator for Cohby Consult. Return ONLY a JSON array."
        },
        {
          role: "user",
          content: `Generate 14 NEW and UNIQUE video scripts (UK/Canada/Europe study consulting). 
            Existing topics to avoid: ${existingTopics}. 
            Constraints: No em-dashes. Exactly 3 scenes per video. 
            Format: [{ id, durationInSeconds: 16, caption, audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", scenes: [{ text, imageUrl: "" }] }]`
        }
      ]
    }, {
      headers: { 'Authorization': `Bearer ${API_KEY}` }
    });

    const aiOutput = response.data.choices[0].message.content;
    const newVideos = JSON.parse(aiOutput.match(/\[\s*\{[\s\S]*\}\s*\]/)[0]);

    // Simple image fixup
    const safeUrls = [
      "https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1080&h=1920&fit=crop",
      "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=1080&h=1920&fit=crop",
      "https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=1080&h=1920&fit=crop",
      "https://images.unsplash.com/photo-1525921429624-479b6a26d84d?q=80&w=1080&h=1920&fit=crop",
      "https://images.unsplash.com/photo-1543269865-cbf427effbad?q=80&w=1080&h=1920&fit=crop",
      "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=1080&h=1920&fit=crop"
    ];

    const cleanedVideos = newVideos.map((v, index) => {
      const reelNumber = lastReelNumber + index + 1;
      return {
        ...v,
        id: `reel-${reelNumber}`,
        scenes: v.scenes.map(s => ({ 
          text: s.text.replace(/\[\d+\]/g, '').trim(), 
          imageUrl: safeUrls[Math.floor(Math.random() * safeUrls.length)]
        }))
      };
    });

    // Update Counter
    fs.writeFileSync(COUNT_PATH, JSON.stringify({ lastReelNumber: lastReelNumber + 14 }, null, 2));

    // Fresh start for the week
    fs.writeFileSync(DATA_PATH, JSON.stringify(cleanedVideos, null, 2));

    console.log(`✅ Success! Generated Reels ${lastReelNumber + 1} to ${lastReelNumber + 14}`);
  } catch (err) {
    if (err.response) {
      console.error(`❌ AI Generation failed (Status: ${err.response.status}):`, JSON.stringify(err.response.data, null, 2));
    } else {
      console.error("❌ AI Generation failed:", err.message);
    }
  }
}

generateData();
