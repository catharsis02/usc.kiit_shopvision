"""
Fruit Detection API - Using ImageNet Pretrained Model
No training needed - uses ImageNet labels for fruit detection
"""
from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
from PIL import Image
import io
import os
import sys

# Fix Windows console encoding
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    sys.stderr.reconfigure(encoding='utf-8', errors='replace')

print("[FRUIT API] Starting...", flush=True)

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# ImageNet fruit labels (indices from ImageNet 1000 classes)
IMAGENET_FRUITS = {
    948: 'Granny Smith Apple', 949: 'Orange', 950: 'Lemon', 951: 'Fig',
    952: 'Pineapple', 953: 'Banana', 954: 'Jackfruit', 955: 'Custard Apple',
    956: 'Pomegranate', 957: 'Acorn', 958: 'Strawberry'
}

# Fruit prices
PRICES = {
    'Apple': 120, 'Banana': 40, 'Grapes': 80, 'Mango': 150,
    'Orange': 60, 'Strawberry': 200, 'Tomato': 30, 'Watermelon': 50,
    'Pineapple': 100, 'Kiwi': 180, 'Papaya': 70, 'Guava': 50,
    'Lemon': 80, 'Fig': 150, 'Pomegranate': 120, 'Jackfruit': 60
}

model = None

def init_model():
    global model
    if model is not None:
        return True
    
    try:
        os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
        import tensorflow as tf
        print(f"TensorFlow {tf.__version__}", flush=True)
        
        # Use MobileNetV2 - lightweight and fast
        print("Loading MobileNetV2...", flush=True)
        model = tf.keras.applications.MobileNetV2(
            weights='imagenet',
            include_top=True,
            input_shape=(224, 224, 3)
        )
        print("[OK] Model loaded!", flush=True)
        return True
    except Exception as e:
        print(f"[ERROR] {e}", flush=True)
        return False

def get_fruit_from_prediction(class_idx, confidence, predictions):
    """Map ImageNet class to fruit name"""
    import tensorflow as tf
    
    # Decode ImageNet predictions
    decoded = tf.keras.applications.imagenet_utils.decode_predictions(
        predictions, top=5
    )[0]
    
    # Check if any prediction is a fruit
    fruit_keywords = ['apple', 'orange', 'banana', 'lemon', 'strawberry', 
                      'pineapple', 'fig', 'pomegranate', 'grape', 'mango',
                      'watermelon', 'kiwi', 'papaya', 'tomato', 'guava', 'cherry']
    
    for _, name, conf in decoded:
        name_lower = name.lower().replace('_', ' ')
        for keyword in fruit_keywords:
            if keyword in name_lower:
                return name.replace('_', ' ').title(), conf * 100
    
    # If no fruit found, return top prediction
    return decoded[0][1].replace('_', ' ').title(), decoded[0][2] * 100

@app.route('/')
def home():
    return jsonify({'name': 'Fruit Detection API', 'status': 'running'})

@app.route('/health')
def health():
    return jsonify({'status': 'ok', 'model_loaded': model is not None})

@app.route('/predict', methods=['POST'])
def predict():
    try:
        if not init_model():
            return jsonify({'error': 'Model not loaded'}), 500
        
        if 'image' not in request.files:
            return jsonify({'error': 'No image'}), 400
        
        import tensorflow as tf
        
        # Read image
        file = request.files['image']
        img = Image.open(io.BytesIO(file.read())).convert('RGB')
        img = img.resize((224, 224))
        arr = np.array(img, dtype=np.float32)
        
        # MobileNetV2 preprocessing
        arr = tf.keras.applications.mobilenet_v2.preprocess_input(arr)
        arr = np.expand_dims(arr, 0)
        
        # Predict
        preds = model.predict(arr, verbose=0)
        
        # Get fruit name
        fruit_name, confidence = get_fruit_from_prediction(
            np.argmax(preds[0]), 
            np.max(preds[0]) * 100,
            preds
        )
        
        # Get price
        base = fruit_name.split()[0] if ' ' in fruit_name else fruit_name
        price = PRICES.get(base, 80)
        
        print(f"[DETECTED] {fruit_name} ({confidence:.1f}%)", flush=True)
        
        return jsonify({
            'success': True,
            'fruit': fruit_name,
            'confidence': round(confidence, 2),
            'price': price,
            'unit': 'kg',
            'top_predictions': [
                {'fruit': fruit_name, 'confidence': round(confidence, 2)}
            ]
        })
        
    except Exception as e:
        print(f"[ERROR] {e}", flush=True)
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    print("=" * 40, flush=True)
    print("[FRUIT API] ImageNet Model", flush=True)
    print("[URL] http://localhost:5000", flush=True)
    print("=" * 40, flush=True)
    
    init_model()
    
    print("[SERVER] Running...", flush=True)
    
    # Keep the server alive
    try:
        app.run(host='0.0.0.0', port=5000, debug=False, threaded=True, use_reloader=False)
    except KeyboardInterrupt:
        print("[SERVER] Stopped by user")
    except Exception as e:
        print(f"[ERROR] Server error: {e}")
