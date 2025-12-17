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

# Default prices (₹ per kg) - Supports multiple fruit varieties
DEFAULT_PRICES = {
    'Apple': 120, 'Banana': 40, 'Grapes': 80, 'Mango': 150,
    'Orange': 60, 'Strawberry': 200, 'Tomato': 30, 'Watermelon': 50,
    'Pineapple': 100, 'Kiwi': 180, 'Papaya': 70, 'Guava': 50,
    'Lemon': 80, 'Pomegranate': 120, 'Cherry': 250, 'Pear': 90,
    'Apricot': 150, 'Avocado': 200, 'Blackberrie': 300, 'Blueberry': 400,
    'Cabbage': 30, 'Beetroot': 40, 'Beans': 60, 'Peach': 120
}

def get_price_for_fruit(fruit_name):
    """Get price for a fruit, handling variants like 'Apple 10', 'Apple Red 1', etc."""
    # First try exact match
    if fruit_name in DEFAULT_PRICES:
        return DEFAULT_PRICES[fruit_name]
    
    # Try to match the base fruit name (e.g., 'Apple' from 'Apple Red 1')
    for base_fruit in DEFAULT_PRICES.keys():
        if fruit_name.startswith(base_fruit):
            return DEFAULT_PRICES[base_fruit]
    
    # Default price if not found
    return 100

def build_model_architecture(num_classes):
    """Rebuild the model architecture - ResNet50 based transfer learning"""
    import tensorflow as tf
    
    # The actual model uses ResNet50 as base (224x224 input)
    base_model = tf.keras.applications.ResNet50(
        weights='imagenet',
        include_top=False,
        input_shape=(224, 224, 3)
    )
    base_model.trainable = False  # Freeze base model
    
    model = tf.keras.Sequential([
        tf.keras.layers.InputLayer(shape=(224, 224, 3)),
        base_model,
        tf.keras.layers.GlobalAveragePooling2D(),
        tf.keras.layers.BatchNormalization(),
        tf.keras.layers.Dense(512, activation='relu'),
        tf.keras.layers.Dropout(0.5),
        tf.keras.layers.Dense(num_classes, activation='softmax')
    ])
    
    model.compile(
        optimizer='adam',
        loss='sparse_categorical_crossentropy',
        metrics=['accuracy']
    )
    
    return model

def load_model_lazy():
    """Load model only when needed"""
    global model, class_names
    if model is not None:
        return
    
    print("🔄 Loading TensorFlow...")
    import tensorflow as tf
    print(f"   TensorFlow version: {tf.__version__}")
    
    # First, load class names to know the number of classes
    class_names_file = 'class_names.txt'
    if os.path.exists(class_names_file):
        with open(class_names_file, 'r') as f:
            class_names = [line.strip() for line in f.readlines() if line.strip()]
        print(f"✅ Loaded {len(class_names)} fruit classes from {class_names_file}")
    else:
        print(f"⚠️  class_names.txt not found, trying training directory...")
        data_dir = "fruit_dataset/dataset/Fruits-360_/data/fruits-360_100x100/fruits-360/Training"
        if os.path.exists(data_dir):
            class_names = sorted([d for d in os.listdir(data_dir) if os.path.isdir(os.path.join(data_dir, d))])
            print(f"✅ Loaded {len(class_names)} fruit classes from training directory")
        else:
            class_names = ['Apple', 'Banana', 'Grapes', 'Mango', 'Orange', 'Strawberry', 'Tomato']
            print(f"⚠️  Using default {len(class_names)} classes")
    
    num_classes = len(class_names)
    
    print(f"📂 Loading model from classifier.keras...")
    
    try:
        # Method 1: Standard load with compile=False
        try:
            print("   Attempting standard load...")
            model = tf.keras.models.load_model('classifier.keras', compile=False)
            model.compile(optimizer='adam', loss='sparse_categorical_crossentropy', metrics=['accuracy'])
            print("✅ Model loaded successfully!")
            
        except Exception as e1:
            error_msg = str(e1)
            print(f"⚠️  Standard load failed: {error_msg[:80]}...")
            
            # Method 2: Try loading with h5 format if available
            if os.path.exists('classifier.h5'):
                print("   Trying .h5 format...")
                model = tf.keras.models.load_model('classifier.h5', compile=False)
                model.compile(optimizer='adam', loss='sparse_categorical_crossentropy', metrics=['accuracy'])
                print("✅ Model loaded from .h5!")
                
            # Method 3: Rebuild architecture and load weights
            elif 'batch_normalization' in error_msg.lower() or 'layer' in error_msg.lower():
                print("   Detected compatibility issue. Rebuilding ResNet50 architecture...")
                try:
                    model = build_model_architecture(num_classes)
                    # Build the model first with correct input shape
                    model.build((None, 224, 224, 3))
                    
                    # Try to load weights from the keras file
                    print("   Loading weights into rebuilt architecture...")
                    import zipfile
                    with zipfile.ZipFile('classifier.keras', 'r') as z:
                        # Extract weights file to temp location
                        z.extract('model.weights.h5', '/tmp/')
                    
                    model.load_weights('/tmp/model.weights.h5')
                    print("✅ Model architecture rebuilt and weights loaded!")
                    
                    # Clean up
                    os.remove('/tmp/model.weights.h5')
                    
                except Exception as e3:
                    print(f"⚠️  Weight loading also failed: {str(e3)[:80]}")
                    raise Exception(
                        "\n❌ Model is incompatible with current TensorFlow version.\n"
                        "   Please retrain the model:\n"
                        "   → Run: python train_fruit_model.py"
                    )
            else:
                raise e1
        
        print(f"   Model input shape: {model.input_shape}")
        print(f"   Model output shape: {model.output_shape}")
        print(f"   Expected classes: {num_classes}")
            
    except Exception as e:
        print(f"\n❌ Error loading model: {e}")
        print("\n💡 Solution: Retrain the model with your current TensorFlow version")
        print(f"   Run: python train_fruit_model.py")
        import traceback
        traceback.print_exc()
        raise

def preprocess_image(image_bytes):
    """Preprocess image for ResNet50-based model"""
    import tensorflow as tf
    
    img = Image.open(io.BytesIO(image_bytes))
    img = img.convert('RGB')
    
    # ResNet50 requires 224x224 input
    target_size = (224, 224)
    if model is not None and hasattr(model, 'input_shape'):
        # Extract height and width from model input shape (None, height, width, channels)
        target_size = (model.input_shape[1], model.input_shape[2])
    
    img = img.resize(target_size)
    img_array = np.array(img, dtype=np.float32)
    
    # Add batch dimension
    img_array = np.expand_dims(img_array, axis=0)
    
    # Use ResNet50 preprocessing (important for transfer learning models)
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
        
        # Get price using smart matching
        price = get_price_for_fruit(fruit_name)
        
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
