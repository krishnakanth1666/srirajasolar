# Sri Raja Solar Energy Systems

A modern, production-ready full-stack web application for Sri Raja Solar Energy Systems, featuring a beautiful UI with interactive testimonials and contact form.

## 🚀 Features

- **Interactive Image Slider** - Auto-rotating image carousel with navigation
- **Interactive Testimonials** - Animated customer testimonials carousel with star ratings
- **Contact Form** - Beautiful gradient-styled form with validation
- **Google Maps Integration** - Interactive map showing company location
- **Responsive Design** - Mobile-friendly across all devices
- **Modern UI/UX** - Gradient backgrounds, smooth animations, and professional styling

## 📁 Project Structure

```
.
├── frontend/          # Angular frontend application
│   └── src/
│       ├── app/       # Main application components
│       └── assets/    # Images and static files
└── backend/           # Django backend application
    ├── contact/       # Contact app with models and APIs
    ├── media/         # Uploaded media files
    └── images_to_add/ # Place new images here
```

## 🛠️ Quick Start

### Prerequisites
- Node.js (v16 or higher)
- Python 3.9+
- npm or yarn

### Installation

1. **Backend Setup**
   ```bash
   cd backend
   python -m venv venv
   venv\Scripts\activate  # Windows
   pip install -r requirements.txt
   python manage.py migrate
   ```

2. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   ```

### Running the Application

**Option 1: Use Startup Scripts**
- Double-click `start-all.bat` (Windows)
- Or run `.\start-all.ps1` (PowerShell)

**Option 2: Manual Start**

**Backend:**
```bash
cd backend
venv\Scripts\activate
python manage.py runserver
```

**Frontend:**
```bash
cd frontend
npm start
```

## 📝 Adding Images

1. Place your images in `backend/images_to_add/`
2. Run `backend/add-images.bat` or:
   ```bash
   cd backend
   venv\Scripts\python.exe process_images_now.py
   ```
3. Restart frontend server to see new images

## 🎨 Production deployment (host the site)

### Option A — Render (recommended, single repo)

The repo root [`render.yaml`](render.yaml) defines:

1. **Static site** `sriraja-solar-frontend` — builds `frontend/` and serves the Angular app with an SPA rewrite to `index.html` and security headers (HTTPS/HSTS is enforced once TLS is enabled on the service).
2. **Web service** `sriraja-solar-backend` — Django API. [`render.yaml`](render.yaml) sets `CORS_ALLOWED_ORIGINS` / `CSRF_TRUSTED_ORIGINS` to **`https://www.srirajasolar.com`**, **`https://srirajasolar.com`**, and the default Render static URL so the contact form works with your GoDaddy domain.

**Steps:** In [Render Dashboard](https://dashboard.render.com) → **New** → **Blueprint** → connect this Git repo and apply. Set secrets in the dashboard as needed (`DATABASE_URL` for Postgres, email, Twilio, etc.). Keep `frontend/src/environments/environment.prod.ts` `apiUrl` pointed at your API (e.g. `https://sriraja-solar-backend.onrender.com/api`).

### Option B — Netlify (frontend) + Render (API)

1. **Netlify:** New site from repo; it will use [`netlify.toml`](netlify.toml) (`base = frontend`, `publish = dist/contact-geo-frontend`, SPA redirect).
2. **Backend:** On Render, set `CORS_ALLOWED_ORIGINS` and `CSRF_TRUSTED_ORIGINS` to include `https://www.srirajasolar.com`, `https://srirajasolar.com`, and any Netlify URL you still use, comma-separated.

### Custom domain & HTTPS (`www.srirajasolar.com`, GoDaddy)

TLS certificates are **free and automatic** on [Render](https://render.com/docs/custom-domains) and [Netlify](https://docs.netlify.com/domains-https/custom-domains/) after DNS is correct—you do not buy a separate SSL certificate for the site on those platforms.

1. **In Netlify or Render (where the Angular app is hosted):** open the static site → **Custom domains** → add **`www.srirajasolar.com`** (and optionally **`srirajasolar.com`**). Copy the DNS targets they show (usually a **CNAME** for `www` pointing to something like `xxx.netlify.app` or `xxx.onrender.com`).
2. **In GoDaddy:** DNS management for `srirajasolar.com`:
   - Create a **CNAME** record: **Host** `www` → **Points to** the hostname Netlify/Render gave you (often `@` is not used for CNAME on apex).
   - For the **apex** (`srirajasolar.com`): use your host’s recommended **A/ALIAS/ANAME** records, or GoDaddy **domain forwarding** to `https://www.srirajasolar.com` (301).
3. Wait for DNS to propagate, then finish verification in Netlify/Render; **HTTPS** will turn on automatically.
4. **Render API env:** If your static site name on Render is not `sriraja-solar-frontend`, update `CORS_ALLOWED_ORIGINS` / `CSRF_TRUSTED_ORIGINS` in the dashboard to match every origin users open in the browser (always `https://…`, no trailing slash).

### Local production build

```bash
cd frontend
npm run build
```

Output: `frontend/dist/contact-geo-frontend/`. Production API base URL is set in `frontend/src/environments/environment.prod.ts`.

## 🔧 Configuration

### Environment Variables (Backend `.env`)
```env
DEBUG=False
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
DJANGO_SECRET_KEY=your-secret-key-here
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=your-twilio-phone
ADMIN_EMAIL=admin@srirajasolar.com
ADMIN_PHONE=+919876543210
```

### Frontend Environment
- Development: `frontend/src/environments/environment.development.ts`
- Production build: `frontend/src/environments/environment.prod.ts` (replaces `environment.ts` when you run `ng build`)

## 📱 API Endpoints

- `GET /api/contacts/` - List all contacts
- `POST /api/create-contact/` - Create a new contact
- `GET /api/slider-images/` - Get slider images

## 🎯 Key Features

### Interactive Testimonials
- Auto-rotating carousel (6 seconds per testimonial)
- Navigation arrows and indicator dots
- Star ratings display
- Smooth fade transitions

### Contact Form
- Real-time validation
- Beautiful gradient styling
- Animated submit button
- Success/error message animations

### Image Slider
- Auto-advancing slideshow
- Smooth transitions
- Navigation controls
- Indicator dots

## 📄 License

© 2023 Sri Raja Solar Energy Systems. All Rights Reserved.
