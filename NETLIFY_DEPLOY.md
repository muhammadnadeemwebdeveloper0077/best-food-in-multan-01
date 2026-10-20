# Deploying "Best Food In Multan" to Netlify

This project is fully configured and optimized for Netlify deployment with Vite and React.

---

### Method 1: Git Integration (Recommended - Automatic Continuous Deployment)

1. **Push your code to GitHub / GitLab / Bitbucket**:
   ```bash
   git init
   git add .
   git commit -m "Best Food In Multan - Ready for Netlify"
   git branch -M main
   git remote add origin https://github.com/<your-username>/<your-repo-name>.git
   git push -u origin main
   ```

2. **Connect to Netlify**:
   - Log in to your [Netlify Dashboard](https://app.netlify.com/).
   - Click **"Add new site"** -> **"Import an existing project"**.
   - Choose your Git provider (GitHub, GitLab, etc.) and select this repository.

3. **Verify Build Settings** (Auto-detected via `netlify.toml`):
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
   - **Functions directory**: *(None required)*

4. **Click "Deploy Site"**:
   - Netlify will build the application in under a minute and provide a live URL (e.g. `https://your-site-name.netlify.app`).
   - Every time you `git push`, Netlify will automatically build and deploy new changes.

---

### Method 2: Netlify CLI (Fast Command-Line Deploy)

1. Install Netlify CLI globally:
   ```bash
   npm install -g netlify-cli
   ```

2. Log in and initialize:
   ```bash
   netlify login
   netlify init
   ```

3. Deploy to production:
   ```bash
   npm run build
   netlify deploy --prod --dir=dist
   ```

---

### Method 3: Drag & Drop Manual Deploy

1. Build the production bundle locally:
   ```bash
   npm run build
   ```
2. Log in to [Netlify](https://app.netlify.com/drop).
3. Drag and drop the generated `dist` folder into the Netlify upload zone. Your site will go live immediately!

---

### What Has Been Pre-Configured for Netlify:

1. **`netlify.toml`**:
   - Automatically instructs Netlify to run `npm run build` and serve from `dist`.
   - Adds SPA redirect rule (`/* -> /index.html 200`) so refreshing any view never produces a 404.
   - Configures immutable caching for `/assets/*` for fast load times.
   - Adds essential security headers (`X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`).

2. **`public/_redirects`**:
   - Secondary fail-safe rewrite rule ensuring SPA routing works seamlessly on Netlify even with manual folder uploads.

3. **`public/robots.txt`**:
   - Enables standard search engine crawling.
