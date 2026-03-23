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
      "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=1080&h=1920&fit=crop",
      "https://images.unsplash.com/photo-1773332585956-2d0e8ac80cb6?q=80&w=1080&h=1920&fit=crop",
      "https://images.unsplash.com/photo-1627556704302-624286467c65?q=80&w=1080&h=1920&fit=crop",
      "https://images.unsplash.com/photo-1581362072978-14998d01fdaa?q=80&w=1080&h=1920&fit=crop",
      "https://images.unsplash.com/photo-1519452635265-7b1fbfd1e4e0?q=80&w=1080&h=1920&fit=crop",
      "https://images.unsplash.com/photo-1564910443496-5fd2d76b47fa?q=80&w=1080&h=1920&fit=crop",
      "https://images.unsplash.com/photo-1773332611514-238856b76198?q=80&w=1080&h=1920&fit=crop",
      "https://images.unsplash.com/photo-1562349275-f5e7360af2dd?q=80&w=1080&h=1920&fit=crop",
      "https://images.unsplash.com/photo-1600195077077-7c815f540a3d?q=80&w=1080&h=1920&fit=crop",
      "https://images.unsplash.com/photo-1448584109583-8f5fe2e61544?q=80&w=1080&h=1920&fit=crop",
      "https://images.unsplash.com/photo-1597920940566-a77511f9327d?q=80&w=1080&h=1920&fit=crop",
      "https://images.unsplash.com/photo-1773332598451-8a0a59941912?q=80&w=1080&h=1920&fit=crop",
      "https://images.unsplash.com/photo-1693921398753-c5d114e8ae6a?q=80&w=1080&h=1920&fit=crop",
      "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?q=80&w=1080&h=1920&fit=crop",
      "https://images.unsplash.com/photo-1627556704263-b486db44a463?q=80&w=1080&h=1920&fit=crop",
      "https://images.unsplash.com/photo-1574100004472-e536d3b6bacc?q=80&w=1080&h=1920&fit=crop",
      "https://images.unsplash.com/photo-1629348879298-d8fd280d8ee0?q=80&w=1080&h=1920&fit=crop",
      "https://images.unsplash.com/photo-1773332611612-ffdaa753afb1?q=80&w=1080&h=1920&fit=crop",
      "https://images.unsplash.com/photo-1537202108838-e7072bad1927?q=80&w=1080&h=1920&fit=crop",
      "https://images.unsplash.com/photo-1563265500-fa2ff1f4fc9d?q=80&w=1080&h=1920&fit=crop",
      "https://images.unsplash.com/photo-1575688588571-966e9b61f0b7?q=80&w=1080&h=1920&fit=crop",
      "https://images.unsplash.com/photo-1655964581196-14735105c38c?q=80&w=1080&h=1920&fit=crop",
      "https://images.unsplash.com/photo-1773332611476-6ec2ba68049f?q=80&w=1080&h=1920&fit=crop",
      "https://images.unsplash.com/photo-1605299670824-00515e81b924?q=80&w=1080&h=1920&fit=crop",
      "https://images.unsplash.com/photo-1558021211-6d1403321394?q=80&w=1080&h=1920&fit=crop",
      "https://images.unsplash.com/photo-1604136514790-b27086f6c36e?q=80&w=1080&h=1920&fit=crop",
      "https://images.unsplash.com/photo-1585763465881-62c5d70627bc?q=80&w=1080&h=1920&fit=crop",
      "https://images.unsplash.com/photo-1537888692311-8a7fb3e9f374?q=80&w=1080&h=1920&fit=crop",
      "https://images.unsplash.com/photo-1590070572368-74a1e6da0a34?q=80&w=1080&h=1920&fit=crop",
      "https://images.unsplash.com/photo-1496317899792-9d7dbcd928a1?q=80&w=1080&h=1920&fit=crop",
      "https://images.unsplash.com/photo-1531674842274-9563aa15686f?q=80&w=1080&h=1920&fit=crop",
      "https://images.unsplash.com/photo-1622126195600-41efc0b028e2?q=80&w=1080&h=1920&fit=crop",
      "https://images.unsplash.com/photo-1567168544646-208fa5d408fb?q=80&w=1080&h=1920&fit=crop",
      "https://images.unsplash.com/photo-1577643445874-a41763059685?q=80&w=1080&h=1920&fit=crop",
      "https://images.unsplash.com/photo-1681077375948-3df67cf1a95e?q=80&w=1080&h=1920&fit=crop",
      "https://images.unsplash.com/photo-1494809610410-160faaed4de0?q=80&w=1080&h=1920&fit=crop",
      "https://images.unsplash.com/photo-1658235081562-a7f50e7e05b6?q=80&w=1080&h=1920&fit=crop",
      "https://images.unsplash.com/photo-1491975474562-1f4e30bc9468?q=80&w=1080&h=1920&fit=crop",
      "https://images.unsplash.com/photo-1622470190232-81df3782484b?q=80&w=1080&h=1920&fit=crop",
      "https://images.unsplash.com/photo-1654546156234-e25e174ba602?q=80&w=1080&h=1920&fit=crop",
      "https://images.unsplash.com/photo-1616428394230-ba242d33e3ba?q=80&w=1080&h=1920&fit=crop",
      "https://images.unsplash.com/photo-1558023784-f8343393cb06?q=80&w=1080&h=1920&fit=crop",
      "https://images.unsplash.com/photo-1535905557558-afc4877a26fc?q=80&w=1080&h=1920&fit=crop",
      "https://images.unsplash.com/photo-1471974507711-fe913f4b4509?q=80&w=1080&h=1920&fit=crop",
      "https://images.unsplash.com/photo-1551485645-e499a58eab2c?q=80&w=1080&h=1920&fit=crop"
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
