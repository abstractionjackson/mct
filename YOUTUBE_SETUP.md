# YouTube Integration Setup

To use the YouTube integration feature, you need to set up Google OAuth credentials.

## ⚠️ Important: Must Use Local Server

**You cannot open the HTML file directly in your browser** (`file://` protocol). Google OAuth requires a proper HTTP origin.

### Quick Start - Run Local Server:
```bash
# In the project directory:
python3 -m http.server 8000

# Then open in browser:
# http://localhost:8000
```

## Setup Steps

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/

2. **Create a New Project** (or use existing)
   - Click "Select a project" → "New Project"
   - Give it a name like "Media Happiness Tracker"

3. **Enable YouTube Data API v3**
   - Go to "APIs & Services" → "Library"
   - Search for "YouTube Data API v3"
   - Click it and press "Enable"

4. **Create OAuth 2.0 Credentials**
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth client ID"
   - If prompted, configure consent screen:
     - Choose "External" user type
     - Fill in app name, user support email, and developer contact
     - Add scope: `../auth/youtube.readonly`
   - Application type: "Web application"
   - Add authorized JavaScript origins:
     - `http://localhost:8000` (for local testing)
     - `https://yourusername.github.io` (for GitHub Pages)
   - Click "Create"

5. **Get Your Credentials**
   - Copy the **Client ID**
   - Copy the **API Key** (if separate)

6. **Update youtube.js**
   - Open `youtube.js`
   - Replace `YOUR_CLIENT_ID` with your actual Client ID
   - Replace `YOUR_API_KEY` with your actual API Key

7. **Test Locally**
   - Run a local server: `python3 -m http.server 8000`
   - Open: `http://localhost:8000`
   - Try the YouTube integration

## Usage

### From Dashboard
1. Click "Sync YouTube" button
2. Authorize the app if not already connected
3. Select videos from today you want to import
4. Click "Import Selected"

### From Integrations Page
1. Click "Integrations" in navbar
2. Click "Connect YouTube"
3. Authorize the app
4. Return to dashboard to sync

## Notes

- Only videos watched **today** are fetched
- Videos are imported as "Video" type media entries
- Thumbnails are automatically added to sources
- Duration is extracted from YouTube metadata
- You can disconnect anytime from the Integrations page

## Privacy

- Only read-only access to YouTube data
- No data is sent to external servers
- All data stored locally in your browser
