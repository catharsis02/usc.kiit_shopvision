"""
Fruit Recognition API for BharatShop
Flask API endpoint for real-time fruit recognition
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import tensorflow as tf
import numpy as np
from PIL import Image
import io
import json
import os

app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend

# Load model and labels
MODEL_PATH = 'models/fruit_recognition_model.h5'
LABELS_PATH = 'models/fruit_labels.json'

model = None
labels = None

def load_model_and_labels():
    """Load trained model and class labels"""
    global model, labels
    
    if os.path.exists(MODEL_PATH):
        print(f"📥 Loading model from {MODEL_PATH}")
        model = tf.keras.models.load_model(MODEL_PATH)
        print("✅ Model loaded successfully")
    else:
        print(f"❌ Model not found at {MODEL_PATH}")
        print("Please train the model first:")
        print("python ml-model/train_fruit_model.py")
    
    if os.path.exists(LABELS_PATH):
        with open(LABELS_PATH, 'r') as f:
            labels = json.load(f)
        print(f"✅ Loaded {len(labels)} fruit/vegetable labels")
    else:
        print(f"❌ Labels not found at {LABELS_PATH}")

def preprocess_image(image_bytes):
    """Preprocess uploaded image for model"""
    # Load image
    img = Image.open(io.BytesIO(image_bytes))
    
    # Convert to RGB if needed
    if img.mode != 'RGB':
        img = img.convert('RGB')
    
    # Resize to model input size
    img = img.resize((100, 100))
    
    # Convert to array and normalize
    img_array = np.array(img) / 255.0
    
    # Add batch dimension
    img_array = np.expand_dims(img_array, axis=0)
    
    return img_array

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'model_loaded': model is not None,
        'labels_loaded': labels is not None,
        'num_classes': len(labels) if labels else 0
    })

@app.route('/predict', methods=['POST'])
def predict():
    """
    Predict fruit/vegetable from uploaded image
    
    Request:
        - image: File (multipart/form-data)
    
    Response:
        {
            "success": true,
            "predictions": [
                {"label": "Apple (Red)", "confidence": 0.95},
                {"label": "Apple (Golden)", "confidence": 0.03},
                ...
            ],
            "top_prediction": {"label": "Apple (Red)", "confidence": 0.95}
        }
    """
    if model is None or labels is None:
        return jsonify({
            'success': False,
            'error': 'Model not loaded. Please train the model first.'
        }), 500
    
    # Check if image is present
    if 'image' not in request.files:
        return jsonify({
            'success': False,
            'error': 'No image provided'
        }), 400
    
    file = request.files['image']
    
    if file.filename == '':
        return jsonify({
            'success': False,
            'error': 'Empty filename'
        }), 400
    
    try:
        # Read and preprocess image
        image_bytes = file.read()
        img_array = preprocess_image(image_bytes)
        
        # Make prediction
        predictions = model.predict(img_array)[0]
        
        # Get top 5 predictions
        top_indices = np.argsort(predictions)[-5:][::-1]
        
        results = []
        for idx in top_indices:
            results.append({
                'label': labels[idx],
                'confidence': float(predictions[idx])
            })
        
        return jsonify({
            'success': True,
            'predictions': results,
            'top_prediction': results[0]
        })
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/labels', methods=['GET'])
def get_labels():
    """Get all available fruit/vegetable labels"""
    if labels is None:
        return jsonify({
            'success': False,
            'error': 'Labels not loaded'
        }), 500
    
    return jsonify({
        'success': True,
        'labels': labels,
        'count': len(labels)
    })

if __name__ == '__main__':
    # Load model on startup
    load_model_and_labels()
    
    # Run Flask app
    print("\n🚀 BharatShop Fruit Recognition API")
    print("=" * 50)
    print("📍 Endpoint: http://localhost:5000/predict")
    print("📋 Health: http://localhost:5000/health")
    print("🏷️  Labels: http://localhost:5000/labels")
    print("=" * 50)
    
    app.run(host='0.0.0.0', port=5000, debug=True)
