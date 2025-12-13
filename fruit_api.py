"""
Fruit Detection API - Compatible with TF 2.20
"""
from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
from PIL import Image
import io
import os

print("🍎 Fruit API Starting...", flush=True)

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# Globals
model = None
class_names = []

# Fruit prices per kg
PRICES = {
    'Apple': 120, 'Banana': 40, 'Grapes': 80, 'Mango': 150,
    'Orange': 60, 'Strawberry': 200, 'Tomato': 30, 'Watermelon': 50,
    'Pineapple': 100, 'Kiwi': 180, 'Papaya': 70, 'Guava': 50,
    'Pear': 90, 'Lemon': 80, 'Peach': 100, 'Cherry': 250
}

def init_model():
    """Initialize model with TF 2.20 compatibility"""
    global model, class_names
    
    if model is not None:
        return True
    
    try:
        os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
        os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'
        os.environ['TF_USE_LEGACY_KERAS'] = '1'
        
        # Try using tf_keras for legacy model support
        try:
            import tf_keras as keras
            print("Using tf_keras for compatibility", flush=True)
        except ImportError:
            import tensorflow.keras as keras
        
        import tensorflow as tf
        print(f"TensorFlow {tf.__version__}", flush=True)
        
        # Get class names
        train_path = "fruit_dataset/dataset/Fruits-360_/data/fruits-360_100x100/fruits-360/Training"
        if os.path.exists(train_path):
            class_names = sorted([d for d in os.listdir(train_path) 
                                if os.path.isdir(os.path.join(train_path, d))])
            print(f"Found {len(class_names)} classes", flush=True)
        else:
            class_names = list(PRICES.keys())
        
        # Load model with legacy keras
        model_path = 'classifier.keras'
        print(f"Loading {model_path}...", flush=True)
        
        try:
            model = keras.models.load_model(
                model_path, 
                compile=False
            )
            print("✅ Model loaded!", flush=True)
        except Exception as e:
            print(f"Load error: {e}", flush=True)
            return False
        
        return True
        
    except Exception as e:
        print(f"❌ Init error: {e}", flush=True)
        import traceback
        traceback.print_exc()
        return False

@app.route('/')
def home():
    return jsonify({'name': 'Fruit API', 'status': 'running'})

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
        if not init_model():
            return jsonify({'error': 'Model not loaded'}), 500
        
        if 'image' not in request.files:
            return jsonify({'error': 'No image'}), 400
        
        # Read and resize image
        file = request.files['image']
        img = Image.open(io.BytesIO(file.read())).convert('RGB')
        img = img.resize((224, 224))
        arr = np.array(img, dtype=np.float32)
        
        # Preprocess for ResNet50 (like training)
        import tensorflow as tf
        arr = tf.keras.applications.resnet50.preprocess_input(arr)
        arr = np.expand_dims(arr, 0)
        
        # Predict
        preds = model.predict(arr, verbose=0)
        idx = int(np.argmax(preds[0]))
        conf = float(preds[0][idx]) * 100
        
        fruit = class_names[idx] if idx < len(class_names) else f'Fruit_{idx}'
        
        # Get price
        base = fruit.split()[0] if ' ' in fruit else fruit
        price = PRICES.get(base, 80)
        
        # Top 3
        top_idx = np.argsort(preds[0])[-3:][::-1]
        top3 = [{
            'fruit': class_names[i] if i < len(class_names) else f'Fruit_{i}',
            'confidence': round(float(preds[0][i]) * 100, 2)
        } for i in top_idx]
        
        print(f"✅ {fruit} ({conf:.1f}%)", flush=True)
        
        return jsonify({
            'success': True,
            'fruit': fruit,
            'confidence': round(conf, 2),
            'price': price,
            'unit': 'kg',
            'top_predictions': top3
        })
        
    except Exception as e:
        print(f"❌ Error: {e}", flush=True)
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    print("=" * 40, flush=True)
    print("🍎 Fruit Detection API", flush=True)
    print("📡 http://localhost:5000", flush=True)
    print("=" * 40, flush=True)
    
    # Preload model
    init_model()
    
    print("🚀 Server starting...", flush=True)
    app.run(host='0.0.0.0', port=5000, debug=False, threaded=True)
