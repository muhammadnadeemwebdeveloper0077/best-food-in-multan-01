# Netlify Deployment Guide for "Best Food In Multan"
# ملتان فوڈ پورٹل کو نیٹلی فائی پر لائیو کرنے کی گائیڈ

This project is 100% pre-configured, tested, and ready for production deployment on **Netlify**.

---

## 🚀 3 Easy Ways to Deploy on Netlify

### Option 1: Drag & Drop (Easiest & Fastest — Under 1 Minute)
If you don't want to use Git or GitHub right now:
1. Run the production build command on your machine:
   ```bash
   npm run build
   ```
2. This generates a folder named `dist` containing all production-ready HTML, JS, CSS, and optimized images.
3. Open [app.netlify.com/drop](https://app.netlify.com/drop) in your web browser and sign in.
4. Drag and drop the `dist` folder into the browser window.
5. **Done!** Your website will instantly be live with a URL like `https://best-food-in-multan.netlify.app`.

---

### Option 2: Connect via GitHub / GitLab (Recommended for Automatic Updates)
Every time you push code, Netlify will automatically build and publish:
1. Initialize git and push to your GitHub repository:
   ```bash
   git init
   git add .
   git commit -m "feat: complete Best Food In Multan website"
   git branch -M main
   git remote add origin https://github.com/<your-username>/best-food-in-multan.git
   git push -u origin main
   ```
2. Log in to [Netlify Dashboard](https://app.netlify.com/).
3. Click **"Add new site"** → **"Import an existing project"**.
4. Select **GitHub** and authorize access to your repository.
5. Netlify will auto-detect the build configuration from `netlify.toml`:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
6. Click **"Deploy Site"**. Your site will be live with free SSL/HTTPS in seconds!

---

### Option 3: Netlify CLI (For Developers)
Deploy directly from your terminal:
```bash
# 1. Install CLI
npm install -g netlify-cli

# 2. Login
netlify login

# 3. Build & Deploy
npm run build
netlify deploy --prod --dir=dist
```

---

## ⚙️ What Is Pre-Configured for Netlify in This Project

1. **`netlify.toml` (Root Configuration)**:
   - Configures `npm run build` and `publish = "dist"`.
   - Single Page Application (SPA) redirect rule:
     ```toml
     [[redirects]]
       from = "/*"
       to = "/index.html"
       status = 200
     ```
     This ensures that refreshing pages or navigating between tabs never results in a 404 error on Netlify.
   - Long-term caching for static assets (`/assets/*`).
   - Production security headers (`X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`).

2. **`public/_redirects` (Backup SPA Routing)**:
   - A secondary fail-safe file that Netlify reads even during Drag-and-Drop manual uploads (`/* /index.html 200`).

3. **Production Metadata & SEO**:
   - `index.html` configured with Urdu & English bilingual titles, OpenGraph meta tags, and SVG favicon.
   - `public/robots.txt` set up for search engines.

---

## 🇵🇰 اردو میں رہنمائی (Urdu Guide)

اگر آپ اس ویب سائٹ کو **Netlify** پر لائیو چلانا چاہتے ہیں تو سب سے آسان طریقہ یہ ہے:
1. اپنے کمپیوٹر پر `npm run build` کمانڈ چلائیں، جس سے `dist` نام کا فولڈر بن جائے گا۔
2. اپنے براؤزر میں **[app.netlify.com/drop](https://app.netlify.com/drop)** کھولیں۔
3. اس `dist` فولڈر کو اٹھا کر نیٹلی فائی کی اسکرین پر چھوڑ دیں (Drag & Drop)۔
4. آپ کی ویب سائٹ فوراً ایک مفت لائیو لنک (جیسے `https://your-site.netlify.app`) پر لائیو ہو جائے گی جس پر فری SSL سرٹیفکیٹ بھی فعال ہوگا۔
