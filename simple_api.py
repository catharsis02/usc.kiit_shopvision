"""Simple Fruit API - Minimal version to test"""
from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
from PIL import Image
import io
import os
import sys

print("Starting imports...", flush=True)

app = Flask(__name__)
CORS(app, origins=['*'])

# Global model/classes - loaded lazily
model = None
class_names = []

# Fruit prices
PRICES = {
    'Apple': 120, 'Banana': 40, 'Grapes': 80, 'Mango': 150,
    'Orange': 60, 'Strawberry': 200, 'Tomato': 30, 'Watermelon': 50,
    'Pineapple': 100, 'Kiwi': 180, 'Papaya': 70, 'Guava': 50
}

def init_model():
    """Load model and class names"""
    global model, class_names
    
    if model is not None:
        return True
    
    try:
        print("Loading TensorFlow...", flush=True)
        os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'
        import tensorflow as tf
        
        print("Loading classifier.keras...", flush=True)
        # Use custom_objects to handle compatibility issues
        try:
            model = tf.keras.models.load_model('classifier.keras', compile=False)
        except Exception as e1:
            print(f"Direct load failed: {e1}", flush=True)
            print("Trying with safe_mode=False...", flush=True)
            model = tf.keras.models.load_model('classifier.keras', compile=False, safe_mode=False)
        
        print(f"Model loaded! Input shape: {model.input_shape}", flush=True)
        
        # Get class names from dataset
        train_path = "fruit_dataset/dataset/Fruits-360_/data/fruits-360_100x100/fruits-360/Training"
        if os.path.exists(train_path):
            class_names = sorted([d for d in os.listdir(train_path) if os.path.isdir(os.path.join(train_path, d))])
            print(f"Loaded {len(class_names)} classes", flush=True)
        else:
            class_names = list(PRICES.keys())
            print("Using default classes", flush=True)
        
        return True
    except Exception as e:
        print(f"Model load error: {e}", flush=True)
        return False

@app.route('/')
def home():
    return jsonify({'status': 'Fruit API running', 'endpoints': ['/health', '/predict']})

@app.route('/health')
def health():
    return jsonify({
        'status': 'ok',
        'model_loaded': model is not None,
        'classes': len(class_names)
    })

@app.route('/predict', methods=['POST'])
def predict():
    try:
        # Lazy load model
        if not init_model():
            return jsonify({'error': 'Model not loaded'}), 500
        
        if 'image' not in request.files:
            return jsonify({'error': 'No image provided'}), 400
        
        # Read image
        file = request.files['image']
        img_bytes = file.read()
        
        # Preprocess
        img = Image.open(io.BytesIO(img_bytes)).convert('RGB')
        img = img.resize((224, 224))
        arr = np.array(img, dtype=np.float32)
        
        # Normalize (like training.ipynb)
        arr = arr / 255.0
        mean = np.array([0.485, 0.456, 0.406])
        std = np.array([0.229, 0.224, 0.225])
        arr = (arr - mean) / std
        arr = np.expand_dims(arr, 0)
        
        # Predict
        preds = model.predict(arr, verbose=0)
        idx = int(np.argmax(preds[0]))
        conf = float(preds[0][idx]) * 100
        
        fruit = class_names[idx] if idx < len(class_names) else f'Fruit_{idx}'
        
        # Get price (use generic if not found)
        base_name = fruit.split()[0] if ' ' in fruit else fruit
        price = PRICES.get(base_name, 80)
        
        # Top 3 predictions
        top3_idx = np.argsort(preds[0])[-3:][::-1]
        top3 = [{
            'fruit': class_names[i] if i < len(class_names) else f'Fruit_{i}',
            'confidence': float(preds[0][i]) * 100
        } for i in top3_idx]
        
        return jsonify({
            'success': True,
            'fruit': fruit,
            'confidence': round(conf, 2),
            'price': price,
            'unit': 'kg',
            'top_predictions': top3
        })
        
    except Exception as e:
        print(f"Prediction error: {e}", flush=True)
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    print("=" * 50, flush=True)
    print("🍎 Simple Fruit API", flush=True)
    print("=" * 50, flush=True)
    print("Starting server on http://0.0.0.0:5000", flush=True)
    sys.stdout.flush()
    
    # Pre-load model
    init_model()
    
    from waitress import serve
    try:
        serve(app, host='0.0.0.0', port=5000)
    except ImportError:
        print("Waitress not available, using Flask dev server", flush=True)
        app.run(host='0.0.0.0', port=5000, debug=False, threaded=True)
