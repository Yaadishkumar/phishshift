# PhishShift — Message Risk Scanner

> **College Mini Project 2 • Full-Stack Cybersecurity Application**  
> A transparent, explainable message risk scanning web application designed to evaluate SMS, emails, and direct messages for smishing, suspicious links, credential theft, and scam patterns.

---

## 1. Project Overview

PhishShift is a production-ready web application built for college project presentation and deployment. It helps users safely analyze untrusted communications before clicking links or disclosing private information.

### Core Features
- **Deterministic Threat Scoring (0–100):** Calculates an auditable, transparent severity score based on established cybersecurity heuristic rules.
- **Risk Classification Tiers:** Categorizes messages into **Low Risk** (safe/informational), **Suspicious** (caution recommended), or **High Risk** (likely phishing/scam).
- **Detected Indicators Breakdown:** Identifies urgency coercion, credential harvesting lures (passwords, OTPs, PINs, CVVs), fake courier delivery scams, and financial advance-fee patterns.
- **Safe Offline Link Analysis:** Extracts enclosed hyperlinks and performs static regex inspection (checking for raw IP hosts, URL shorteners like `bit.ly`, and high-risk TLDs) without opening or visiting unknown websites.
- **Actionable Protective Advice:** Delivers clear, practical steps to protect against compromised credentials or financial loss.
- **Privacy-First Audit Log:** Stores only a 45-character sanitized preview in an SQLite database (`phishshift.db`), never retaining full messages or sensitive secrets.
- **Pluggable Machine Learning Connector:** Includes a modular interface in `backend/detector.py` ready to load a trained scikit-learn model artifact (`backend/models/phishing_model.joblib`) if available.

---

## 2. Technology Stack

- **Frontend:** React 19, Vite, clean CSS design system (light theme `#f8fafc` background, dark blue `#1d4ed8` primary, responsive layout)
- **Backend:** Python 3, Flask REST API, Flask-CORS, Gunicorn (production WSGI server)
- **Database:** SQLite (`backend/phishshift.db`)
- **Hosting / Deployment:** Render (Backend Web Service + Frontend Static Site) and GitHub

---

## 3. Project Structure

```
phishshift/
├── backend/
│   ├── app.py              # Flask REST API endpoints, CORS & production 0.0.0.0 binding
│   ├── detector.py         # Heuristic baseline engine & pluggable ML model interface
│   ├── db.py               # SQLite database manager (data minimization)
│   ├── test_backend.py     # Automated backend unit tests
│   ├── requirements.txt    # Python dependencies (flask, flask-cors, gunicorn)
│   └── .env.example        # Example backend environment variables
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx       # Navigation bar with live server status indicator
│   │   │   ├── Scanner.jsx      # Message input, character counter & inline results
│   │   │   ├── HistoryView.jsx  # SQLite scan audit log with record inspection
│   │   │   ├── AboutView.jsx    # Documentation, workflow, ML guide & limitations
│   │   │   └── Footer.jsx       # Simple attribution & educational disclaimer
│   │   ├── services/
│   │   │   └── api.js           # Production-ready API service with VITE_API_URL support
│   │   ├── App.jsx              # Main view coordinator
│   │   ├── index.css            # Clean, student-developed stylesheet
│   │   └── main.jsx             # React entrypoint
│   ├── index.html               # HTML template (Inter font, clean favicon)
│   ├── vite.config.js           # Vite dev server proxy configuration
│   ├── package.json             # Frontend dependencies & scripts
│   ├── package-lock.json        # Frontend exact dependency tree
│   ├── .env.example             # Example frontend environment variables
│   └── .gitignore               # Frontend exclusions
├── .gitignore                   # Root gitignore (node_modules, venv, cache, db, .env)
├── render.yaml                  # Render Infrastructure as Code Blueprint
├── package.json                 # Root convenience scripts for workspace build
├── requirements.txt             # Root requirements matching backend
└── README.md                    # Project documentation & deployment guide
```

---

## 4. Local Development Setup

### Prerequisites
- Python 3.10+ (tested with Python 3.14)
- Node.js 18+ and npm

### Step 1: Clone or Open the Repository
```bash
git clone https://github.com/<your-username>/phishshift.git
cd phishshift
```

### Step 2: Start the Backend (Terminal 1)
```powershell
cd backend
py -m pip install -r requirements.txt
py app.py
```
> The Flask API will start on **`http://127.0.0.1:5000`** (or `http://0.0.0.0:5000`).

### Step 3: Start the Frontend (Terminal 2)
```powershell
cd frontend
npm install
npm run dev
```
> The React application will start on **`http://localhost:5173`**.  
> In local development, requests to `/api` are automatically proxied to the Flask server.

### Running Backend Unit Tests
```powershell
cd backend
py test_backend.py
```

---

## 5. Deployment Guide: GitHub & Render

PhishShift is configured to be deployed as two decoupled services on Render from a single GitHub repository:
1. **Backend:** Python Web Service running Gunicorn.
2. **Frontend:** Static Site running the compiled React bundle.

---

### Step 1: Push Code to GitHub

1. Initialize git in the project root (if not already initialized):
   ```bash
   git init
   ```
2. Verify untracked files adhere to `.gitignore` (ensure `node_modules`, `__pycache__`, and `*.db` are ignored):
   ```bash
   git status
   ```
3. Stage and commit all files:
   ```bash
   git add .
   git commit -m "Prepare PhishShift for production deployment to Render"
   ```
4. Create a new repository on [GitHub](https://github.com/new) named `phishshift` (Public or Private).
5. Link your local repository and push:
   ```bash
   git remote add origin https://github.com/<your-username>/phishshift.git
   git branch -M main
   git push -u origin main
   ```

---

### Step 2: Deploy to Render

You can deploy using either **Option A (Automated Blueprint)** or **Option B (Manual Dashboard Setup)**.

#### Option A: One-Click Deploy via Render Blueprint (Recommended)
The repository includes a ready `render.yaml` blueprint file.
1. Log in to your [Render Dashboard](https://dashboard.render.com/).
2. Click **New +** and select **Blueprint**.
3. Connect your `phishshift` GitHub repository.
4. Render will parse `render.yaml` and configure:
   - `phishshift-backend` (Python Web Service)
   - `phishshift-frontend` (Static Site with `VITE_API_URL` linked to the backend)
5. Click **Apply**. Render will automatically build and deploy both services!

---

#### Option B: Manual Setup via Render Dashboard

If you prefer to configure services manually in the Render dashboard:

#### 1. Deploy the Backend (Python Web Service)
1. On the Render Dashboard, click **New +** > **Web Service**.
2. Select your `phishshift` repository.
3. Configure the following settings:
   - **Name:** `phishshift-backend`
   - **Region:** Choose the region closest to you (e.g., Frankfurt, Oregon, Singapore).
   - **Root Directory:** `backend`
   - **Runtime:** `Python 3`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `gunicorn app:app`
   - **Instance Type:** `Free`
4. Expand **Environment Variables** and add:
   | Key | Value | Description |
   | :--- | :--- | :--- |
   | `PORT` | `10000` | Render port (auto-injected, defaults to 10000) |
   | `FLASK_DEBUG` | `0` | Production mode |
   | `ALLOWED_ORIGINS` | `*` | Or set your frontend URL once deployed |
   | `SECRET_KEY` | *(Click 'Generate' or enter a random string)* | Production session security |
5. Click **Create Web Service**.
6. Wait for the build to finish. Copy your live backend URL (e.g., `https://phishshift-backend.onrender.com`).

---

#### 2. Deploy the Frontend (Static Site)
1. On the Render Dashboard, click **New +** > **Static Site**.
2. Select your `phishshift` repository.
3. Configure the following settings:
   - **Name:** `phishshift-frontend`
   - **Root Directory:** `frontend`
   - **Build Command:** `npm install && npm run build`
   - **Publish Directory:** `dist`
4. Expand **Environment Variables** and add:
   | Key | Value |
   | :--- | :--- |
   | `VITE_API_URL` | `https://phishshift-backend.onrender.com` *(Replace with your actual backend URL from Step 1)* |
5. Expand **Redirects/Rewrites** and add an SPA rewrite rule:
   - **Type:** `Rewrite`
   - **Source:** `/*`
   - **Destination:** `/index.html`
6. Click **Create Static Site**.
7. Once deployed, open your live frontend URL (e.g., `https://phishshift-frontend.onrender.com`).

---

## 6. API Reference

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `GET /` | GET | Root service status and health check reference |
| `GET /api/health` | GET | Operational health check returning engine status |
| `POST /api/scan` | POST | Analyzes an untrusted message; accepts `{ "message": "...", "message_type": "SMS", "save_history": true }` |
| `GET /api/history` | GET | Returns recent scan summaries from SQLite |
| `DELETE /api/history/<id>` | DELETE | Deletes an individual scan record |
| `DELETE /api/history` | DELETE | Purges all scan history records |
| `GET /api/stats` | GET | Aggregates threat counts (total, high risk, suspicious, low risk) |
| `GET /api/model-info` | GET | Specifications on the heuristic engine and ML plugin instructions |

---

## 7. Security, Privacy & Academic Integrity

- **Zero Link Execution:** The scanner never visits, resolves, or sends network requests to URLs found in messages.
- **Data Minimization:** Scan history saves only a 45-character sanitized preview. Full message bodies, passwords, or personal credentials are never stored.
- **No Hardcoded Secrets:** All secret keys and dynamic ports are read from environment variables (`SECRET_KEY`, `PORT`, `VITE_API_URL`).
- **Academic Disclaimer:** This application was developed as College Mini Project 2 for educational purposes. Automated heuristic classification can produce false positives and false negatives; users should independently verify critical security messages.
