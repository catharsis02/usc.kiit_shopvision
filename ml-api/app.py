"""
Fruit Detection API for Cloud Deployment
Optimized for Render.com / Railway / Heroku
"""
from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
from PIL import Image
import io
import os

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# Global model
model = None

# Fruit prices (INR per kg)
PRICES = {
    'Apple': 120, 'Banana': 40, 'Grapes': 80, 'Mango': 150,
    'Orange': 60, 'Strawberry': 200, 'Tomato': 30, 'Watermelon': 50,
    'Pineapple': 100, 'Kiwi': 180, 'Papaya': 70, 'Guava': 50,
    'Lemon': 80, 'Pomegranate': 120, 'Cherry': 250, 'Pear': 90
}

def init_model():
    global model
    if model is not None:
        return True
    
    try:
        os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
        import tensorflow as tf
        
        print(f"Loading MobileNetV2...")
        model = tf.keras.applications.MobileNetV2(
            weights='imagenet',
            include_top=True,
            input_shape=(224, 224, 3)
        )
        print("Model loaded!")
        return True
    except Exception as e:
        print(f"Error: {e}")
        return False

def get_fruit_name(predictions):
    """Extract fruit name from ImageNet predictions"""
    import tensorflow as tf
    decoded = tf.keras.applications.imagenet_utils.decode_predictions(predictions, top=5)[0]
    
    fruit_keywords = ['apple', 'banana', 'orange', 'lemon', 'strawberry', 
                      'pineapple', 'fig', 'pomegranate', 'grape', 'mango']
    
    for _, name, conf in decoded:
        name_lower = name.lower()
        for keyword in fruit_keywords:
            if keyword in name_lower:
                return name.replace('_', ' ').title(), float(conf)
    
    return decoded[0][1].replace('_', ' ').title(), float(decoded[0][2])

@app.route('/')
def home():
    return jsonify({
        'name': 'ShopVision Fruit Detection API',
        'version': '1.0',
        'status': 'running',
        'endpoints': ['/health', '/predict']
    })

@app.route('/health')
def health():
    return jsonify({
        'status': 'ok',
        'model_loaded': model is not None
    })

@app.route('/predict', methods=['POST'])
def predict():
    try:
        if not init_model():
            return jsonify({'error': 'Model not loaded'}), 500
        
        if 'image' not in request.files:
            return jsonify({'error': 'No image provided'}), 400
        
        import tensorflow as tf
        
        # Process image
        file = request.files['image']
        img = Image.open(io.BytesIO(file.read())).convert('RGB')
        img = img.resize((224, 224))
        arr = np.array(img, dtype=np.float32)
        
        # Preprocess
        arr = tf.keras.applications.mobilenet_v2.preprocess_input(arr)
        arr = np.expand_dims(arr, 0)
        
        # Predict
        preds = model.predict(arr, verbose=0)
        fruit_name, confidence = get_fruit_name(preds)
        
        # Get price
        base = fruit_name.split()[0] if ' ' in fruit_name else fruit_name
        price = PRICES.get(base, 80)
        
        return jsonify({
            'success': True,
            'fruit': fruit_name,
            'confidence': round(confidence * 100, 2),
            'price': price,
            'unit': 'kg',
            'top_predictions': [
                {'fruit': fruit_name, 'confidence': round(confidence * 100, 2)}
            ]
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    init_model()
    app.run(host='0.0.0.0', port=port)
