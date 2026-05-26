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
3. Set environment variables in Render. Choose Gmail or Mailtrap:

**Option A: Gmail (requires App Password)**
   - `SMTP_HOST=smtp.gmail.com` (host name, NOT a URL)
   - `SMTP_PORT=587` (port number only: 587 for STARTTLS, 465 for SSL; NOT a URL)
   - `SMTP_USER=yourgmail@gmail.com` (your Gmail address)
   - `SMTP_PASS=your_16_char_app_password` (not your normal Gmail password; see Gmail Security settings)
   - `MAIL_TO=yourgmail@gmail.com` (recipient email)
   - `FRONTEND_URL=https://ashfarm.onrender.com` (frontend URL without trailing slash)

**Option B: Mailtrap (easiest for testing)**
   - Sign up free at https://mailtrap.io
   - Go to Settings > SMTP Settings
   - Copy the SMTP Host, Port (2525), Username, Password
   - Set in Render:
     - `SMTP_HOST=smtp.mailtrap.io` (host name, NOT a URL)
     - `SMTP_PORT=2525` (port number only; NOT a URL)
     - `SMTP_USER=your_mailtrap_username`
     - `SMTP_PASS=your_mailtrap_password`
     - `MAIL_TO=any@email.com` (Mailtrap sends all mail to your inbox)
     - `FRONTEND_URL=https://ashfarm.onrender.com` (frontend URL without trailing slash)

4. Deploy and copy the API URL, for example: `https://portfolio-api.onrender.com`.

## 3. Deploy frontend (Netlify)

1. In Netlify, click **Add new site** -> **Import an existing project**.
2. Connect the same GitHub repository.
3. Set build settings:
   - Base directory: `mohammedashfar`
   - Build command: `npm run build`
   - Publish directory: `build`
4. Add environment variable in Netlify:
   - `REACT_APP_API_URL=https://portfolio-ashfar-6q39.onrender.com`
5. Deploy site.

`mohammedashfar/netlify.toml` already includes SPA redirect rules.

## 3b. Deploy frontend (Vercel)

If you deploy the frontend on Vercel instead of Netlify, add the same environment variable in your Vercel project settings:

- `REACT_APP_API_URL=https://portfolio-ashfar-6q39.onrender.com`

`mohammedashfar/vercel.json` already includes SPA rewrite rules.

## 4. Update backend CORS

After Netlify gives your site URL (for example `https://your-site.netlify.app`), update Render:

- `FRONTEND_URL=https://ashfarm.onrender.com`

Then redeploy the Render API service.

## 5. Verify online

1. Open API health URL:
   - `https://your-render-api-url.onrender.com/`
   - Expected: `{ "status": "ok" }`
2. Open your Netlify URL and submit the contact form.

## Notes

- **SMTP_PORT error**: If you see "SMTP_PORT must be a number", check Render environment variables. Common mistake: accidentally pasting a URL into SMTP_PORT instead of just the port number (e.g., use `587` not `https://something.com`).
- **SMTP troubleshooting**: Check Render logs for the debug line "SMTP Config loaded". It will show which host/port is being used.
- **Gmail issues**: If using Gmail, it must have 2FA enabled and you must use an App Password (not your normal password). Generate in Google Account > Security > App Passwords.
- **Hosting limits**: If the app still reports "Could not reach SMTP server", the host is probably blocking outbound SMTP. In that case, switch to Mailtrap for testing or use a transactional email provider that sends over HTTPS instead of raw SMTP.
- **Mailtrap is easier**: If Gmail fails, use Mailtrap (free tier, no 2FA needed).
- Free Render services can sleep when idle; first request may be slower.
- Do not commit real `.env` files or SMTP credentials.
