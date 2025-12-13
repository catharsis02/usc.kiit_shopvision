"""
Fruit Detection API - Template Matching with Dataset
Uses actual Fruits-360 images for accurate recognition
"""
from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
from PIL import Image
import io
import os
import sys
from pathlib import Path

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

print("[API] Fruit Detection with Template Matching")

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# Paths
TRAIN_DIR = Path("fruit_dataset/dataset/Fruits-360_/data/fruits-360_100x100/fruits-360/Training")

# Prices
PRICES = {
    'Apple': 120, 'Banana': 40, 'Grapes': 80, 'Mango': 150,
    'Orange': 60, 'Strawberry': 200, 'Tomato': 30, 'Watermelon': 50,
    'Pineapple': 100, 'Kiwi': 180, 'Papaya': 70, 'Guava': 50,
    'Lemon': 80, 'Pomegranate': 120, 'Cherry': 250, 'Pear': 90,
    'Peach': 100, 'Plum': 110, 'Avocado': 200, 'Coconut': 60,
    'Strawberry': 200, 'Raspberry': 250, 'Blueberry': 300
}

# Global storage for templates
templates = {}
class_names = []

def load_templates():
    """Load sample images from each fruit class for template matching"""
    global templates, class_names
    
    if templates:
        return True
    
    if not TRAIN_DIR.exists():
        print(f"[ERROR] Dataset not found: {TRAIN_DIR}")
        return False
    
    print("[LOAD] Loading fruit templates from dataset...")
    
    class_names = sorted([d.name for d in TRAIN_DIR.iterdir() if d.is_dir()])
    print(f"[INFO] Found {len(class_names)} classes")
    
    # Load 3 sample images per class for template matching
    for class_name in class_names:
        class_dir = TRAIN_DIR / class_name
        images = list(class_dir.glob("*.jpg")) + list(class_dir.glob("*.png"))
        
        if images:
            # Load first 3 images as templates
            class_templates = []
            for img_path in images[:3]:
                try:
                    img = Image.open(img_path).convert('RGB').resize((100, 100))
                    arr = np.array(img, dtype=np.float32) / 255.0
                    class_templates.append(arr)
                except:
                    pass
            
            if class_templates:
                templates[class_name] = class_templates
    
    print(f"[OK] Loaded templates for {len(templates)} classes")
    return True

def compute_similarity(img1, img2):
    """Compute similarity between two images using color histogram"""
    # Flatten and compute correlation
    flat1 = img1.flatten()
    flat2 = img2.flatten()
    
    # Normalize
    flat1 = (flat1 - np.mean(flat1)) / (np.std(flat1) + 1e-8)
    flat2 = (flat2 - np.mean(flat2)) / (np.std(flat2) + 1e-8)
    
    # Correlation coefficient
    correlation = np.sum(flat1 * flat2) / len(flat1)
    
    return max(0, min(1, (correlation + 1) / 2))

def compute_color_histogram(img):
    """Compute color histogram for an image"""
    # Simple histogram per channel
    hist = []
    for c in range(3):
        channel = img[:, :, c].flatten()
        h, _ = np.histogram(channel, bins=16, range=(0, 1))
        h = h / (np.sum(h) + 1e-8)  # Normalize
        hist.extend(h)
    return np.array(hist)

def histogram_similarity(hist1, hist2):
    """Compare two histograms"""
    # Chi-square distance (lower is better)
    chi_sq = np.sum((hist1 - hist2) ** 2 / (hist1 + hist2 + 1e-8))
    # Convert to similarity (0-1, higher is better)
    similarity = 1.0 / (1.0 + chi_sq)
    return similarity

def find_best_match(query_img):
    """Find best matching fruit class for query image"""
    if not templates:
        load_templates()
    
    query_hist = compute_color_histogram(query_img)
    
    best_match = None
    best_score = -1
    all_scores = []
    
    for class_name, class_templates in templates.items():
        class_scores = []
        
        for template in class_templates:
            # Color histogram similarity
            template_hist = compute_color_histogram(template)
            hist_sim = histogram_similarity(query_hist, template_hist)
            
            # Direct pixel similarity
            pixel_sim = compute_similarity(query_img, template)
            
            # Combined score (weighted average)
            score = 0.6 * hist_sim + 0.4 * pixel_sim
            class_scores.append(score)
        
        # Best score for this class
        avg_score = np.mean(class_scores)
        all_scores.append((class_name, avg_score))
        
        if avg_score > best_score:
            best_score = avg_score
            best_match = class_name
    
    # Sort and get top 3
    all_scores.sort(key=lambda x: x[1], reverse=True)
    top3 = all_scores[:3]
    
    return best_match, best_score, top3

@app.route('/')
def home():
    return jsonify({'name': 'Fruit Detection API (Template Matching)', 'status': 'running'})

@app.route('/health')
def health():
    return jsonify({
        'status': 'ok',
        'templates_loaded': len(templates) > 0,
        'classes': len(class_names)
    })

@app.route('/predict', methods=['POST'])
def predict():
    try:
        if not load_templates():
            return jsonify({'error': 'Templates not loaded'}), 500
        
        if 'image' not in request.files:
            return jsonify({'error': 'No image'}), 400
        
        # Read and resize image
        file = request.files['image']
        img = Image.open(io.BytesIO(file.read())).convert('RGB')
        img = img.resize((100, 100))  # Match dataset size
        arr = np.array(img, dtype=np.float32) / 255.0
        
        # Find best match
        fruit_name, confidence, top3 = find_best_match(arr)
        
        # Scale confidence to percentage
        confidence_pct = confidence * 100
        
        # Get price
        base_name = fruit_name.split()[0] if ' ' in fruit_name else fruit_name
        price = PRICES.get(base_name, 80)
        
        # Build top predictions
        top_predictions = [
            {'fruit': name, 'confidence': round(score * 100, 2)}
            for name, score in top3
        ]
        
        print(f"[DETECT] {fruit_name} ({confidence_pct:.1f}%)")
        
        return jsonify({
            'success': True,
            'fruit': fruit_name,
            'confidence': round(confidence_pct, 2),
            'price': price,
            'unit': 'kg',
            'top_predictions': top_predictions
        })
        
    except Exception as e:
        print(f"[ERROR] {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    print("=" * 50)
    print("[API] Fruit Detection - Template Matching")
    print("[URL] http://localhost:5000")
    print("=" * 50)
    
    # Pre-load templates
    load_templates()
    
    print("[SERVER] Starting...")
    app.run(host='0.0.0.0', port=5000, debug=False, threaded=True)
