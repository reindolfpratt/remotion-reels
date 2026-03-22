# Cohby Consult - Automated Reel Generator & Publisher

This repository contains the complete A-to-Z automation system for generating, scheduling, and automatically publishing marketing videos for Cohby Consult.

## System Architecture

The automation is divided into two main environments:
1. **Local Machine (Your Computer)**: Where the videos are programmatically generated and uploaded to the cloud database.
2. **GitHub Actions (The Cloud)**: Where a schedule automatically triggers a script twice a day to post these videos to Social Media.

---

## 🚀 The A-to-Z Workflow

### Step 1: Environment Setup
Before doing anything, you need a `.env` file in the root directory (never commit this file to GitHub). It must contain:
```ini
SUPABASE_URL=https://<your-project>.supabase.co
SUPABASE_SERVICE_KEY=<your-secret-key>
IG_ACCOUNT_ID=<instagram-id>
IG_ACCESS_TOKEN=<instagram-token>
FB_PAGE_ID=<facebook-page-id>
FB_CREATIVE_FOLDER_ID=<fb-folder>
LINKEDIN_ORG_ID=<linkedin-id>
LINKEDIN_ACCESS_TOKEN=<linkedin-token>
```

*(Note: Additionally, you MUST add these exact same variables to your GitHub Repository Settings under **Settings > Secrets and variables > Actions** so the cloud publisher can access them).*

Install the project dependencies:
```bash
npm install
```

### Step 2: Preparing the Data
The script reads the video scripts, duration, and images from `src/data/week1.json`. 
- Open `week1.json` and add as many new video objects as you want.
- Provide a `durationInSeconds` (usually 16 seconds).
- Add 3 text `scenes` per video with background image URLs (we recommend using Unsplash URLs).

### Step 3: Generating the `.mp4` Files (Locally)
Once your JSON is ready, run the following command in your terminal:
```bash
npm run batch-render
```
**What this does:**
Remotion reads `week1.json` and spins up an automated browser to render out high-quality `1080x1920` `.mp4` video files. The completed videos are exported into the local `out/` folder.

### Step 4: Uploading & Scheduling (Locally)
After the `.mp4` files are fully generated in the `out/` folder, run:
```bash
node scripts/upload-week.js
```
**What this does:**
1. Wipes the pending queue in your Supabase table (`cohby_consult_content_queue`).
2. Uploads every `.mp4` file from your `out/` folder into the `content_reels` storage bucket.
3. Automatically spaces them out (scheduling 1 video every 7 days) and inserts them into the queue.

### Step 5: Automatic Publishing (The Cloud)
You don't need to do anything for this step! 
Because of the `.github/workflows/auto-publish.yml` file, GitHub will automatically boot up an invisible server **every day at 08:00 UTC and 17:00 UTC**.

When it runs:
1. It executes `node scripts/post-video.js`.
2. The script checks the Supabase `cohby_consult_content_queue` table to see if any videos are scheduled to go live today.
3. If yes, it pulls the video URL from the storage bucket and uses the Instagram Graph API and Facebook API to post the video and its respective caption directly to the page. 

---

## Troubleshooting

- **"I triggered the GitHub Action manually but it didn't post"**: Make sure you have copied all of your `.env` variables into the GitHub Repository Secrets. Without them, the action cannot authenticate with Instagram or Supabase.
- **"The video failed to render"**: Double-check your `week1.json`. If you added a fake or broken Unsplash Image URL, the renderer will freeze and throw an error.
- **"The queue insert failed"**: Ensure your Supabase database has a table named `cohby_consult_content_queue` containing the correct schema.
