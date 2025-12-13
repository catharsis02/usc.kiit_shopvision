"""
Simple Fruit Prediction API - Compatible with your trained model
Uses ResNet50 architecture (224x224 input)
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image
import numpy as np
import io
import os

app = Flask(__name__)
CORS(app)

# Model will be loaded on first prediction
model = None
class_names = []

# Default prices (₹ per kg)
DEFAULT_PRICES = {
    'Apple': 120, 'Banana': 40, 'Grapes': 80, 'Mango': 150,
    'Orange': 60, 'Strawberry': 200, 'Tomato': 30
}

def load_model_lazy():
    """Load model only when needed"""
    global model, class_names
    if model is not None:
        return
    
    print("🔄 Loading TensorFlow...")
    import tensorflow as tf
    
    print(f"📂 Loading model from classifier.keras...")
    try:
        # Load with custom options to handle batch_normalization issue
        model = tf.keras.models.load_model(
            'classifier.keras',
            custom_objects=None,
            compile=False  # Don't compile, just load weights
        )
        # Recompile
        model.compile(
            optimizer='adam',
            loss='sparse_categorical_crossentropy',
            metrics=['accuracy']
        )
        print("✅ Model loaded successfully!")
        
        # Try to load class names from training data
        try:
            data_dir = "fruit_dataset/dataset/Fruits-360_/data/fruits-360_100x100/fruits-360/Training"
            if os.path.exists(data_dir):
                class_names = sorted([d for d in os.listdir(data_dir) if os.path.isdir(os.path.join(data_dir, d))])
                print(f"✅ Loaded {len(class_names)} fruit classes from local dataset")
            else:
                # Fallback class names
                class_names = ['Apple', 'Banana', 'Grapes', 'Mango', 'Orange', 'Strawberry', 'Tomato']
                print(f"⚠️  Using default {len(class_names)} classes")
        except:
            class_names = ['Apple', 'Banana', 'Grapes', 'Mango', 'Orange', 'Strawberry', 'Tomato']
            
    except Exception as e:
        print(f"❌ Error loading model: {e}")
        raise

def preprocess_image(image_bytes):
    """Preprocess image for ResNet50 (224x224)"""
    import tensorflow as tf
    
    img = Image.open(io.BytesIO(image_bytes))
    img = img.convert('RGB')
    img = img.resize((224, 224))  # ResNet50 input size
    img_array = np.array(img, dtype=np.float32)
    img_array = np.expand_dims(img_array, axis=0)
    
    # ResNet50 preprocessing
    img_array = tf.keras.applications.resnet50.preprocess_input(img_array)
    return img_array

@app.route('/health', methods=['GET'])
def health():
    """Health check"""
    return jsonify({
        'status': 'healthy',
        'model_loaded': model is not None,
        'num_classes': len(class_names)
    })

@app.route('/predict', methods=['POST'])
def predict():
    """Predict fruit from image"""
    try:
        # Load model on first use
        load_model_lazy()
        
        if 'image' not in request.files:
            return jsonify({'error': 'No image provided'}), 400
        
        image_file = request.files['image']
        image_bytes = image_file.read()
        
        # Preprocess
        processed_img = preprocess_image(image_bytes)
        
        # Predict
        predictions = model.predict(processed_img, verbose=0)
        predicted_idx = int(np.argmax(predictions[0]))
        confidence = float(predictions[0][predicted_idx])
        
        # Get fruit name
        fruit_name = class_names[predicted_idx] if predicted_idx < len(class_names) else f'Class_{predicted_idx}'
        
        # Get price
        price = DEFAULT_PRICES.get(fruit_name, 100.0)
        
        # Top 3 predictions
        top_3_idx = np.argsort(predictions[0])[-3:][::-1]
        top_predictions = [
            {
                'fruit': class_names[idx] if idx < len(class_names) else f'Class_{idx}',
                'confidence': float(predictions[0][idx]) * 100
            }
            for idx in top_3_idx
        ]
        
        return jsonify({
            'success': True,
            'fruit': fruit_name,
            'confidence': confidence * 100,
            'price': price,
            'unit': 'kg',
            'top_predictions': top_predictions
        })
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/classes', methods=['GET'])
def get_classes():
    """Get supported classes"""
    return jsonify({
        'classes': class_names,
        'count': len(class_names)
    })

if __name__ == '__main__':
    print("🍎 ShopVision Fruit Detection API")
    print("🌐 Starting server on http://localhost:5000")
    print("💡 Model will be loaded on first prediction request")
    app.run(host='0.0.0.0', port=5000, debug=True, use_reloader=False)
