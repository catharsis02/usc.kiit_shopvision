"""
Fruit Classifier Training - TensorFlow 2.18 Compatible
Trains on Fruits-360 dataset for accurate fruit recognition
"""
import os
import sys

# Fix Windows console encoding
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    sys.stderr.reconfigure(encoding='utf-8', errors='replace')

os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'

print("[TRAIN] Starting fruit classifier training...")

import tensorflow as tf
from pathlib import Path
import json

print(f"[INFO] TensorFlow {tf.__version__}")

# Dataset paths
TRAIN_DIR = Path("fruit_dataset/dataset/Fruits-360_/data/fruits-360_100x100/fruits-360/Training")
TEST_DIR = Path("fruit_dataset/dataset/Fruits-360_/data/fruits-360_100x100/fruits-360/Test")

if not TRAIN_DIR.exists():
    print(f"[ERROR] Training directory not found: {TRAIN_DIR}")
    sys.exit(1)

# Get class names
class_names = sorted([d.name for d in TRAIN_DIR.iterdir() if d.is_dir()])
num_classes = len(class_names)
print(f"[INFO] Found {num_classes} fruit classes")

# Save class names for API
with open('fruit_classes.json', 'w') as f:
    json.dump(class_names, f)
print("[OK] Saved fruit_classes.json")

# Image parameters
IMG_SIZE = (100, 100)  # Fruits-360 is 100x100
BATCH_SIZE = 64

# Load datasets without multiprocessing (for Windows compatibility)
print("[INFO] Loading training data...")
train_ds = tf.keras.utils.image_dataset_from_directory(
    str(TRAIN_DIR),
    image_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    shuffle=True,
    seed=42,
    label_mode='int'
)

print("[INFO] Loading test data...")
test_ds = tf.keras.utils.image_dataset_from_directory(
    str(TEST_DIR),
    image_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    shuffle=False,
    label_mode='int'
)

# Normalize and cache
normalization = tf.keras.layers.Rescaling(1./255)

train_ds = train_ds.map(lambda x, y: (normalization(x), y))
train_ds = train_ds.cache().prefetch(tf.data.AUTOTUNE)

test_ds = test_ds.map(lambda x, y: (normalization(x), y))
test_ds = test_ds.cache().prefetch(tf.data.AUTOTUNE)

print("[INFO] Building model...")

# Build a simple but effective CNN
model = tf.keras.Sequential([
    # Input
    tf.keras.layers.InputLayer(shape=(100, 100, 3)),
    
    # Data augmentation
    tf.keras.layers.RandomFlip("horizontal"),
    tf.keras.layers.RandomRotation(0.1),
    tf.keras.layers.RandomZoom(0.1),
    
    # Conv blocks
    tf.keras.layers.Conv2D(32, 3, padding='same', activation='relu'),
    tf.keras.layers.BatchNormalization(),
    tf.keras.layers.MaxPooling2D(),
    
    tf.keras.layers.Conv2D(64, 3, padding='same', activation='relu'),
    tf.keras.layers.BatchNormalization(),
    tf.keras.layers.MaxPooling2D(),
    
    tf.keras.layers.Conv2D(128, 3, padding='same', activation='relu'),
    tf.keras.layers.BatchNormalization(),
    tf.keras.layers.MaxPooling2D(),
    
    tf.keras.layers.Conv2D(256, 3, padding='same', activation='relu'),
    tf.keras.layers.BatchNormalization(),
    tf.keras.layers.GlobalAveragePooling2D(),
    
    # Dense layers
    tf.keras.layers.Dense(512, activation='relu'),
    tf.keras.layers.Dropout(0.5),
    tf.keras.layers.Dense(num_classes, activation='softmax')
])

model.compile(
    optimizer=tf.keras.optimizers.Adam(learning_rate=0.001),
    loss='sparse_categorical_crossentropy',
    metrics=['accuracy']
)

model.summary()

# Train
print("\n[TRAIN] Training for 5 epochs...")
history = model.fit(
    train_ds,
    validation_data=test_ds,
    epochs=5,
    verbose=1
)

# Evaluate
print("\n[EVAL] Evaluating on test set...")
test_loss, test_acc = model.evaluate(test_ds, verbose=0)
print(f"[RESULT] Test accuracy: {test_acc*100:.2f}%")

# Save model
MODEL_PATH = 'fruit_classifier.keras'
print(f"\n[SAVE] Saving model to {MODEL_PATH}...")
model.save(MODEL_PATH)
print("[OK] Model saved!")

# Test loading
print("[TEST] Verifying model loads correctly...")
loaded_model = tf.keras.models.load_model(MODEL_PATH)
print("[OK] Model verification passed!")

print(f"\n{'='*50}")
print(f"[DONE] Training complete!")
print(f"[INFO] Model: {MODEL_PATH}")
print(f"[INFO] Classes: {num_classes}")
print(f"[INFO] Accuracy: {test_acc*100:.2f}%")
print(f"{'='*50}")
