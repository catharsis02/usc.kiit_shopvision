"""
Fast Fruit Classifier - No augmentation for speed
"""
import os, sys
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    sys.stderr.reconfigure(encoding='utf-8', errors='replace')

os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'

print("[START] Fast fruit classifier training")

import tensorflow as tf
from pathlib import Path
import json

print(f"TensorFlow {tf.__version__}")

TRAIN_DIR = Path("fruit_dataset/dataset/Fruits-360_/data/fruits-360_100x100/fruits-360/Training")
TEST_DIR = Path("fruit_dataset/dataset/Fruits-360_/data/fruits-360_100x100/fruits-360/Test")

# Get classes
class_names = sorted([d.name for d in TRAIN_DIR.iterdir() if d.is_dir()])
num_classes = len(class_names)
print(f"Classes: {num_classes}")

with open('fruit_classes.json', 'w') as f:
    json.dump(class_names, f)

# Load data
print("Loading data...")
train_ds = tf.keras.utils.image_dataset_from_directory(
    str(TRAIN_DIR), image_size=(100, 100), batch_size=128, shuffle=True, seed=42
)
test_ds = tf.keras.utils.image_dataset_from_directory(
    str(TEST_DIR), image_size=(100, 100), batch_size=128, shuffle=False
)

# Normalize
norm = tf.keras.layers.Rescaling(1./255)
train_ds = train_ds.map(lambda x, y: (norm(x), y)).cache().prefetch(tf.data.AUTOTUNE)
test_ds = test_ds.map(lambda x, y: (norm(x), y)).cache().prefetch(tf.data.AUTOTUNE)

# Simple CNN
print("Building model...")
model = tf.keras.Sequential([
    tf.keras.layers.Conv2D(32, 3, activation='relu', input_shape=(100, 100, 3)),
    tf.keras.layers.MaxPooling2D(),
    tf.keras.layers.Conv2D(64, 3, activation='relu'),
    tf.keras.layers.MaxPooling2D(),
    tf.keras.layers.Conv2D(128, 3, activation='relu'),
    tf.keras.layers.MaxPooling2D(),
    tf.keras.layers.Flatten(),
    tf.keras.layers.Dense(256, activation='relu'),
    tf.keras.layers.Dropout(0.3),
    tf.keras.layers.Dense(num_classes, activation='softmax')
])

model.compile(
    optimizer='adam',
    loss='sparse_categorical_crossentropy',
    metrics=['accuracy']
)

# Train 3 epochs
print("\nTraining (3 epochs)...")
model.fit(train_ds, epochs=3, verbose=1)

# Evaluate
loss, acc = model.evaluate(test_ds, verbose=0)
print(f"\nTest Accuracy: {acc*100:.1f}%")

# Save
model.save('fruit_classifier.keras')
print("Saved: fruit_classifier.keras")

# Verify
tf.keras.models.load_model('fruit_classifier.keras')
print("[DONE] Model ready!")
