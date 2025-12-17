# ShopVision

A modern retail management system with AI-powered fruit recognition, built with React, TypeScript, and Flask.

## Features

- **AI-Powered Product Recognition**: Identify fruits and vegetables using machine learning
- **Inventory Management**: Track stock levels and manage products
- **Billing System**: Generate bills with automatic product detection
- **Dashboard Analytics**: View sales trends and inventory insights
- **Multi-language Support**: Support for English, Hindi, and other languages
- **Role-based Access**: Different dashboards for admin and franchise users

## Tech Stack

- **Frontend**: React, TypeScript, Vite, Tailwind CSS, shadcn/ui
- **Backend**: Python API (predict_api.py)
- **ML Model**: TensorFlow/Keras
- **Authentication**: Supabase
- **Database**: Supabase (PostgreSQL)

## Prerequisites

- **Node.js** v18 or higher
- **Python** 3.9-3.12 (3.11 recommended for best compatibility)
  - Note: Python 3.12 requires TensorFlow 2.16+
  - Python 3.9-3.11 works with TensorFlow 2.15+
- **npm** or **bun** package manager
- **pip** or **uv** for Python packages

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/catharsis02/usc.kiit_shopvision.git
cd usc.kiit_shopvision
```

### 2. Frontend Setup (React + TypeScript)

#### Install Node Dependencies

```bash
npm install
# or if using bun
bun install
```

#### Set Up Environment Variables

Create a `.env.local` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Backend Setup (Python)

#### Install Python Packages

Install the required packages from the root directory:

```bash
# From the root directory
pip install -r requirements.txt
# or using uv (faster)
uv pip install -r requirements.txt
```

#### Required Python Packages

The `requirements.txt` includes:
- tensorflow (2.15+ for Python ≤3.11, 2.16+ for Python 3.12)
- numpy
- Pillow (image processing)
- opencv-python (computer vision)
- matplotlib (visualization)
- scikit-learn (ML utilities)

### 4. Database Setup

Run the SQL schema to set up your Supabase database:

```bash
# Import the schema in your Supabase project
# File: supabase-schema.sql
```

## Running the Application

### Development Mode

#### 1. Start the Frontend (React + TypeScript)

```bash
# From the root directory
npm run dev
# or
bun dev
```

The frontend will be available at: **http://localhost:5173**

#### 2. Start the Backend API

```bash
# From the root directory
python predict_api.py
```

The backend API will be available at: **http://localhost:5000**

## Demo Login Credentials

The application comes with built-in demo credentials for easy testing:

### Admin Access
- **Username:** `admin`
- **Password:** `admin123`
- **Access:** Full administrative dashboard with franchise management

### Franchise Access
- **Email:** `demo@shop.com`
- **Password:** `demo123`
- **Access:** Franchise dashboard with inventory and billing features

> 💡 **Tip:** Click the "Click to fill demo credentials" button on the login page to auto-fill these credentials.

## API Server

The project uses `predict_api.py` as the backend API:

```bash
python predict_api.py
```

- **Model:** Custom trained `classifier.keras` (ResNet50)
- **Purpose:** ML inference for fruit recognition
- **Features:** Works with `class_names.txt` and `fruit_classes.json`
- **Port:** 5000

### Production Build

#### Build the Frontend

```bash
npm run build
# or
bun run build
```

The built files will be in the `dist/` directory.

#### Run Production Server

```bash
npm run preview
# or
bun preview
```

## Training the ML Model

To train or retrain the fruit recognition model:

```bash
cd ml-model
python train_fruit_model.py
```

Additional training scripts:
- `advanced_train.py` - Advanced training with data augmentation
- `download_dataset.py` - Download the Fruits-360 dataset
- `quick_start.py` - Quick training setup

## Project Structure

```
usc.kiit_shopvision/
├── src/                          # Frontend source code
│   ├── components/               # React components
│   │   ├── ui/                  # shadcn/ui components
│   │   ├── BillingScanner.tsx   # Billing functionality
│   │   ├── ImageRecognition.tsx # AI recognition component
│   │   └── ...
│   ├── pages/                   # Page components
│   │   ├── AdminDashboard.tsx
│   │   ├── FranchiseDashboard.tsx
│   │   ├── LoginPage.tsx
│   │   └── Index.tsx
│   ├── contexts/                # React contexts
│   │   ├── AuthContext.tsx     # Authentication
│   │   └── LanguageContext.tsx # i18n support
│   ├── hooks/                   # Custom React hooks
│   └── lib/                     # Utilities
│       ├── supabase.ts         # Supabase client
│       └── utils.ts
├── ml-model/                    # ML model training
│   ├── train_fruit_model.py    # Model training script
│   ├── advanced_train.py       # Advanced training
│   └── download_dataset.py     # Dataset downloader
├── public/                      # Static assets
├── predict_api.py              # Backend API for predictions
├── train_fruit_model.py        # Root training script
├── classifier.keras            # Trained model file
├── class_names.txt             # Class labels
├── fruit_classes.json          # Fruit class definitions
└── supabase-schema.sql         # Database schema
```

## Available Scripts

### Frontend (npm/bun)

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run build:dev` - Build for development
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Backend (Python)

- `python predict_api.py` - Run backend API
- `python train_fruit_model.py` - Train model

## API Endpoints

### Prediction API (`predict_api.py`)
- `GET /health` - Health check
- `POST /predict` - Predict fruit from image
- `GET /classes` - Get all fruit classes

## Environment Variables

Create `.env.local` in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Troubleshooting

### Python Issues

**Python Version Compatibility:**
- If using Python 3.12, you need TensorFlow 2.16+:
  ```bash
  pip install tensorflow>=2.16.0
  ```
- If using Python 3.9-3.11, TensorFlow 2.15+ works fine:
  ```bash
  pip install tensorflow>=2.15.0
  ```

**General TensorFlow installation issues:**
```bash
pip install --upgrade pip
pip install -r requirements.txt --no-cache-dir
```

### Node Issues

If you encounter dependency issues:
```bash
rm -rf node_modules package-lock.json
npm install
```

### Port Already in Use

If port 5173 or 5000 is already in use:
```bash
# Change frontend port
npm run dev -- --port 3000

# Change backend port
# Edit the Flask app file and change the port in app.run()
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Acknowledgments

- **Fruits-360 Dataset** for fruit recognition training data
- **shadcn/ui** for the beautiful component library
- **Supabase** for authentication and database services
- **TensorFlow** for machine learning capabilities
