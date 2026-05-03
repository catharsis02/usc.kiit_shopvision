# 🛒 ShopVision — भारतShop

> **AI-powered grocery management system** for Indian franchise stores.  
> Features fruit/vegetable recognition via a trained ResNet50 model, real-time inventory management, AI-assisted billing, and a role-based admin/franchise portal backed by Supabase.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🤖 **AI Recognition** | Identify fruits & vegetables from camera/image using a ResNet50 ML model |
| 🧾 **Smart Billing** | Auto-fill bills by scanning products — price lookup included |
| 📦 **Inventory Management** | Add, edit, and track stock per franchise |
| 📊 **Dashboard Analytics** | Sales trends and inventory insights per franchise |
| 🌐 **Multi-language** | English, Hindi, and regional language support |
| 🔐 **Role-based Auth** | Separate admin and franchise dashboards |
| 🏪 **Franchise Portal** | Admin can add/edit/delete franchises; each franchise manages its own store |

---

## 🧰 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui, Framer Motion |
| **Backend API** | Python 3.12, Flask 3, flask-cors |
| **ML Model** | TensorFlow 2.15–2.17, ResNet50 (transfer learning) |
| **Database** | Supabase (PostgreSQL) |
| **Package Manager** | npm / bun (frontend), uv / pip (Python) |

---

## 📋 Prerequisites

Before you begin, make sure you have:

- **Node.js** v18 or higher — [nodejs.org](https://nodejs.org)
- **Python 3.12** — [python.org](https://python.org) (or use [pyenv](https://github.com/pyenv/pyenv))
- **uv** (recommended) — [astral.sh/uv](https://astral.sh/uv) — or plain `pip`
- **A Supabase project** — [supabase.com](https://supabase.com) (free tier works)

---

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/catharsis02/usc.kiit_shopvision.git
cd usc.kiit_shopvision
```

---

### 2. Frontend Setup

#### Install Node dependencies

```bash
npm install
# or, if you prefer bun:
bun install
```

#### Configure Environment Variables

Create a `.env.local` file in the project root:

Create a `.env.production` file for production use.

```env
# Required — get these from your Supabase project settings → API
VITE_SUPABASE_URL=https://<your-project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-or-publishable-key>

# Optional — allows the dev preflight to auto-apply supabase/schema.sql
# Get this from: supabase.com → Account → Access Tokens
SUPABASE_ACCESS_TOKEN=<your-personal-access-token>

# ML API — points to the running Flask backend
VITE_ML_API_URL=http://localhost:5000
```

> **Where to find your Supabase keys:**  
> Go to [supabase.com/dashboard](https://supabase.com/dashboard) → your project → **Settings → API**.  
> Copy the **Project URL** and the **anon / public** key.

---

### 3. Database Setup (Supabase)

The schema lives in `supabase/schema.sql`. You need to apply it to your Supabase project exactly once.

#### Option A — Automatic (recommended)

If you add `SUPABASE_ACCESS_TOKEN` to `.env.local`, the `npm run dev` preflight script will detect if the `franchises` table is missing and apply the schema automatically.

#### Option B — Manual (Supabase SQL Editor)

1. Open [supabase.com/dashboard](https://supabase.com/dashboard) → your project
2. Click **SQL Editor** in the left sidebar
3. Paste the entire contents of `supabase/schema.sql`
4. Click **Run**

This creates:
- `franchises` — stores franchise accounts (email + plain-text password + shop info)
- `inventory` — per-franchise product stock
- `bills` — billing transactions (JSONB line items)
- Row Level Security (RLS) policies allowing `anon` read/write access

> ⚠️ **Important:** The app stores passwords in **plain text** in the `franchises` table. This is intentional for a demo/classroom project. Do **not** use real passwords.

---

### 4. Python Backend Setup

The Flask API (`main.py`) handles ML inference. It loads the model lazily on the first `/predict` request.

#### Using `uv` (recommended — fast)

```bash
# Install uv if you don't have it
curl -Lsf https://astral.sh/uv/install.sh | sh

# Create a virtual environment and install dependencies
uv sync

# Run the backend
uv run main.py
```

#### Using plain `pip`

```bash
python -m venv .venv
source .venv/bin/activate       # Windows: .venv\Scripts\activate
pip install -r requirements.txt
python main.py
```

The Flask API will start on **http://localhost:5000**.

---

## ▶️ Running the Application

Open **two terminals** — one for the frontend, one for the backend.

#### Terminal 1 — Frontend

```bash
npm run dev
```

Vite dev server starts (usually at **http://localhost:5173** or **http://localhost:8081**).

#### Terminal 2 — Backend (ML API)

```bash
uv run main.py
# or: python main.py
```

Flask API starts at **http://localhost:5000**.

> The ML model (`ml/artifacts/classifier.keras`) is loaded **on the first prediction request**, not at startup. Expect a ~10–30 second delay on the first scan.

---

## 🔑 Login Credentials

### Built-in Demo Accounts (no database needed)

These work even without Supabase configured:

| Role | Field | Value |
|---|---|---|
| **Admin** | Username | `admin` |
| | Password | `admin123` |
| **Franchise (demo)** | Email | `demo@shop.com` |
| | Password | `demo123` |

> Click **"Fill admin demo"** or **"Fill franchise demo"** on the login page to auto-fill.

### Real Franchise Accounts (from Supabase)

1. Log in as **Admin** (`admin` / `admin123`)
2. Go to the **Admin Dashboard**
3. Click **"Add New Franchise"**
4. Fill in franchise name, shop number, email, and a password
5. The franchise can now log in using those exact credentials

> 🔍 **Tip:** If a franchise login fails even though the user exists in Supabase — double-check the exact email stored. The email must match character-for-character (it is lowercased before comparison).

---

## 🤖 ML Model

### Using the Pre-trained Model

If `ml/artifacts/classifier.keras` exists, the backend loads it automatically. No training needed.

The model supports **140+ fruit and vegetable classes** from the [Fruits-360 dataset](https://www.kaggle.com/datasets/moltean/fruits).

### Training / Retraining the Model

See `docs/training.md` for the full Kaggle dataset download steps.

```bash
# Download the dataset from Kaggle (requires Kaggle API credentials)
# Place it at: fruit_dataset/dataset/Fruits-360_.../

# Train the model
python ml/scripts/train_fruit_model.py
```

Or use the Jupyter notebook:
- `ml/notebooks/training.ipynb` — Google Colab-compatible training workflow

After training, copy the output model to `ml/artifacts/classifier.keras`.

---

## 📁 Project Structure

```
usc.kiit_shopvision/
│
├── src/                          # React frontend source
│   ├── components/               # Shared UI components
│   │   └── ui/                   # shadcn/ui primitives
│   ├── contexts/
│   │   └── AuthContext.tsx       # Auth state + Supabase login logic
│   ├── features/
│   │   ├── billing/              # Billing UI and cart logic
│   │   ├── dashboard/            # Dashboard charts & stats
│   │   ├── inventory/            # Inventory CRUD
│   │   └── recognition/          # Camera + ML prediction UI
│   ├── hooks/                    # Custom React hooks (useLanguage, etc.)
│   ├── lib/
│   │   ├── supabase.ts           # Supabase client + DB types
│   │   ├── authCredentials.ts    # Admin & demo credentials constants
│   │   └── utils.ts
│   └── pages/
│       ├── LoginPage.tsx         # Login with admin/franchise tabs
│       ├── AdminDashboard.tsx    # Franchise management (admin only)
│       ├── FranchiseDashboard.tsx# Inventory, billing, recognition
│       └── Index.tsx
│
├── main.py                       # Flask ML inference API
├── ml/
│   ├── artifacts/
│   │   ├── classifier.keras      # Trained ResNet50 model
│   │   ├── class_names.txt       # One class label per line
│   │   └── fruit_classes.json    # Class → price map
│   ├── scripts/
│   │   └── train_fruit_model.py  # Training script
│   └── notebooks/
│       └── training.ipynb        # Colab training notebook
│
├── supabase/
│   └── schema.sql                # Full DB schema + RLS policies
│
├── scripts/
│   └── check-supabase.mjs        # Preflight: auto-applies schema if missing
│
├── docs/                         # Additional documentation
├── public/                       # Static assets
├── .env.local                    # Local env vars (not committed)
├── .env.production               # Production env vars (not committed)
├── pyproject.toml                # Python project metadata (uv/pip)
├── requirements.txt              # Python dependencies
├── package.json                  # Node dependencies & scripts
└── vite.config.ts                # Vite configuration
```

---

## 📡 API Endpoints (Flask Backend)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | API index / status |
| `GET` | `/health` | Health check — reports model load status |
| `GET` | `/classes` | List all supported fruit/vegetable classes |
| `POST` | `/predict` | Predict from image — multipart form field `image` |

### Example: Predict from curl

```bash
curl -X POST http://localhost:5000/predict \
  -F "image=@/path/to/apple.jpg"
```

Response:
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

## 🗄️ Database Schema

Three tables, all with RLS enabled and permissive policies for `anon`/`authenticated` roles:

```sql
franchises (id, franchise_name, shop_number, email, password, sales, created_at)
inventory  (id, franchise_id → franchises, product_name, quantity, price, category, created_at)
bills      (id, franchise_id → franchises, customer_name, total_amount, items JSONB, status, created_at)
```

---

## 🛠️ Available Scripts

### Frontend

```bash
npm run dev          # Start Vite dev server (runs Supabase preflight first)
npm run build        # Production build (runs Supabase preflight first)
npm run preview      # Preview production build
npm run lint         # ESLint
npm run check:supabase  # Run Supabase preflight check manually
```

### Python Backend

```bash
uv run main.py                          # Start Flask API
python ml/scripts/train_fruit_model.py  # Train the ML model
```

---

## 🔧 Troubleshooting

### Franchise login fails even though the user exists

- The email comparison is **exact and case-insensitive**. Make sure the email you type matches exactly what was stored when the franchise was created via the Admin Dashboard.
- To see all franchise emails currently in your Supabase table, run in the SQL editor:
  ```sql
  SELECT email, password, franchise_name FROM franchises;
  ```

### `npm run dev` exits with Supabase preflight error

- Make sure `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set in `.env.local`
- If you skip the access token, apply `supabase/schema.sql` manually in the Supabase SQL editor

### Python `ModuleNotFoundError: tensorflow`

```bash
# Make sure you're in the venv:
source .venv/bin/activate
# Then install:
pip install tensorflow>=2.15.0,<2.18.0
```

### Model fails to load — architecture mismatch

The model was trained with a specific TensorFlow version. If you see layer compatibility errors:
```bash
# Retrain with your current TF version:
python ml/scripts/train_fruit_model.py
```

### Port already in use

```bash
# Change Vite port
npm run dev -- --port 3001

# Change Flask port — edit the last line of main.py:
app.run(host='127.0.0.1', port=5001, debug=True, use_reloader=False)
# And update VITE_ML_API_URL=http://localhost:5001 in .env.local
```

### numpy compatibility error

The project requires `numpy<2.0.0` for TensorFlow compatibility:
```bash
pip install "numpy>=1.24.0,<2.0.0"
```

---

## 📦 Python Dependencies

Managed via `pyproject.toml` (uv) and `requirements.txt` (pip):

| Package | Purpose |
|---|---|
| `flask>=3.0` | REST API server |
| `flask-cors>=4.0` | Cross-origin requests from the Vite frontend |
| `tensorflow>=2.15,<2.18` | ML model inference |
| `numpy>=1.24,<2.0` | Array operations (TF-compatible version) |
| `Pillow>=10.0` | Image loading and preprocessing |
| `opencv-python>=4.8` | Image capture / camera support |
| `scikit-learn>=1.3` | ML utilities |
| `kaggle>=1.6` | Dataset download for training |
| `gunicorn>=21.2` | Production WSGI server (Linux/macOS) |

---

## 📝 License

MIT License — see `LICENSE` for details.

---

## 🙏 Acknowledgments

- [Fruits-360 Dataset](https://www.kaggle.com/datasets/moltean/fruits) — fruit recognition training data
- [shadcn/ui](https://ui.shadcn.com) — component library
- [Supabase](https://supabase.com) — PostgreSQL database and authentication
- [TensorFlow](https://tensorflow.org) — ML framework
- [Framer Motion](https://www.framer.com/motion/) — animations
