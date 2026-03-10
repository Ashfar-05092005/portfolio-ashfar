# Deployment Guide (Netlify + Render API)

This repository contains:
- Frontend React app in `mohammedashfar/`
- Backend contact API in `servercontact/`

Use Netlify for frontend hosting and Render for the Node/Express API.

## 1. Push to GitHub

1. Create or use an existing GitHub repository.
2. Push this project to the repo.

## 2. Deploy backend API (Render)

1. In Render, create a new **Web Service** from your GitHub repo.
2. Configure:
   - Root Directory: `servercontact`
   - Build Command: `npm install`
   - Start Command: `npm start`
3. Set environment variables in Render:
   - `SMTP_USER`
   - `SMTP_PASS`
   - `MAIL_TO`
   - `SMTP_HOST` (for Gmail: `smtp.gmail.com`)
   - `SMTP_PORT` (usually `587`)
   - `FRONTEND_URL` (set after Netlify deploy; use your Netlify site URL)
4. Deploy and copy the API URL, for example: `https://portfolio-api.onrender.com`.

## 3. Deploy frontend (Netlify)

1. In Netlify, click **Add new site** -> **Import an existing project**.
2. Connect the same GitHub repository.
3. Set build settings:
   - Base directory: `mohammedashfar`
   - Build command: `npm run build`
   - Publish directory: `build`
4. Add environment variable in Netlify:
   - `REACT_APP_API_URL=https://your-render-api-url.onrender.com`
5. Deploy site.

`mohammedashfar/netlify.toml` already includes SPA redirect rules.

## 4. Update backend CORS

After Netlify gives your site URL (for example `https://your-site.netlify.app`), update Render:

- `FRONTEND_URL=https://your-site.netlify.app`

Then redeploy the Render API service.

## 5. Verify online

1. Open API health URL:
   - `https://your-render-api-url.onrender.com/`
   - Expected: `{ "status": "ok" }`
2. Open your Netlify URL and submit the contact form.

## Notes

- If using Gmail SMTP, use an App Password, not your normal account password.
- Free Render services can sleep when idle; first request may be slower.
- Do not commit real `.env` files or SMTP credentials.
