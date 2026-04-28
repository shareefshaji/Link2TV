# Link2TV 📺

Send any URL from your phone to your TV — instantly.

## Deploy to Netlify (free, 5 min)

### Step 1 — Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/shareefshaji/Link2TV/blob/main/index.html
git push -u origin main
```

### Step 2 — Connect to Netlify

1. Go to https://netlify.com and sign up / log in
2. Click **"Add new site" → "Import an existing project"**
3. Choose **GitHub** and select your `link2tv` repo
4. Build settings (should auto-detect):
   - **Build command**: *(leave empty)*
   - **Publish directory**: `.`
5. Click **"Deploy site"**

That's it! Netlify automatically:
- Deploys `index.html` as the static frontend
- Creates serverless functions from `netlify/functions/`
- Enables Netlify Blobs for cross-device URL storage

### Step 3 — Use it

1. Open your Netlify URL on your **phone** → choose "This is my Phone"
2. Open the same URL on your **TV** → choose "This is my TV"
3. Enter the code from your phone on the TV
4. Paste any URL on your phone and hit **Send**
5. The URL appears on your TV instantly ✅

## Project structure

```
link2tv/
├── index.html                    ← Frontend (single page app)
├── netlify.toml                  ← Routes /api/* → functions
├── package.json                  ← @netlify/blobs dependency
└── netlify/
    └── functions/
        ├── ping.js               ← Health check
        ├── set.js                ← Phone stores URL
        ├── get.js                ← TV polls for URL
        └── clear.js              ← TV clears after receiving
```

## How it works

- Phone generates a random 6-digit code
- TV enters the code and polls `/api/get?code=XXXXXX` every 2.5s
- Phone POSTs the URL to `/api/set`
- Netlify Blobs stores the URL with a 5-minute TTL
- TV receives the URL and shows an "Open" button
- No login, no accounts, no database setup needed
