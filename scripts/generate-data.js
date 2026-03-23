const fs = require('fs');
const axios = require('axios');
require('dotenv').config();

// Configuration
const API_KEY = process.env.PERPLEXITY_API_KEY; 
const DATA_PATH = './src/data/week1.json';

async function generateData() {
  if (!API_KEY) {
    console.error("❌ Error: PERPLEXITY_API_KEY NOT found in .env file.");
    return;
  }

  console.log("🤖 Asking AI for 10 new unique video topics...");

  const existingData = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
  const existingTopics = existingData.map(v => v.id).join(', ');

  try {
    const response = await axios.post('https://api.perplexity.ai/chat/completions', {
      model: "sonar-reasoning",
      messages: [
        {
          role: "system",
          content: "You are a content JSON generator for Cohby Consult. Return ONLY a JSON array."
        },
        {
          role: "user",
          content: `Generate 10 NEW and UNIQUE video scripts (UK/Canada study consulting). 
            Existing topics to avoid: ${existingTopics}. 
            Constraints: No em-dashes. Exactly 3 scenes per video. 
            Format: [{ id, durationInSeconds: 16, audioUrl, scenes: [{ text, imageUrl }] }]`
        }
      ]
    }, {
      headers: { 'Authorization': `Bearer ${API_KEY}` }
    });

    const aiOutput = response.data.choices[0].message.content;
    const newVideos = JSON.parse(aiOutput.match(/\[\s*\{[\s\S]*\}\s*\]/)[0]);

    // Simple image fixup
    const safeUrls = [
      "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1080&q=80",
      "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1080&q=80",
      "https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=1080&q=80"
    ];

    const cleanedVideos = newVideos.map(v => ({
      ...v,
      scenes: v.scenes.map(s => ({ 
        text: s.text.replace(/\[\d+\]/g, '').trim(), 
        imageUrl: safeUrls[Math.floor(Math.random() * safeUrls.length)]
      }))
    }));

    const finalData = [...existingData, ...cleanedVideos];
    fs.writeFileSync(DATA_PATH, JSON.stringify(finalData, null, 2));

    console.log(`✅ Success! Added ${cleanedVideos.length} new videos to ${DATA_PATH}`);
  } catch (err) {
    console.error("❌ AI Generation failed:", err.message);
  }
}

generateData();
