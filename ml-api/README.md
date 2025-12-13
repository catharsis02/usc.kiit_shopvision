# ShopVision ML API

Fruit detection API using TensorFlow and MobileNetV2.

## Deploy to Render.com

1. Create account at [render.com](https://render.com)
2. New → Web Service
3. Connect your GitHub repo
4. Configure:
   - **Root Directory:** `ml-api`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `gunicorn app:app --bind 0.0.0.0:$PORT --timeout 120`
5. Deploy

## Endpoints

- `GET /` - API info
- `GET /health` - Health check
- `POST /predict` - Upload image for fruit detection

## Environment

- Python 3.11
- TensorFlow 2.15
- Flask 3.0
