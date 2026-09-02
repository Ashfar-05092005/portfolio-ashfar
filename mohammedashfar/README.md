# Mohammed Ashfar Portfolio - MERN Stack

A full-stack portfolio website built with React, Express, Node.js, and featuring a contact form with email functionality.

## 📁 Project Structure

```
mohammedashfar/
├── mohammedashfar/         # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── App.js
│   │   ├── index.js
│   │   └── ...
│   ├── public/             # Static assets
│   ├── package.json
│   ├── .env                # Frontend environment variables
│   └── .env.example        # Template for .env
└── servercontact/          # Express backend API
    ├── Index.js            # Server entry point
    ├── package.json
    ├── .env                # Backend environment variables
    └── .env.example        # Template for .env
```

## 🚀 Quick Start

### Frontend Setup

```bash
cd mohammedashfar
npm install
```

**Configure `.env`:**
```bash
cp .env.example .env
# Edit .env and set REACT_APP_API_URL to your backend API URL
```

**Run locally:**
```bash
npm start
```

The app will open at `http://localhost:3000`

### Backend Setup

```bash
cd servercontact
npm install
```

**Configure `.env`:**
```bash
cp .env.example .env
# Edit .env with your SMTP credentials and frontend URL
```

**Run locally:**
```bash
npm start
```

Server runs on port 4000 (configurable via PORT env var)

## ⚙️ Configuration

### Frontend Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `REACT_APP_API_URL` | Backend API URL (no trailing slash) | `http://localhost:4000` or `https://api.example.com` |

### Backend Environment Variables

#### Option A: Gmail (Recommended)
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-16-char-app-password
MAIL_TO=recipient@gmail.com
FRONTEND_URL=https://your-frontend-domain.onrender.com
PORT=4000
```

**Setup Steps:**
1. Enable 2-Factor Authentication on your Gmail account
2. Generate an App Password at: https://myaccount.google.com/apppasswords
3. Use the 16-character password (spaces will be stripped automatically)

#### Option B: Mailtrap (Best for Testing)
```env
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=your_mailtrap_username
SMTP_PASS=your_mailtrap_password
MAIL_TO=any@email.com
FRONTEND_URL=https://your-frontend-domain.onrender.com
PORT=4000
```

**Setup:** Sign up free at https://mailtrap.io

## 🔧 Contact Form Validation

The contact form validates:
- ✓ Name (required)
- ✓ Email (required, valid format)
- ✓ Phone (optional, must be 10 digits if provided)
- ✓ Message (required)

## 📧 Email Handling

The backend uses a multi-strategy email delivery approach:
1. **SendGrid API** (if `SENDGRID_API_KEY` is configured) - most reliable for hosted services
2. **SMTP (Nodemailer)** - fallback to direct SMTP
   - Attempts multiple ports for Gmail (587, 465)
   - Automatic fallback to local file storage if SMTP fails

Failed submissions are logged to `failed_submissions.log` for later retry.

## 🌐 Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions:
- Frontend deployment on Netlify
- Backend deployment on Render
- Environment variable setup

## 📋 Troubleshooting

### Contact Form Not Submitting

1. **Check API URL:**
   - Frontend: Verify `REACT_APP_API_URL` in `.env`
   - Backend: Verify `FRONTEND_URL` in `.env` matches your frontend domain

2. **Email Not Sending:**
   - Verify SMTP credentials are correct
   - Check logs for specific error messages
   - For Gmail: Ensure 2FA is enabled and using App Password (not regular password)
   - For Mailtrap: Check port is 2525 (not 587)

3. **CORS Errors:**
   - Ensure `FRONTEND_URL` in backend `.env` is correct
   - No trailing slashes in the URL

4. **Port Issues:**
   - Backend defaults to port 4000 if PORT env var not set
   - Ensure port is not in use on local machine

## 🔐 Security Notes

- Never commit `.env` files with real credentials
- Use `.env.example` as template
- For production: Use environment-specific secrets management
- Gmail App Passwords: Generate unique password per app/service
- Mailtrap: Free tier includes 500 monthly emails

## 📝 Recent Fixes

- ✅ Fixed phone number validation (now optional, only validates if provided)
- ✅ Fixed form input name attributes for consistency
- ✅ Added `.env.example` templates for both frontend and backend
- ✅ Added PORT configuration to backend `.env`
- ✅ Improved `.env.example` documentation

## 📞 Support

For email configuration issues, check:
- [Gmail Security Settings](https://myaccount.google.com/security)
- [Mailtrap Documentation](https://mailtrap.io/blog/)
- Backend logs: Check console output for SMTP error codes

## 📄 License

ISC
