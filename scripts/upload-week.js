require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
const weekData = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../src/data/week1.json'), 'utf8'));

const captions = {
  'kickoff-global': "70% of students wish they'd started 6 months earlier. Don't be one of them. Your global education journey starts now. 🌍🎓 #StudyAbroad #CohbyConsult #GlobalEducation",
  'why-choose': "Generic applications get generic results. Cohby Consult knows your story and builds an application around it. 📋✨ #StudyAbroad #Education #Ghana",
  'spotlight-canada': "Canada's PGWP gives you 3 years of work rights after graduation, a direct path to PR. Did you know this when you were choosing? 🍁 #StudyInCanada #CohbyConsult",
  'spotlight-uk': "The UK's 2-year Graduate Route Visa requires zero job offer. Work anywhere across the UK after you graduate. 🇬🇧 #StudyInUK #GraduateVisa",
  'personal-statement': "Admissions officers read hundreds of 'I have always been passionate about...' Every day. Start differently. Start with a story. ✍️ #PersonalStatement #StudyAbroad",
  'documents': "The #1 reason strong applicants get rejected? Incorrect or incomplete documents. Get it right the first time. 📁 #StudyAbroad #UniversityApplication",
  'visa-interview': "Ties to home country. Financial proof. Credible academic plan. Nail all three and your visa interview is already half won. 🛂 #VisaTips #StudyAbroad",
  'scholarships': "Beyond Chevening and Commonwealth, institution-level scholarships cover 30-80% of tuition with far less competition. Ask us where to look. 🎓💰 #Scholarships #StudyAbroad",
  'denmark': "Denmark and Finland offer world-class, English-taught degrees with less competition for African students. Don't overlook Scandinavia. 🇩🇰🇫🇮 #StudyInEurope",
  'austria': "Vienna: 4-time winner of the world's most liveable city. World-class degree. Lower cost. High employability across Europe. 🇦🇹 #StudyInAustria",
  'departure': "Acceptance letter received? You're on Step 3 of 12. Don't miss your enrolment deadline, visa, or housing window. 🛫 #StudyAbroad #StudentLife",
  'accommodation': "University housing fills within days of offer letters. Apply the same week. Your comfort directly affects your grades. 🏠 #StudentHousing #StudyAbroad",
  'inspiration': "Every student we've helped once sat exactly where you are. The only difference? They made one call. 📞 #Motivation #StudyAbroad #CohbyConsult",
  'consultation': "30 minutes with Cohby Consult. A personalised shortlist, a realistic timeline, and a complete plan, at zero cost. What do you have to lose? 📅 #FreeConsultation #StudyAbroad",
  'uk-life': "Adjusting to your new UK life takes time, but with the right preparation, you will thrive inside and outside the classroom. 🇬🇧 #StudyInUK",
  'scholarships': "Scholarship competition is fierce. Start early, highlight your unique leadership skills, and submit an application that demands attention. 🎓💰 #Scholarships"
};

async function uploadAll() {
  console.log('🔍 Checking existing queue for latest schedule...');
  
  let startFromNow = true;
  let baseTime = new Date();

  try {
    const { data: latestVideos, error: fetchError } = await supabase
      .from('cohby_consult_content_queue')
      .select('scheduled_at')
      .order('scheduled_at', { ascending: false })
      .limit(1);

    if (fetchError) {
      console.error('⚠️ Error fetching latest scheduled video:', fetchError.message);
    } else if (latestVideos && latestVideos.length > 0) {
      const latestDate = new Date(latestVideos[0].scheduled_at);
      if (latestDate > new Date()) {
        baseTime = latestDate;
        startFromNow = false;
        console.log(`📅 Found active queue. Future videos will be scheduled starting after the latest one: ${latestDate.toISOString()}`);
      } else {
        console.log(`📅 Latest scheduled video was in the past (${latestDate.toISOString()}). Scheduling starting from now.`);
      }
    } else {
      console.log('📅 Queue is empty. Scheduling starting from now.');
    }
  } catch (err) {
    console.error('⚠️ Unexpected error fetching latest schedule:', err.message);
  }

  const rows = [];
  let successfulIndex = 0;

  for (let i = 0; i < weekData.length; i++) {
    const video = weekData[i];
    const filename = `${video.id}.mp4`;
    const filepath = path.resolve(__dirname, `../out/${filename}`);

    if (!fs.existsSync(filepath)) {
      console.warn(`⚠️  Skipping ${filename} — file not found`);
      continue;
    }

    const fileBuffer = fs.readFileSync(filepath);
    console.log(`☁️  Uploading ${filename} (${(fileBuffer.length / 1024 / 1024).toFixed(1)} MB)...`);

    const { error: uploadError } = await supabase.storage
      .from('content_reels')
      .upload(filename, fileBuffer, { contentType: 'video/mp4', upsert: true });

    if (uploadError) {
      console.error(`❌ Upload failed for ${filename}:`, uploadError.message);
      continue;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('content_reels')
      .getPublicUrl(filename);

    // Schedule each video 12 hours apart to fit 2 per day
    let scheduledAt;
    if (startFromNow) {
      scheduledAt = successfulIndex === 0
        ? new Date(baseTime.getTime() - 5 * 60000).toISOString()
        : new Date(baseTime.getTime() + (successfulIndex * 12 * 60 * 60 * 1000)).toISOString();
    } else {
      scheduledAt = new Date(baseTime.getTime() + ((successfulIndex + 1) * 12 * 60 * 60 * 1000)).toISOString();
    }
      
    successfulIndex++;

    rows.push({
      video_id: video.id,
      status: 'pending',
      scheduled_at: scheduledAt,
      storage_url: publicUrl,
      social_caption: video.caption || `Cohby Consult 🌍 #StudyAbroad #Education`
    });

    console.log(`✅ Uploaded ${filename} (Scheduled for ${scheduledAt})`);
  }

  if (rows.length === 0) {
    console.log('⚠️ No videos were uploaded.');
    return;
  }

  const { error: insertError } = await supabase.from('cohby_consult_content_queue').insert(rows);
  if (insertError) {
    console.error('❌ Queue insert failed:', insertError.message);
  } else {
    console.log(`\n🎉 All ${rows.length} videos uploaded and queued!`);
    console.log('📅 Videos are scheduled 12 hours apart (2 per day).');
  }
}

uploadAll();
