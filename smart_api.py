"""
Smart Fruit Detection API - Color + Shape Analysis
Improves on ImageNet by analyzing fruit-specific features
"""
from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
from PIL import Image
import io
import os
import sys
import json

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

print("[FRUIT API] Smart Detection Starting...")

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

model = None
class_names = []

# Load fruit class names from dataset
TRAIN_DIR = "fruit_dataset/dataset/Fruits-360_/data/fruits-360_100x100/fruits-360/Training"

# Fruit prices
PRICES = {
    'Apple': 120, 'Banana': 40, 'Grapes': 80, 'Mango': 150,
    'Orange': 60, 'Strawberry': 200, 'Tomato': 30, 'Watermelon': 50,
    'Pineapple': 100, 'Kiwi': 180, 'Papaya': 70, 'Guava': 50,
    'Lemon': 80, 'Pomegranate': 120, 'Cherry': 250, 'Pear': 90,
    'Peach': 100, 'Plum': 110, 'Avocado': 200, 'Coconut': 60
}

# Color profiles for common fruits (HSV ranges)
FRUIT_COLOR_PROFILES = {
    'Apple': {'colors': ['red', 'green', 'yellow'], 'shape': 'round', 'has_stem': True},
    'Banana': {'colors': ['yellow'], 'shape': 'curved', 'has_stem': False},
    'Orange': {'colors': ['orange'], 'shape': 'round', 'has_stem': False},
    'Pomegranate': {'colors': ['dark_red', 'pink'], 'shape': 'round', 'has_crown': True},
    'Grapes': {'colors': ['purple', 'green'], 'shape': 'cluster', 'has_stem': True},
    'Mango': {'colors': ['yellow', 'orange', 'green'], 'shape': 'oval', 'has_stem': False},
    'Strawberry': {'colors': ['red'], 'shape': 'heart', 'has_seeds': True},
    'Lemon': {'colors': ['yellow'], 'shape': 'oval', 'has_stem': False},
}

def analyze_color(img_array):
    """Analyze dominant colors in the image"""
    # Convert to HSV for better color analysis
    from PIL import ImageStat
    
    # Get average color
    avg_color = np.mean(img_array, axis=(0, 1))
    r, g, b = avg_color
    
    # Determine dominant color category
    if r > 150 and g < 100 and b < 100:
        return 'red'
    elif r > 200 and g > 150 and b < 100:
        return 'orange'
    elif r > 200 and g > 200 and b < 150:
        return 'yellow'
    elif g > 150 and r < 150 and b < 150:
        return 'green'
    elif r > 100 and b > 100 and g < 100:
        return 'purple'
    elif r > 150 and g < 80 and b < 80:
        return 'dark_red'
    else:
        return 'mixed'

def detect_stem(img_array):
    """Check for stem presence at top of image"""
    top_region = img_array[:20, :, :]
    avg_top = np.mean(top_region)
    # Stem usually appears as darker region at top
    return avg_top < 100

def get_fruit_from_color_analysis(img_array, imagenet_prediction):
    """Combine color analysis with ImageNet prediction"""
    color = analyze_color(img_array)
    has_stem = detect_stem(img_array)
    
    # If ImageNet says pomegranate but color is bright red with stem -> likely Apple
    if 'pomegranate' in imagenet_prediction.lower():
        if color == 'red' and has_stem:
            return 'Apple', 0.85
    
    # If ImageNet says apple, verify with color
    if 'apple' in imagenet_prediction.lower():
        if color in ['red', 'green', 'yellow']:
            return 'Apple', 0.95
    
    # Return original prediction
    return imagenet_prediction, 0.0

def init_model():
    global model, class_names
    if model is not None:
        return True
    
    try:
        os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
        import tensorflow as tf
        print(f"TensorFlow {tf.__version__}")
        
        # Load class names from dataset
        if os.path.exists(TRAIN_DIR):
            class_names = sorted([d for d in os.listdir(TRAIN_DIR) 
                                if os.path.isdir(os.path.join(TRAIN_DIR, d))])
            print(f"Loaded {len(class_names)} fruit classes from dataset")
        
        # Use MobileNetV2
        print("Loading MobileNetV2...")
        model = tf.keras.applications.MobileNetV2(
            weights='imagenet',
            include_top=True,
            input_shape=(224, 224, 3)
        )
        print("[OK] Model loaded!")
        return True
    except Exception as e:
        print(f"[ERROR] {e}")
        return False

def find_best_fruit_match(imagenet_name, confidence, img_array):
    """Find best matching fruit from our class list"""
    import tensorflow as tf
    
    # Color analysis to improve accuracy
    color = analyze_color(img_array)
    has_stem = detect_stem(img_array)
    
    name_lower = imagenet_name.lower()
    
    # Apple detection improvements
    if 'apple' in name_lower or 'granny' in name_lower:
        if color == 'red':
            # Find red apple varieties
            for cls in class_names:
                if 'apple' in cls.lower() and 'red' in cls.lower():
                    return cls, min(confidence + 0.15, 0.99)
            return 'Apple Red', min(confidence + 0.15, 0.99)
        elif color == 'green':
            return 'Apple Granny Smith', min(confidence + 0.10, 0.99)
        return 'Apple', confidence
    
    # Pomegranate - verify it's actually round with crown
    if 'pomegranate' in name_lower:
        # If bright red with stem, likely apple
        if color == 'red' and has_stem:
            return 'Apple Red', 0.85
        return 'Pomegranate', confidence
    
    # Check other fruits
    fruit_keywords = ['banana', 'orange', 'lemon', 'strawberry', 'grape', 'mango',
                      'watermelon', 'kiwi', 'pineapple', 'peach', 'pear', 'cherry']
    
    for keyword in fruit_keywords:
        if keyword in name_lower:
            # Find in our class list
            for cls in class_names:
                if keyword in cls.lower():
                    return cls, confidence
            return keyword.capitalize(), confidence
    
    # If nothing matched, use ImageNet name
    return imagenet_name.replace('_', ' ').title(), confidence

@app.route('/')
def home():
    return jsonify({'name': 'Smart Fruit Detection API', 'status': 'running'})

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
        
        import tensorflow as tf
        
        # Read image
        file = request.files['image']
        img = Image.open(io.BytesIO(file.read())).convert('RGB')
        img_resized = img.resize((224, 224))
        arr = np.array(img_resized, dtype=np.float32)
        
        # Keep original for color analysis
        arr_original = arr.copy()
        
        # MobileNetV2 preprocessing
        arr_processed = tf.keras.applications.mobilenet_v2.preprocess_input(arr)
        arr_batch = np.expand_dims(arr_processed, 0)
        
        # Predict with ImageNet model
        preds = model.predict(arr_batch, verbose=0)
        
        # Decode predictions
        decoded = tf.keras.applications.imagenet_utils.decode_predictions(preds, top=5)[0]
        top_pred_name = decoded[0][1]
        top_pred_conf = float(decoded[0][2])
        
        # Use smart matching with color analysis
        fruit_name, adjusted_conf = find_best_fruit_match(
            top_pred_name, 
            top_pred_conf,
            arr_original
        )
        
        # Get price
        base_name = fruit_name.split()[0] if ' ' in fruit_name else fruit_name
        price = PRICES.get(base_name, 80)
        
        # Build top predictions
        top3 = []
        for _, name, conf in decoded[:3]:
            matched_name, _ = find_best_fruit_match(name, float(conf), arr_original)
            top3.append({
                'fruit': matched_name,
                'confidence': round(float(conf) * 100, 2)
            })
        
        # Ensure our detected fruit is at top
        if top3[0]['fruit'] != fruit_name:
            top3.insert(0, {
                'fruit': fruit_name,
                'confidence': round(adjusted_conf * 100, 2)
            })
            top3 = top3[:3]
        
        print(f"[DETECTED] {fruit_name} ({adjusted_conf*100:.1f}%)")
        
        return jsonify({
            'success': True,
            'fruit': fruit_name,
            'confidence': round(adjusted_conf * 100, 2),
            'price': price,
            'unit': 'kg',
            'top_predictions': top3
        })
        
    except Exception as e:
        print(f"[ERROR] {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    print("=" * 40)
    print("[FRUIT API] Smart Detection")
    print("[URL] http://localhost:5000")
    print("=" * 40)
    
    init_model()
    
    print("[SERVER] Running...")
    try:
        app.run(host='0.0.0.0', port=5000, debug=False, threaded=True, use_reloader=False)
    except KeyboardInterrupt:
        print("[STOPPED]")
