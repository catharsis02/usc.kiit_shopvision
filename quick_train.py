"""
Quick Model Training Script - Creates a TF 2.20 compatible model
Uses MobileNetV2 for faster training
"""
import os
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'

import tensorflow as tf
from tensorflow.keras import layers
from tensorflow.keras.applications import MobileNetV2
import numpy as np

print(f"TensorFlow {tf.__version__}")

# Dataset path
TRAIN_DIR = "fruit_dataset/dataset/Fruits-360_/data/fruits-360_100x100/fruits-360/Training"

if not os.path.exists(TRAIN_DIR):
    print(f"❌ Training directory not found: {TRAIN_DIR}")
    exit(1)

# Get class names
class_names = sorted([d for d in os.listdir(TRAIN_DIR) if os.path.isdir(os.path.join(TRAIN_DIR, d))])
num_classes = len(class_names)
print(f"Found {num_classes} classes")

# Save class names for the API
with open('class_names.txt', 'w') as f:
    f.write('\n'.join(class_names))
print("Saved class_names.txt")

# Create datasets - use fewer workers to avoid multiprocessing issues
print("Loading training data...")
train_ds = tf.keras.utils.image_dataset_from_directory(
    TRAIN_DIR,
    image_size=(224, 224),
    batch_size=32,
    shuffle=True,
    seed=42
)

# Data augmentation
data_augmentation = tf.keras.Sequential([
    layers.RandomFlip("horizontal"),
    layers.RandomRotation(0.1),
])

# Create model
print("Building MobileNetV2 model...")
base_model = MobileNetV2(
    weights='imagenet',
    include_top=False,
    input_shape=(224, 224, 3)
)
base_model.trainable = False  # Freeze base

# Create the model
inputs = tf.keras.Input(shape=(224, 224, 3))
x = data_augmentation(inputs)
x = tf.keras.applications.mobilenet_v2.preprocess_input(x)
x = base_model(x, training=False)
x = layers.GlobalAveragePooling2D()(x)
x = layers.Dropout(0.3)(x)
outputs = layers.Dense(num_classes, activation='softmax')(x)

model = tf.keras.Model(inputs, outputs)

model.compile(
    optimizer=tf.keras.optimizers.Adam(learning_rate=0.001),
    loss='sparse_categorical_crossentropy',
    metrics=['accuracy']
)

model.summary()

# Train
print("\n🏋️ Training for 3 epochs...")
history = model.fit(
    train_ds,
    epochs=3,
    verbose=1
)

# Save in compatible format
print("\nSaving model...")
model.save('fruit_model.keras')
print("✅ Saved fruit_model.keras")

# Test loading
print("Testing model load...")
loaded = tf.keras.models.load_model('fruit_model.keras')
print("✅ Model loads successfully!")
print(f"\n🎉 Done! Model saved as 'fruit_model.keras' with {num_classes} classes")
