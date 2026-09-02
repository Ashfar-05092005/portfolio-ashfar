# 🚀 Quick Start Guide (5 Minutes)

## Prerequisites
- Node.js installed (v14+)
- Gmail account with 2FA enabled OR Mailtrap account
- Terminal/Command Prompt

## 1️⃣ Backend Setup (2 minutes)

```bash
cd servercontact
npm install
cp .env.example .env
```

**Edit `servercontact/.env`** with your email service:

### Gmail Option (Recommended)
1. Go to https://myaccount.google.com/apppasswords
2. Select "Mail" and "Windows Computer"
3. Copy 16-character password
4. Update `servercontact/.env`:
```env
SMTP_USER=your-email@gmail.com
SMTP_PASS=paste-your-16-char-password
MAIL_TO=your-email@gmail.com
```

### Mailtrap Option
1. Sign up at https://mailtrap.io
2. Copy SMTP credentials from Settings > SMTP Settings
3. Update `servercontact/.env`:
```env
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=your-mailtrap-username
SMTP_PASS=your-mailtrap-password
```

**Start backend:**
```bash
npm start
# You should see: "Server is running on port 4000"
```

---

## 2️⃣ Frontend Setup (2 minutes)

**In a new terminal:**
```bash
cd mohammedashfar
npm install
cp .env.example .env
```

**No changes needed to `.env`** (localhost:4000 is default)

**Start frontend:**
```bash
npm start
# Browser will open to http://localhost:3000
```

---

## 3️⃣ Test Contact Form (1 minute)

1. Click "Contact" in navigation
2. Fill the form:
   - Name: Your Name
   - Email: your@email.com
   - Phone: 1234567890 (optional)
   - Message: Test message
3. Click "Send Message"
4. Success! ✅

---

## 📧 Verify Email Received

### Gmail
Check your inbox for the email

### Mailtrap
1. Go to https://mailtrap.io/dashboard
2. Check "Inbox" for the email

---

## 🆘 Quick Troubleshooting

### "API URL is not configured"
```bash
# Frontend .env should have:
REACT_APP_API_URL=http://localhost:4000
```

### "Email credentials not configured" 
```bash
# Backend .env should have:
SMTP_USER=your-email
SMTP_PASS=your-app-password
MAIL_TO=recipient-email
```

### "Cannot connect to database" or SMTP errors
- Verify backend is running: `npm start` in `servercontact/`
- Check backend logs for specific error
- See full troubleshooting in `SETUP_CHECKLIST.md`

---

## 📚 More Information

- **Detailed Setup:** See `README.md`
- **All Issues Fixed:** See `FIXES_APPLIED.md`
- **Deployment:** See `DEPLOYMENT.md`
- **Troubleshooting:** See `SETUP_CHECKLIST.md`

---

## ✨ You're All Set!

Your MERN portfolio app is running. Now you can:
- Customize the design in `mohammedashfar/src/`
- Add more functionality to the backend
- Deploy to Netlify + Render (see `DEPLOYMENT.md`)

Happy coding! 🎉
