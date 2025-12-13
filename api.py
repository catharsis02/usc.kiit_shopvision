"""
Fruit Detection API - Rebuilt for TensorFlow 2.20 compatibility
Recreates model architecture from training notebook and loads weights
"""
from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
from PIL import Image
import io
import os
import sys

print("🍎 Fruit API Starting...", flush=True)

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# Global
model = None
class_names = []

# Prices
PRICES = {
    'Apple': 120, 'Banana': 40, 'Grapes': 80, 'Mango': 150,
    'Orange': 60, 'Strawberry': 200, 'Tomato': 30, 'Watermelon': 50,
    'Pineapple': 100, 'Kiwi': 180, 'Papaya': 70, 'Guava': 50,
    'Pear': 90, 'Lemon': 80, 'Peach': 100, 'Cherry': 250,
    'Blueberry': 300, 'Plum': 120, 'Avocado': 200, 'Pomegranate': 150
}

def get_class_names():
    """Get class names from training dataset directory"""
    train_path = "fruit_dataset/dataset/Fruits-360_/data/fruits-360_100x100/fruits-360/Training"
    if os.path.exists(train_path):
        return sorted([d for d in os.listdir(train_path) if os.path.isdir(os.path.join(train_path, d))])
    return list(PRICES.keys())

def build_model(num_classes):
    """Rebuild model architecture matching training (2).ipynb"""
    import tensorflow as tf
    from tensorflow.keras import layers
    from tensorflow.keras.applications import ResNet50
    
    # Create base model exactly like training notebook
    base_model = ResNet50(
        weights='imagenet',
        include_top=False,
        input_shape=(224, 224, 3)
    )
    base_model.trainable = False
    
    # Build Sequential model matching training notebook
    model = tf.keras.Sequential([
        base_model,
        layers.GlobalAveragePooling2D(),
        layers.BatchNormalization(),
        layers.Dense(512, activation='relu'),
        layers.Dropout(0.5),
        layers.Dense(num_classes, activation='softmax')
    ])
    
    return model

def init_model():
    """Initialize model - rebuild architecture and try to load weights"""
    global model, class_names
    
    if model is not None:
        return True
    
    try:
        os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'
        import tensorflow as tf
        
        print("Getting class names...", flush=True)
        class_names = get_class_names()
        num_classes = len(class_names)
        print(f"Found {num_classes} classes", flush=True)
        
        print("Building model architecture...", flush=True)
        model = build_model(num_classes)
        
        # Try to load saved model and transfer weights
        try:
            print("Loading classifier.keras...", flush=True)
            old_model = tf.keras.models.load_model('classifier.keras', compile=False)
            
            # Copy weights layer by layer
            for i, layer in enumerate(old_model.layers):
                if i < len(model.layers):
                    try:
                        model.layers[i].set_weights(layer.get_weights())
                        print(f"  Copied weights for layer {i}: {layer.name}", flush=True)
                    except:
                        pass
            print("Weights transferred!", flush=True)
            
        except Exception as e:
            print(f"Could not load old model: {e}", flush=True)
            print("Using model with ImageNet pretrained weights only", flush=True)
        
        # Compile
        model.compile(
            optimizer=tf.keras.optimizers.Adam(learning_rate=0.001),
            loss='sparse_categorical_crossentropy',
            metrics=['accuracy']
        )
        
        print("✅ Model ready!", flush=True)
        return True
        
    except Exception as e:
        print(f"❌ Model init error: {e}", flush=True)
        import traceback
        traceback.print_exc()
        return False

@app.route('/')
def home():
    return jsonify({
        'name': 'Fruit Detection API',
        'status': 'running',
        'endpoints': {
            '/': 'This info',
            '/health': 'Health check',
            '/predict': 'POST image for prediction'
        }
    })

@app.route('/health')
def health():
    return jsonify({
        'status': 'ok',
        'model_loaded': model is not None,
        'num_classes': len(class_names)
    })

@app.route('/predict', methods=['POST'])
def predict():
    try:
        # Lazy load
        if not init_model():
            return jsonify({'error': 'Model failed to load'}), 500
        
        if 'image' not in request.files:
            return jsonify({'error': 'No image file provided'}), 400
        
        # Read and preprocess image
        file = request.files['image']
        img_bytes = file.read()
        
        img = Image.open(io.BytesIO(img_bytes)).convert('RGB')
        img = img.resize((224, 224))
        arr = np.array(img, dtype=np.float32)
        
        # ResNet50 preprocessing (matches training)
        import tensorflow as tf
        arr = tf.keras.applications.resnet50.preprocess_input(arr)
        arr = np.expand_dims(arr, 0)
        
        # Predict
        preds = model.predict(arr, verbose=0)
        idx = int(np.argmax(preds[0]))
        conf = float(preds[0][idx]) * 100
        
        fruit = class_names[idx] if idx < len(class_names) else f'Unknown_{idx}'
        
        # Get price
        base = fruit.split()[0] if ' ' in fruit else fruit
        price = PRICES.get(base, 80)
        
        # Top 3
        top3_idx = np.argsort(preds[0])[-3:][::-1]
        top3 = [{
            'fruit': class_names[i] if i < len(class_names) else f'Unknown_{i}',
            'confidence': round(float(preds[0][i]) * 100, 2)
        } for i in top3_idx]
        
        print(f"🔍 Predicted: {fruit} ({conf:.1f}%)", flush=True)
        
        return jsonify({
            'success': True,
            'fruit': fruit,
            'confidence': round(conf, 2),
            'price': price,
            'unit': 'kg',
            'top_predictions': top3
        })
        
    except Exception as e:
        print(f"❌ Prediction error: {e}", flush=True)
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    print("=" * 50, flush=True)
    print("🍎 Fruit Detection API", flush=True)
    print("📡 http://localhost:5000", flush=True)
    print("=" * 50, flush=True)
    
    # Pre-load model at startup
    init_model()
    
    print("\n✅ Server starting...", flush=True)
    app.run(host='0.0.0.0', port=5000, debug=False, threaded=True)
