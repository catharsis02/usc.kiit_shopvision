# ShopVision — भारतShop

AI-powered grocery management system built for Indian franchise stores. Identifies fruits and vegetables from camera input using a fine-tuned ResNet50 model, manages per-franchise inventory in Supabase, and handles billing through a React frontend backed by a Flask inference API.

---

## Features

- **Produce recognition** — identify 140+ fruits and vegetables from a photo or live camera feed
- **Smart billing** — scan items to auto-populate bills with price lookups
- **Inventory management** — add, edit, and track stock per franchise location
- **Dashboard analytics** — per-franchise sales trends and stock insights
- **Multi-language support** — English, Hindi, and regional languages
- **Role-based access** — separate admin and franchise dashboards
- **Franchise portal** — admins create and manage franchise accounts; each franchise manages its own store independently

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui, Framer Motion |
| Backend API | Python 3.12, Flask 3, flask-cors |
| ML Model | TensorFlow 2.15–2.17, ResNet50 (transfer learning) |
| Database | Supabase (PostgreSQL) |
| Package managers | npm / bun (frontend), uv / pip (Python) |

---

## Prerequisites

- **Node.js** v18+ — [nodejs.org](https://nodejs.org)
- **Python 3.12** — [python.org](https://python.org) (or manage with [pyenv](https://github.com/pyenv/pyenv))
- **uv** (recommended) — [astral.sh/uv](https://astral.sh/uv)
- **A Supabase project** — [supabase.com](https://supabase.com) (free tier is sufficient)

---

## Setup

### 1. Clone

```bash
git clone https://github.com/catharsis02/usc.kiit_shopvision.git
cd usc.kiit_shopvision
```

### 2. Frontend

```bash
npm install
# or: bun install
```

Create `.env.local` in the project root:

```env
# Supabase — Settings → API in your project dashboard
VITE_SUPABASE_URL=https://<your-project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-key>

# Optional — lets the dev preflight auto-apply supabase/schema.sql
# Get from: supabase.com → Account → Access Tokens
SUPABASE_ACCESS_TOKEN=<your-personal-access-token>

# Points to the running Flask backend
VITE_ML_API_URL=http://localhost:5000
```

Create `.env.production` with the same variables for production builds.

### 3. Database

The schema lives in `supabase/schema.sql` and needs to be applied once.

**Automatic (recommended):** add `SUPABASE_ACCESS_TOKEN` to `.env.local`. The `npm run dev` preflight script detects whether the `franchises` table exists and applies the schema if it doesn't.

**Manual:** open your project in the [Supabase dashboard](https://supabase.com/dashboard), go to **SQL Editor**, paste the contents of `supabase/schema.sql`, and run it.

This creates three tables — `franchises`, `inventory`, and `bills` — with RLS policies granting `anon` read/write access.

> **Note:** passwords are stored in plain text in the `franchises` table. This is intentional for a demo/classroom context — do not use real credentials.

### 4. Python Backend

**With uv:**

```bash
curl -Lsf https://astral.sh/uv/install.sh | sh
uv sync
uv run main.py
```

**With pip:**

```bash
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
python main.py
```

Flask starts on **http://localhost:5000**. The ML model loads lazily on the first `/predict` request — expect a 10–30 second delay.

---

## Running

Two terminals are required: one for the frontend, one for the backend.

```bash
# Terminal 1
npm run dev

# Terminal 2
uv run main.py
```

Vite typically starts at **http://localhost:5173** or **http://localhost:8081**.

---

## Login

### Demo accounts (no database required)

| Role | Field | Value |
|---|---|---|
| Admin | Username | `admin` |
| | Password | `admin123` |
| Franchise | Email | `demo@shop.com` |
| | Password | `demo123` |

Use the **"Fill admin demo"** / **"Fill franchise demo"** buttons on the login page to auto-fill.

### Creating franchise accounts

Log in as admin, go to the Admin Dashboard, and click **Add New Franchise**. Franchises log in with the exact email and password set during creation (email comparison is case-insensitive but otherwise exact).

---

## ML Model

If `ml/artifacts/classifier.keras` is present, the backend loads it automatically. The pre-trained model covers 140+ classes from the [Fruits-360 dataset](https://www.kaggle.com/datasets/moltean/fruits).

To retrain:

```bash
# Requires Kaggle API credentials; place dataset at:
# fruit_dataset/dataset/Fruits-360_.../

python ml/scripts/train_fruit_model.py
```

A Colab-compatible notebook is available at `ml/notebooks/training.ipynb`. After training, copy the output to `ml/artifacts/classifier.keras`.

---

## API Reference

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | Status |
| GET | `/health` | Health check, includes model load status |
| GET | `/classes` | All supported class labels |
| POST | `/predict` | Predict from image (`multipart/form-data`, field: `image`) |

**Example:**

```bash
curl -X POST http://localhost:5000/predict \
  -F "image=@apple.jpg"
```

```json
{
  "success": true,
  "fruit": "Apple",
  "confidence": 97.4,
  "price": 120,
  "unit": "kg",
  "top_predictions": [
    { "fruit": "Apple", "confidence": 97.4 },
    { "fruit": "Apple Red 1", "confidence": 1.9 },
    { "fruit": "Pear", "confidence": 0.7 }
  ]
}
```

---

## Database Schema

```sql
franchises (id, franchise_name, shop_number, email, password, sales, created_at)
inventory  (id, franchise_id → franchises, product_name, quantity, price, category, created_at)
bills      (id, franchise_id → franchises, customer_name, total_amount, items JSONB, status, created_at)
```

All three tables have RLS enabled with permissive policies for `anon` and `authenticated` roles.

---

## Project Structure

```
usc.kiit_shopvision/
├── src/
│   ├── components/ui/            # shadcn/ui primitives
│   ├── contexts/
│   │   └── AuthContext.tsx       # Auth state + Supabase login logic
│   ├── features/
│   │   ├── billing/              # Billing UI and cart logic
│   │   ├── dashboard/            # Charts and stats
│   │   ├── inventory/            # Inventory CRUD
│   │   └── recognition/          # Camera + ML prediction UI
│   ├── hooks/                    # Custom hooks (useLanguage, etc.)
│   ├── lib/
│   │   ├── supabase.ts           # Supabase client and DB types
│   │   ├── authCredentials.ts    # Admin and demo credential constants
│   │   └── utils.ts
│   └── pages/
│       ├── LoginPage.tsx
│       ├── AdminDashboard.tsx
│       ├── FranchiseDashboard.tsx
│       └── Index.tsx
├── main.py                       # Flask inference API
├── ml/
│   ├── artifacts/
│   │   ├── classifier.keras      # Trained model
│   │   ├── class_names.txt       # One label per line
│   │   └── fruit_classes.json    # Class → price map
│   ├── scripts/
│   │   └── train_fruit_model.py
│   └── notebooks/
│       └── training.ipynb
├── supabase/
│   └── schema.sql
├── scripts/
│   └── check-supabase.mjs        # Preflight schema check
├── docs/
├── public/
├── pyproject.toml
├── requirements.txt
├── package.json
└── vite.config.ts
```

---

## Scripts

```bash
# Frontend
npm run dev              # Start Vite dev server (runs Supabase preflight)
npm run build            # Production build (runs Supabase preflight)
npm run preview          # Preview production build
npm run lint             # ESLint
npm run check:supabase   # Run preflight check manually

# Python
uv run main.py                         # Start Flask API
python ml/scripts/train_fruit_model.py # Train model
```

---

## Troubleshooting

**Franchise login fails despite the account existing**

Email comparison is exact (lowercased before matching). To inspect stored emails:

```sql
SELECT email, password, franchise_name FROM franchises;
```

**`npm run dev` exits during Supabase preflight**

Make sure `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set in `.env.local`. Without the access token, apply the schema manually via the SQL editor.

**`ModuleNotFoundError: tensorflow`**

```bash
source .venv/bin/activate
pip install tensorflow>=2.15.0,<2.18.0
```

**Model fails to load — architecture mismatch**

The saved model must match the TensorFlow version used at inference time. Retrain with your current version:

```bash
python ml/scripts/train_fruit_model.py
```

**Port already in use**

```bash
# Vite
npm run dev -- --port 3001

# Flask — edit the last line of main.py
app.run(host='127.0.0.1', port=5001, debug=True, use_reloader=False)
# Also update VITE_ML_API_URL=http://localhost:5001 in .env.local
```

**numpy compatibility error**

TensorFlow requires numpy below 2.0:

```bash
pip install "numpy>=1.24.0,<2.0.0"
```

---

## Python Dependencies

| Package | Purpose |
|---|---|
| `flask>=3.0` | REST API server |
| `flask-cors>=4.0` | CORS for the Vite dev server |
| `tensorflow>=2.15,<2.18` | Model inference |
| `numpy>=1.24,<2.0` | Array ops (TF-compatible) |
| `Pillow>=10.0` | Image loading and preprocessing |
| `opencv-python>=4.8` | Camera capture |
| `scikit-learn>=1.3` | ML utilities |
| `kaggle>=1.6` | Dataset download |
| `gunicorn>=21.2` | Production WSGI server (Linux/macOS) |

---

## License

MIT — see `LICENSE`.

---

## Acknowledgments

[Fruits-360 Dataset](https://www.kaggle.com/datasets/moltean/fruits) · [shadcn/ui](https://ui.shadcn.com) · [Supabase](https://supabase.com) · [TensorFlow](https://tensorflow.org) · [Framer Motion](https://www.framer.com/motion/)
