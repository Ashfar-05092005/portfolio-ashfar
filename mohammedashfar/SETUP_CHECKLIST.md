# Setup & Troubleshooting Checklist

## ✅ Pre-Deployment Checklist

### Frontend (mohammedashfar/)
- [ ] Copy `.env.example` to `.env`
- [ ] Set `REACT_APP_API_URL` to your backend URL
- [ ] Run `npm install` (check for vulnerabilities)
- [ ] Test locally: `npm start`
- [ ] Build for production: `npm run build`
- [ ] All components render without errors
- [ ] Contact form validation works correctly

### Backend (servercontact/)
- [ ] Copy `.env.example` to `.env`
- [ ] Configure SMTP credentials (Gmail or Mailtrap)
- [ ] Set `FRONTEND_URL` to match your frontend domain
- [ ] Run `npm install` (check for vulnerabilities)
- [ ] Test locally: `npm start`
- [ ] Server starts on port 4000
- [ ] GET `/` returns `{"status":"ok"}`
- [ ] POST `/contact` accepts form data

## 🔍 Common Issues & Fixes

### Issue: "API URL is not configured"
**Cause:** `REACT_APP_API_URL` not set in frontend `.env`
**Fix:**
```bash
cd mohammedashfar
echo "REACT_APP_API_URL=http://localhost:4000" > .env
# Restart: npm start
```

### Issue: CORS error when submitting form
**Cause:** `FRONTEND_URL` in backend `.env` doesn't match frontend URL
**Fix:**
```bash
# Backend .env must have:
FRONTEND_URL=http://localhost:3000  # for local dev
# OR
FRONTEND_URL=https://yoursite.com   # for production (no trailing slash)
# Restart backend: npm start
```

### Issue: "Email credentials not configured"
**Cause:** SMTP_USER or SMTP_PASS not set
**Fix:**
```bash
cd servercontact
# Edit .env with valid Gmail app password or Mailtrap credentials
npm start
```

### Issue: Gmail authentication failed (EAUTH)
**Cause:** Using regular Gmail password instead of App Password
**Fix:**
1. Go to https://myaccount.google.com/security
2. Enable 2-Factor Authentication
3. Generate App Password for "Mail" on "Windows Computer"
4. Use 16-character password in `SMTP_PASS`
5. Restart backend

### Issue: "connect ETIMEDOUT"
**Cause:** SMTP_HOST or SMTP_PORT incorrect, or firewall blocking
**Fix:**
```bash
# Verify settings:
# For Gmail: SMTP_HOST=smtp.gmail.com, SMTP_PORT=587 or 465
# For Mailtrap: SMTP_HOST=smtp.mailtrap.io, SMTP_PORT=2525
```

### Issue: Phone validation always fails
**Cause:** Phone field marked required but validation expects exactly 10 digits
**Fix:** ✅ **Already Fixed** - Phone is now optional, validates only if provided

### Issue: Form inputs have wrong name attributes
**Cause:** Mismatched `name` attribute and form state
**Fix:** ✅ **Already Fixed** - All input names now match form state keys

## 📊 Testing Contact Form

### Local Testing
1. Start backend: `cd servercontact && npm start`
2. Start frontend: `cd mohammedashfar && npm start`
3. Navigate to Contact page
4. Fill form:
   - Name: "Test User"
   - Email: "test@example.com"
   - Phone: "1234567890" (optional)
   - Message: "Test message"
5. Submit and verify success message

### Email Verification
- **Gmail:** Check inbox for new message
- **Mailtrap:** Check inbox at https://mailtrap.io/dashboard

## 🚀 Deployment Steps

### Render Backend Deployment
1. Push code to GitHub
2. Create New Web Service on Render
3. Select repository and branch
4. Configure:
   - Root Directory: `servercontact`
   - Build Command: `npm install`
   - Start Command: `npm start`
5. Add Environment Variables from `.env.example`
6. Deploy

### Netlify Frontend Deployment
1. Create New Site from GitHub
2. Configure:
   - Base Directory: `mohammedashfar`
   - Build Command: `npm run build`
   - Publish Directory: `build`
3. Add Environment Variables:
   - `REACT_APP_API_URL`: Your Render API URL
4. Deploy

## 📝 Environment Variables Reference

### Frontend `.env`
```env
# Backend API endpoint (no trailing slash)
REACT_APP_API_URL=https://your-api.onrender.com
```

### Backend `.env` (Gmail)
```env
PORT=4000
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-16-char-app-password
MAIL_TO=recipient@gmail.com
FRONTEND_URL=https://your-frontend.onrender.com
```

### Backend `.env` (Mailtrap)
```env
PORT=4000
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=your-username
SMTP_PASS=your-password
MAIL_TO=any@email.com
FRONTEND_URL=https://your-frontend.onrender.com
```

## 🔄 Redeployment After Changes

### Backend Changes
```bash
cd servercontact
git add .
git commit -m "Backend update"
git push origin main
# Render auto-deploys
```

### Frontend Changes
```bash
cd mohammedashfar
git add .
git commit -m "Frontend update"
git push origin main
# Netlify auto-deploys
```

## 📞 Getting Help

If issues persist:
1. Check backend logs on Render dashboard
2. Check Netlify build logs
3. Verify all environment variables are set correctly
4. Ensure no trailing slashes in URLs (except base frontend URL)
5. Check email service status (Gmail/Mailtrap)
6. Run local test with `npm start` to isolate issue

## ✨ Recent Fixes Applied

- ✅ Phone validation made optional (validates only if provided)
- ✅ Form input names corrected (`name="name"` instead of `name="fullname"`)
- ✅ Phone field placeholder updated to "(optional)"
- ✅ Frontend `.env.example` created with documentation
- ✅ Backend `.env.example` enhanced with setup instructions
- ✅ Backend `.env` organized with comments
- ✅ PORT configuration documented in backend `.env`
