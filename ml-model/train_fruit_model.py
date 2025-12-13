"""
BharatShop Fruit Recognition Model Training
Uses Fruits-360 Dataset (170 classes, 115,499 images)
Dataset: https://www.kaggle.com/datasets/moltean/fruits
"""

import os
import numpy as np
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from pathlib import Path
import json

# Configuration
IMG_SIZE = 100  # Fruits-360 images are 100x100
BATCH_SIZE = 32
EPOCHS = 20
NUM_CLASSES = 170  # Full Fruits-360 dataset

# Dataset paths
TRAIN_DIR = 'data/fruits-360/Training'
TEST_DIR = 'data/fruits-360/Test'
MODEL_SAVE_PATH = 'models/fruit_recognition_model.h5'
LABELS_SAVE_PATH = 'models/fruit_labels.json'

def create_model(num_classes):
    """
    Create MobileNetV2-based model for efficient fruit recognition
    Optimized for real-time inference in web app
    """
    # Use MobileNetV2 as base (fast, accurate, small)
    base_model = keras.applications.MobileNetV2(
        input_shape=(IMG_SIZE, IMG_SIZE, 3),
        include_top=False,
        weights='imagenet',
        pooling='avg'
    )
    
    # Freeze base model for transfer learning
    base_model.trainable = False
    
    # Build classification head
    model = keras.Sequential([
        base_model,
        layers.Dropout(0.3),
        layers.Dense(512, activation='relu'),
        layers.BatchNormalization(),
        layers.Dropout(0.3),
        layers.Dense(num_classes, activation='softmax')
    ])
    
    return model

def prepare_data():
    """
    Prepare data generators with augmentation
    """
    # Training data augmentation
    train_datagen = ImageDataGenerator(
        rescale=1./255,
        rotation_range=20,
        width_shift_range=0.2,
        height_shift_range=0.2,
        horizontal_flip=True,
        zoom_range=0.2,
        fill_mode='nearest'
    )
    
    # Test data (only rescaling)
    test_datagen = ImageDataGenerator(rescale=1./255)
    
    # Load training data
    train_generator = train_datagen.flow_from_directory(
        TRAIN_DIR,
        target_size=(IMG_SIZE, IMG_SIZE),
        batch_size=BATCH_SIZE,
        class_mode='categorical',
        shuffle=True
    )
    
    # Load test data
    test_generator = test_datagen.flow_from_directory(
        TEST_DIR,
        target_size=(IMG_SIZE, IMG_SIZE),
        batch_size=BATCH_SIZE,
        class_mode='categorical',
        shuffle=False
    )
    
    return train_generator, test_generator

def train_model():
    """
    Main training function
    """
    print("🚀 Starting BharatShop Fruit Recognition Training")
    print(f"📊 Dataset: Fruits-360 (170 classes)")
    print(f"🖼️  Image Size: {IMG_SIZE}x{IMG_SIZE}")
    print(f"📦 Batch Size: {BATCH_SIZE}")
    print(f"🔄 Epochs: {EPOCHS}\n")
    
    # Check dataset exists
    if not os.path.exists(TRAIN_DIR):
        print("❌ Error: Training data not found!")
        print(f"Expected path: {TRAIN_DIR}")
        print("\n📥 Download dataset first:")
        print("kaggle datasets download -d moltean/fruits")
        print("unzip fruits.zip -d data/fruits-360/")
        return
    
    # Prepare data
    print("📁 Loading dataset...")
    train_gen, test_gen = prepare_data()
    
    # Get class names
    class_names = list(train_gen.class_indices.keys())
    num_classes = len(class_names)
    
    print(f"✅ Found {num_classes} fruit/vegetable classes")
    print(f"📈 Training samples: {train_gen.samples}")
    print(f"🧪 Test samples: {test_gen.samples}\n")
    
    # Create model
    print("🏗️  Building MobileNetV2 model...")
    model = create_model(num_classes)
    
    # Compile model
    model.compile(
        optimizer=keras.optimizers.Adam(learning_rate=0.001),
        loss='categorical_crossentropy',
        metrics=['accuracy', 'top_k_categorical_accuracy']
    )
    
    model.summary()
    
    # Callbacks
    callbacks = [
        keras.callbacks.ModelCheckpoint(
            MODEL_SAVE_PATH,
            monitor='val_accuracy',
            save_best_only=True,
            verbose=1
        ),
        keras.callbacks.ReduceLROnPlateau(
            monitor='val_loss',
            factor=0.5,
            patience=3,
            verbose=1
        ),
        keras.callbacks.EarlyStopping(
            monitor='val_loss',
            patience=5,
            restore_best_weights=True,
            verbose=1
        )
    ]
    
    # Train model
    print("\n🎓 Training model...")
    history = model.fit(
        train_gen,
        validation_data=test_gen,
        epochs=EPOCHS,
        callbacks=callbacks,
        verbose=1
    )
    
    # Evaluate
    print("\n📊 Evaluating model...")
    test_loss, test_acc, test_top5 = model.evaluate(test_gen)
    print(f"✅ Test Accuracy: {test_acc*100:.2f}%")
    print(f"✅ Top-5 Accuracy: {test_top5*100:.2f}%")
    
    # Save labels
    print(f"\n💾 Saving class labels to {LABELS_SAVE_PATH}")
    os.makedirs(os.path.dirname(LABELS_SAVE_PATH), exist_ok=True)
    with open(LABELS_SAVE_PATH, 'w') as f:
        json.dump(class_names, f, indent=2)
    
    print("\n✨ Training Complete!")
    print(f"📁 Model saved: {MODEL_SAVE_PATH}")
    print(f"📁 Labels saved: {LABELS_SAVE_PATH}")
    
    return model, history

if __name__ == "__main__":
    # Create directories
    os.makedirs('models', exist_ok=True)
    os.makedirs('data/fruits-360', exist_ok=True)
    
    # Train
    model, history = train_model()
