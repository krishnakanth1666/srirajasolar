# Deploy Sri Raja Solar to the internet (beginner guide)

This walks you from **your computer** → **GitHub** → **Render** → **srirajasolar.com** (GoDaddy).  
I cannot log in for you; follow the steps in order. Expect **1–2 hours** the first time, mostly waiting for builds and DNS.

---

## What you need before starting

| Thing | Why |
|--------|-----|
| A **GitHub** account (free) | Render pulls your code from GitHub. |
| A **Render** account (free) | Hosts your website and API. |
| Your **GoDaddy** login | To change DNS for `srirajasolar.com`. |
| This project folder on your PC | `srirajasolar_frontend` (or `solar_frontend`). |

**Important:** Your `backend/.env` file is **not** uploaded to GitHub (it is in `.gitignore`). You will type the important values again in the Render dashboard—never paste passwords in chat.

---

## Part 1 — Put your project on GitHub

### 1.1 Install Git (if you don’t have it)

1. Download **Git for Windows**: https://git-scm.com/download/win  
2. Run the installer; keep default options unless you know you need changes.  
3. Close and reopen **PowerShell** or **Command Prompt**.

### 1.2 Create a new empty repository on GitHub

1. Go to https://github.com and sign in.  
2. Click **+** → **New repository**.  
3. Name it e.g. `sriraja-solar` (any name is fine).  
4. Choose **Private** if you don’t want the code public.  
5. **Do not** add README, .gitignore, or license (your project already has files).  
6. Click **Create repository**.  
7. GitHub will show a page with commands—leave that tab open; you need the **HTTPS** URL, e.g. `https://github.com/YOUR_USERNAME/sriraja-solar.git`.

### 1.3 Open terminal in your project folder

1. In File Explorer, open your project folder (the one that contains `render.yaml`, `frontend`, `backend`).  
2. Click the address bar, type `powershell`, press Enter.  
   (Or right‑click → “Open in Terminal”.)

### 1.4 Initialize Git and push (copy each block once)

**First time only — set your name and email** (use your real GitHub email):

```powershell
git config --global user.name "Your Name"
git config --global user.email "you@example.com"
```

**If this folder is not yet a Git repo**, run:

```powershell
cd C:\Users\krish\solar_frontend
git init
git add .
git commit -m "Initial commit for deployment"
```

**Connect GitHub and push** (replace the URL with yours from step 1.2):

```powershell
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

- GitHub may ask you to log in. If it asks for a **password**, use a **Personal Access Token**, not your GitHub password:  
  GitHub → **Settings** → **Developer settings** → **Personal access tokens** → generate one with **repo** scope.

After this, refresh GitHub—you should see `frontend`, `backend`, `render.yaml`, etc.

---

## Part 2 — Deploy with Render (Blueprint)

### 2.1 Sign up and connect GitHub

1. Go to https://render.com and sign up (you can use **Sign in with GitHub**).  
2. Allow Render to access your repositories when asked.  
3. If the repo is **private**, grant Render access to that repo in GitHub:  
   **GitHub → Settings → Applications → Render** → Repository access.

### 2.2 Create the Blueprint

1. In Render Dashboard: **New +** → **Blueprint**.  
2. **Connect** the repository that contains `render.yaml`.  
3. Render should detect **`render.yaml`**.  
4. Click **Apply** (or review and apply).  

This creates **two** services:

- **`sriraja-solar-frontend`** — your Angular website (static).  
- **`sriraja-solar-backend`** — your Django API.

### 2.3 Wait for the first deploy

1. Open each service → **Logs**.  
2. Wait until the **frontend** build finishes (npm install, ng build).  
3. Wait until the **backend** build finishes (pip, migrate, gunicorn).  

**If the backend fails** on database:

- Free tier: you may need a **PostgreSQL** database on Render (**New +** → **PostgreSQL**), then in the **backend** service → **Environment** add:  
  `DATABASE_URL` = *(copy “Internal Database URL” from the Postgres dashboard)*  
- Redeploy the backend.

Copy your URLs (you will use them later):

- **Website (temporary):** something like `https://sriraja-solar-frontend.onrender.com`  
- **API:** something like `https://sriraja-solar-backend.onrender.com`

### 2.4 Point the Angular app at your API

1. On your PC, open `frontend/src/environments/environment.prod.ts`.  
2. Set `apiUrl` to your **real** API base URL, including `/api`, for example:

   `https://sriraja-solar-backend.onrender.com/api`

   (Use the exact hostname Render shows for the **backend** web service.)

3. Save, then commit and push:

```powershell
git add frontend/src/environments/environment.prod.ts
git commit -m "Set production API URL"
git push
```

Render will **rebuild** the static site automatically if auto-deploy is on.

### 2.5 Copy secrets from `.env` to Render (backend)

On your PC, open `backend/.env` **locally** (do not commit it). In Render → **sriraja-solar-backend** → **Environment**, add the same variables you use for email/SMS, for example:

- `EMAIL_HOST_USER`, `EMAIL_HOST_PASSWORD`, `DEFAULT_FROM_EMAIL`  
- `TWILIO_*` if you use SMS  
- `ADMIN_EMAIL`, `ADMIN_PHONE`  
- `DATABASE_URL` if using Postgres  

`DJANGO_SECRET_KEY`, `DEBUG`, `ALLOWED_HOSTS`, `CORS_*` may already come from the blueprint—only change them if Render or support tells you to.

Click **Save** and **Manual Deploy** → **Deploy latest commit** for the backend if needed.

---

## Part 3 — Connect www.srirajasolar.com (GoDaddy + Render)

### 3.1 Add the domain in Render (static site)

1. Render → **sriraja-solar-frontend** → **Settings** → **Custom Domains**.  
2. Click **Add Custom Domain**.  
3. Enter: **`www.srirajasolar.com`**.  
4. Render will show **DNS instructions** (usually a **CNAME**).  
   - Example: **Host / name:** `www`  
   - **Points to / value:** something Render gives you (not `srirajasolar.com`).

Optional: add **`srirajasolar.com`** (apex) if Render offers it and shows **A records** or ALIAS—follow their exact values.

### 3.2 Enter DNS in GoDaddy

1. Log in to **GoDaddy** → **My Products** → **DNS** for `srirajasolar.com`.  
2. **For `www`:**  
   - Add or edit a **CNAME** record:  
     - **Name:** `www`  
     - **Value:** paste **exactly** what Render shows (often ends with `onrender.com`).  
   - TTL: default (1 hour) is fine.  
3. Remove or avoid **conflicting** old `www` records (only one CNAME for `www`).  
4. For **apex** (`srirajasolar.com`), only add what Render specifies (A records or forwarding). If unsure, use GoDaddy **Forwarding** `http://srirajasolar.com` → `https://www.srirajasolar.com` (301).

### 3.3 Wait for SSL

- After DNS propagates, Render will verify the domain and issue **HTTPS** automatically (free certificate).  
- This can take **15 minutes to 48 hours** (often under 1 hour).

### 3.4 Check CORS (if the contact form fails after going live)

Backend environment should allow your **exact** site origins (no trailing slash):

- `https://www.srirajasolar.com`  
- `https://srirajasolar.com`  

Your `render.yaml` already includes these plus the default Render frontend URL. If you **rename** the static service, update `CORS_ALLOWED_ORIGINS` and `CSRF_TRUSTED_ORIGINS` in the Render dashboard to match.

---

## Part 4 — Quick tests

1. Open `https://www.srirajasolar.com` — site should load with a **padlock**.  
2. Scroll to **Contact**, submit a test message — should succeed (or show a clear error).  
3. Open `https://sriraja-solar-backend.onrender.com/api/slider-images/` in the browser — should return JSON (not a 404 for the whole API).

---

## If something breaks

| Symptom | What to check |
|--------|----------------|
| **Git push failed** | GitHub token, remote URL, internet. |
| **Render build failed (frontend)** | Logs: Node/npm errors; run `npm run build` locally in `frontend`. |
| **Render build failed (backend)** | Logs: missing `DATABASE_URL`, migration error, `requirements.txt`. |
| **Site shows but form errors** | Backend `CORS_ALLOWED_ORIGINS`, `apiUrl` in `environment.prod.ts`, backend running. |
| **Domain not verifying** | GoDaddy CNAME must match Render exactly; remove duplicates. |

---

## Short checklist

- [ ] Git installed, project pushed to GitHub  
- [ ] Render Blueprint applied; frontend + backend **Live**  
- [ ] `environment.prod.ts` has correct `apiUrl`; pushed  
- [ ] Backend env vars (email, DB) set on Render  
- [ ] Custom domain `www.srirajasolar.com` added on Render  
- [ ] GoDaddy DNS CNAME for `www` points to Render  
- [ ] HTTPS works; contact form tested  

You can print this file or keep it open while you work through each part.
