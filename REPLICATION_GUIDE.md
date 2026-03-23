# Replication Guide: Automated Video Publishing System

This guide explains how to set up this system for a new client or project from scratch.

## 1. Prerequisites
- **GitHub Account**: To host the code and run the "Auto-Publish" actions.
- **Supabase Account**: For the database and video file storage.
- **Meta Developer Account**: To access the Instagram Graph API.
- **Node.js installed**: To run the generator and uploader locally.

## 2. Sharing the Code
Since your repository is **Private**, you have three main ways to share it:
1.  **Invite as Collaborator**: Go to **Settings > Collaborators** in your GitHub repo and add their username. They can then clone it normally.
2.  **Zip Archive**: You can ZIP up the entire folder (except for `node_modules`, `out/`, and `.env`) and send it to them.
3.  **Template Repository**: Go to **Settings > General** and check the box **"Template repository"**. This allows you to create a "New Repo" for a client using this one as a starting point.

---

## 3. Infrastructure Setup

### Supabase (Database & Storage)
1.  **Create a Project**: Start a new project in Supabase.
2.  **Create Storage Bucket**: Create a public bucket named `content_reels`.
3.  **Create the Table**: Run this SQL in the Supabase SQL Editor to create the queue:
    ```sql
    CREATE TABLE cohby_consult_content_queue (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      video_id TEXT NOT NULL,
      storage_url TEXT NOT NULL,
      social_caption TEXT,
      status TEXT DEFAULT 'pending',
      scheduled_at TIMESTAMPTZ NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
    ```

### Meta (Instagram & Facebook)
1.  **Link Accounts**: Ensure the target professional Instagram account is linked to a Facebook Page.
2.  **Developer App**: Create an "Other" type app in the [Meta Developer Portal](https://developers.facebook.com/).
3.  **Get ID and Token**: 
    - Use the **Graph API Explorer** to find your `IG_ACCOUNT_ID`.
    - Generate a **System User Token** or a long-lived **Page Access Token** with `instagram_basic`, `instagram_content_publish`, and `pages_show_list` permissions.

---

## 3. Code & Configuration

1.  **Clone the Repository**: Clone this project and run `npm install`.
2.  **Environment Variables**: Create a `.env` file locally and add these variables to [GitHub Repository Secrets](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions):
    - `SUPABASE_URL`: Your Supabase Project URL.
    - `SUPABASE_SERVICE_KEY`: Your Supabase `service_role` key.
    - `IG_ACCOUNT_ID`: Your Instagram Professional Account ID.
    - `IG_ACCESS_TOKEN`: The token you generated in Step 2.
    - `LINKEDIN_ACCESS_TOKEN` / `LINKEDIN_ORG_ID`: (Optional).

3.  **Video Content**: 
    - Edit `src/data/week1.json` with your custom scripts and background image URLs.
    - Customize the branding/colors in `src/DynamicReelComposition.tsx`.

---

## 4. The Execution Cycle

### The One-Click Weekly Workflow
Every week, simply run:
```bash
npm run start-week
```
**What this does automatically:**
1.  **Generate**: AI creates 14 fresh video scripts (2 per day).
2.  **Render**: Your computer turns them into .mp4 files.
3.  **Upload**: The scripts are uploaded to Supabase and scheduled 12 hours apart.

### Original Local Steps (Manual)
If you prefer to run things individually:
1.  **Render**: Run `npm run batch-render`.
2.  **Upload**: Run `node scripts/upload-week.js`.

### Automated Publishing
1.  **Github Action**: Once the items are in the Supabase table, the GitHub Action (`.github/workflows/auto-publish.yml`) will automatically run twice a day (or whenever you trigger it manually).
2.  **The Engine**: It runs `scripts/post-video.js`, which picks the next scheduled video and posts it to Instagram.

---

## Troubleshooting
- **Token Expired**: If the Action fails with an "expired token" error, generate a new one in the Meta portal and update the GitHub secret.
- **Render Fails**: Usually due to a broken or slow Unsplash image URL in the JSON.
