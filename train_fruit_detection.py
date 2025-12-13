# ============================================================================
# SHOPVISION FRUIT DETECTION - TRAINING SCRIPT
# Run this locally to train your model in 10-15 minutes
# ============================================================================

import os
import cv2
import numpy as np
import pickle
import json
from pathlib import Path
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from PIL import Image
import warnings
warnings.filterwarnings('ignore')

# ============================================================================
# STEP 1: CONFIGURATION
# ============================================================================

CONFIG = {
    'dataset_path': './fruit_dataset',  # YOUR DATASET FOLDER
    'output_model': './fruit_model.pkl',
    'output_scaler': './scaler.pkl',
    'output_classes': './classes.json',
    'image_size': (128, 128),
    'test_split': 0.2,
    'random_state': 42,
}

# ============================================================================
# STEP 2: FEATURE EXTRACTION
# ============================================================================

def extract_color_histogram(image, bins=32):
    """Extract color histogram features"""
    hist_b = cv2.calcHist([image], [0], None, [bins], [0, 256])
    hist_g = cv2.calcHist([image], [1], None, [bins], [0, 256])
    hist_r = cv2.calcHist([image], [2], None, [bins], [0, 256])
    return np.concatenate([hist_b, hist_g, hist_r]).flatten()

def extract_texture_features(image):
    """Extract texture features using edge detection"""
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    edges = cv2.Canny(gray, 100, 200)
    contours, _ = cv2.findContours(edges, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)
    
    num_contours = len(contours)
    edge_density = np.sum(edges > 0) / (edges.shape[0] * edges.shape[1])
    
    return np.array([num_contours, edge_density])

def extract_shape_features(image):
    """Extract shape features"""
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    _, binary = cv2.threshold(gray, 127, 255, cv2.THRESH_BINARY)
    contours, _ = cv2.findContours(binary, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)
    
    if len(contours) == 0:
        return np.zeros(4)
    
    largest_contour = max(contours, key=cv2.contourArea)
    area = cv2.contourArea(largest_contour)
    perimeter = cv2.arcLength(largest_contour, True)
    circularity = 4 * np.pi * area / (perimeter ** 2 + 1e-5)
    
    x, y, w, h = cv2.boundingRect(largest_contour)
    aspect_ratio = float(w) / (h + 1e-5)
    
    return np.array([area, perimeter, circularity, aspect_ratio])

def extract_color_mean_std(image):
    """Extract mean and std of each channel"""
    b_mean, b_std = cv2.meanStdDev(image[:, :, 0])
    g_mean, g_std = cv2.meanStdDev(image[:, :, 1])
    r_mean, r_std = cv2.meanStdDev(image[:, :, 2])
    
    return np.array([b_mean[0][0], b_std[0][0], g_mean[0][0], g_std[0][0], 
                     r_mean[0][0], r_std[0][0]])

def extract_features(image_path):
    """Extract all features from image"""
    try:
        image = cv2.imread(str(image_path))
        if image is None:
            return None
        
        image = cv2.resize(image, CONFIG['image_size'])
        
        histogram = extract_color_histogram(image)
        texture = extract_texture_features(image)
        shape = extract_shape_features(image)
        color_stats = extract_color_mean_std(image)
        
        features = np.concatenate([histogram, texture, shape, color_stats])
        return features
    except Exception as e:
        print(f"Error processing {image_path}: {e}")
        return None

# ============================================================================
# STEP 3: LOAD DATASET
# ============================================================================

def load_dataset(dataset_path):
    """Load images and labels from folder structure"""
    print("📁 Loading dataset...")
    
    X = []
    y = []
    classes = []
    
    dataset_path = Path(dataset_path)
    
    if not dataset_path.exists():
        print(f"❌ Dataset path not found: {dataset_path}")
        return None, None, None
    
    # Get all class folders
    for class_folder in sorted(dataset_path.iterdir()):
        if not class_folder.is_dir():
            continue
        
        class_name = class_folder.name
        classes.append(class_name)
        class_index = len(classes) - 1
        
        image_count = 0
        for image_file in class_folder.glob('*'):
            if image_file.suffix.lower() in ['.jpg', '.jpeg', '.png', '.bmp']:
                features = extract_features(image_file)
                if features is not None:
                    X.append(features)
                    y.append(class_index)
                    image_count += 1
        
        print(f"   ✅ {class_name}: {image_count} images")
    
    if len(X) == 0:
        print("❌ No images found in dataset!")
        return None, None, None
    
    print(f"\n📊 Total samples: {len(X)}")
    print(f"📊 Total classes: {len(classes)}")
    
    return np.array(X), np.array(y), classes

# ============================================================================
# STEP 4: TRAIN MODEL
# ============================================================================

def train_model(X, y, classes):
    """Train Random Forest model"""
    print("\n🚀 Training model...")
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=CONFIG['test_split'], 
        random_state=CONFIG['random_state'], stratify=y
    )
    
    # Scale features
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    # Train Random Forest
    model = RandomForestClassifier(
        n_estimators=200,
        max_depth=25,
        min_samples_split=5,
        min_samples_leaf=2,
        random_state=CONFIG['random_state'],
        n_jobs=-1,
        verbose=1
    )
    
    model.fit(X_train_scaled, y_train)
    
    # Evaluate
    train_accuracy = model.score(X_train_scaled, y_train)
    test_accuracy = model.score(X_test_scaled, y_test)
    
    print(f"\n✅ Training accuracy: {train_accuracy*100:.2f}%")
    print(f"✅ Testing accuracy: {test_accuracy*100:.2f}%")
    
    return model, scaler

# ============================================================================
# STEP 5: SAVE MODEL
# ============================================================================

def save_model(model, scaler, classes):
    """Save trained model and metadata"""
    print("\n💾 Saving model...")
    
    # Save model
    with open(CONFIG['output_model'], 'wb') as f:
        pickle.dump(model, f)
    print(f"   ✅ Model saved: {CONFIG['output_model']}")
    
    # Save scaler
    with open(CONFIG['output_scaler'], 'wb') as f:
        pickle.dump(scaler, f)
    print(f"   ✅ Scaler saved: {CONFIG['output_scaler']}")
    
    # Save classes
    with open(CONFIG['output_classes'], 'w') as f:
        json.dump(classes, f)
    print(f"   ✅ Classes saved: {CONFIG['output_classes']}")

# ============================================================================
# STEP 6: PREDICTION FUNCTION
# ============================================================================

def predict_fruit(image_path, model, scaler, classes):
    """Predict fruit from image"""
    try:
        features = extract_features(image_path)
        if features is None:
            return {"status": "REJECT", "reason": "Could not process image"}
        
        features_scaled = scaler.transform([features])[0]
        prediction = model.predict([features_scaled])[0]
        probabilities = model.predict_proba([features_scaled])[0]
        confidence = max(probabilities) * 100
        
        fruit_name = classes[prediction]
        
        if confidence >= 70:  # Confidence threshold
            return {
                "status": "SUCCESS",
                "item": fruit_name,
                "confidence": f"{confidence:.2f}%",
                "probabilities": {classes[i]: f"{probabilities[i]*100:.2f}%" for i in range(len(classes))}
            }
        else:
            return {
                "status": "REJECT",
                "reason": f"Low confidence ({confidence:.2f}%). Please provide clearer image.",
                "top_match": fruit_name
            }
    except Exception as e:
        return {"status": "ERROR", "reason": str(e)}

# ============================================================================
# STEP 7: MAIN EXECUTION
# ============================================================================

if __name__ == "__main__":
    print("="*70)
    print("🍎 SHOPVISION FRUIT DETECTION - TRAINING")
    print("="*70)
    
    # Load dataset
    X, y, classes = load_dataset(CONFIG['dataset_path'])
    
    if X is None:
        print("\n❌ Failed to load dataset. Check the path and folder structure.")
        print(f"\nExpected structure:")
        print(f"  {CONFIG['dataset_path']}/")
        print(f"  ├── apple/")
        print(f"  │   ├── apple_1.jpg")
        print(f"  │   ├── apple_2.jpg")
        print(f"  │   └── ...")
        print(f"  ├── grapes/")
        print(f"  │   ├── grapes_1.jpg")
        print(f"  │   └── ...")
        print(f"  └── ...")
        exit(1)
    
    # Train model
    model, scaler = train_model(X, y, classes)
    
    # Save model
    save_model(model, scaler, classes)
    
    print("\n" + "="*70)
    print("✅ TRAINING COMPLETE!")
    print("="*70)
    print(f"\n📁 Model files created:")
    print(f"   1. {CONFIG['output_model']}")
    print(f"   2. {CONFIG['output_scaler']}")
    print(f"   3. {CONFIG['output_classes']}")
    print(f"\n🚀 Ready to use in your ShopVision app!")
    print("="*70)
