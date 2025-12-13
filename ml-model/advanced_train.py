"""
ShopVision Advanced Fruit Recognition Training
Target: 99%+ accuracy with ensemble models
Dataset: Fruits-360 + Custom Indian produce
"""

import os
import numpy as np
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers, models
from tensorflow.keras.applications import (
    EfficientNetB7, MobileNetV3Large, ResNet152V2
)
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.callbacks import (
    ModelCheckpoint, EarlyStopping, ReduceLROnPlateau,
    TensorBoard, CSVLogger
)
from pathlib import Path
import json
from datetime import datetime

# Configuration
IMG_SIZE = 224  # Standard for transfer learning
BATCH_SIZE = 32
EPOCHS = 150
NUM_CLASSES = 170  # Fruits-360 full dataset
CONFIDENCE_THRESHOLD = 0.95  # 95% minimum confidence

# Dataset paths
TRAIN_DIR = 'data/fruits-360/Training'
TEST_DIR = 'data/fruits-360/Test'
MODEL_SAVE_DIR = 'models/ensemble'
LOGS_DIR = 'logs/training'

# Create directories
os.makedirs(MODEL_SAVE_DIR, exist_ok=True)
os.makedirs(LOGS_DIR, exist_ok=True)

def create_advanced_augmentation():
    """
    Advanced data augmentation for maximum accuracy
    Simulates real-world conditions: lighting, angles, quality
    """
    return ImageDataGenerator(
        rescale=1./255,
        # Rotation & Transformation
        rotation_range=25,
        width_shift_range=0.2,
        height_shift_range=0.2,
        shear_range=0.15,
        zoom_range=[0.8, 1.2],
        # Color Augmentation
        brightness_range=[0.7, 1.3],
        channel_shift_range=30.0,
        # Flips
        horizontal_flip=True,
        vertical_flip=False,
        # Fill mode
        fill_mode='nearest',
        # Validation split
        validation_split=0.15
    )

def create_efficientnet_model(num_classes):
    """
    EfficientNetB7: State-of-the-art accuracy
    Expected: 97-99% accuracy
    """
    base_model = EfficientNetB7(
        input_shape=(IMG_SIZE, IMG_SIZE, 3),
        include_top=False,
        weights='imagenet',
        pooling='avg'
    )
    
    # Freeze base initially
    base_model.trainable = False
    
    # Custom classification head
    model = models.Sequential([
        base_model,
        layers.BatchNormalization(),
        layers.Dropout(0.5),
        layers.Dense(1024, activation='relu', kernel_regularizer=tf.keras.regularizers.l2(0.001)),
        layers.BatchNormalization(),
        layers.Dropout(0.4),
        layers.Dense(512, activation='relu', kernel_regularizer=tf.keras.regularizers.l2(0.001)),
        layers.BatchNormalization(),
        layers.Dropout(0.3),
        layers.Dense(num_classes, activation='softmax', name='predictions')
    ])
    
    return model

def create_mobilenet_model(num_classes):
    """
    MobileNetV3: Fast inference for real-time detection
    Expected: 95-97% accuracy, 50ms inference
    """
    base_model = MobileNetV3Large(
        input_shape=(IMG_SIZE, IMG_SIZE, 3),
        include_top=False,
        weights='imagenet',
        pooling='avg'
    )
    
    base_model.trainable = False
    
    model = models.Sequential([
        base_model,
        layers.Dropout(0.4),
        layers.Dense(512, activation='relu'),
        layers.BatchNormalization(),
        layers.Dropout(0.3),
        layers.Dense(num_classes, activation='softmax')
    ])
    
    return model

def create_resnet_model(num_classes):
    """
    ResNet152V2: Deep learning for complex patterns
    Expected: 96-98% accuracy
    """
    base_model = ResNet152V2(
        input_shape=(IMG_SIZE, IMG_SIZE, 3),
        include_top=False,
        weights='imagenet',
        pooling='avg'
    )
    
    base_model.trainable = False
    
    model = models.Sequential([
        base_model,
        layers.BatchNormalization(),
        layers.Dropout(0.5),
        layers.Dense(768, activation='relu'),
        layers.BatchNormalization(),
        layers.Dropout(0.4),
        layers.Dense(num_classes, activation='softmax')
    ])
    
    return model

def prepare_data():
    """
    Load and prepare data with advanced augmentation
    """
    print("📦 Loading datasets with advanced augmentation...")
    
    train_datagen = create_advanced_augmentation()
    test_datagen = ImageDataGenerator(rescale=1./255)
    
    # Training data with augmentation
    train_generator = train_datagen.flow_from_directory(
        TRAIN_DIR,
        target_size=(IMG_SIZE, IMG_SIZE),
        batch_size=BATCH_SIZE,
        class_mode='categorical',
        shuffle=True,
        subset='training'
    )
    
    # Validation split
    val_generator = train_datagen.flow_from_directory(
        TRAIN_DIR,
        target_size=(IMG_SIZE, IMG_SIZE),
        batch_size=BATCH_SIZE,
        class_mode='categorical',
        shuffle=False,
        subset='validation'
    )
    
    # Test data (no augmentation)
    test_generator = test_datagen.flow_from_directory(
        TEST_DIR,
        target_size=(IMG_SIZE, IMG_SIZE),
        batch_size=BATCH_SIZE,
        class_mode='categorical',
        shuffle=False
    )
    
    # Save class labels
    class_labels = {v: k for k, v in train_generator.class_indices.items()}
    with open(os.path.join(MODEL_SAVE_DIR, 'class_labels.json'), 'w') as f:
        json.dump(class_labels, f, indent=2)
    
    print(f"✅ Training samples: {train_generator.samples}")
    print(f"✅ Validation samples: {val_generator.samples}")
    print(f"✅ Test samples: {test_generator.samples}")
    print(f"✅ Classes: {len(class_labels)}")
    
    return train_generator, val_generator, test_generator, class_labels

def get_callbacks(model_name):
    """
    Advanced callbacks for optimal training
    """
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    
    return [
        # Save best model
        ModelCheckpoint(
            filepath=os.path.join(MODEL_SAVE_DIR, f'{model_name}_best.keras'),
            monitor='val_accuracy',
            mode='max',
            save_best_only=True,
            verbose=1
        ),
        
        # Early stopping to prevent overfitting
        EarlyStopping(
            monitor='val_loss',
            patience=20,
            restore_best_weights=True,
            verbose=1
        ),
        
        # Reduce learning rate on plateau
        ReduceLROnPlateau(
            monitor='val_loss',
            factor=0.5,
            patience=7,
            min_lr=1e-7,
            verbose=1
        ),
        
        # TensorBoard logging
        TensorBoard(
            log_dir=os.path.join(LOGS_DIR, f'{model_name}_{timestamp}'),
            histogram_freq=1,
            write_graph=True
        ),
        
        # CSV logger
        CSVLogger(
            os.path.join(LOGS_DIR, f'{model_name}_{timestamp}.csv')
        )
    ]

def train_model(model, model_name, train_gen, val_gen, epochs=EPOCHS):
    """
    Train model with two-phase approach:
    1. Train only top layers (frozen base)
    2. Fine-tune entire model (unfrozen base)
    """
    print(f"\n{'='*60}")
    print(f"🚀 Training {model_name}")
    print(f"{'='*60}\n")
    
    # Phase 1: Train with frozen base
    print("📌 Phase 1: Training classification head...")
    model.compile(
        optimizer=keras.optimizers.Adam(learning_rate=1e-3),
        loss='categorical_crossentropy',
        metrics=['accuracy', keras.metrics.TopKCategoricalAccuracy(k=5, name='top5_accuracy')]
    )
    
    history1 = model.fit(
        train_gen,
        validation_data=val_gen,
        epochs=30,
        callbacks=get_callbacks(f'{model_name}_phase1'),
        verbose=1
    )
    
    # Phase 2: Fine-tune entire model
    print("\n📌 Phase 2: Fine-tuning entire model...")
    model.layers[0].trainable = True  # Unfreeze base model
    
    model.compile(
        optimizer=keras.optimizers.Adam(learning_rate=1e-5),  # Lower learning rate
        loss='categorical_crossentropy',
        metrics=['accuracy', keras.metrics.TopKCategoricalAccuracy(k=5, name='top5_accuracy')]
    )
    
    history2 = model.fit(
        train_gen,
        validation_data=val_gen,
        epochs=epochs - 30,
        callbacks=get_callbacks(f'{model_name}_phase2'),
        verbose=1
    )
    
    return model, history1, history2

def evaluate_ensemble(models, test_gen, class_labels):
    """
    Ensemble prediction with voting for maximum accuracy
    """
    print("\n🎯 Evaluating ensemble model...")
    
    predictions_ensemble = []
    
    for model in models:
        preds = model.predict(test_gen, verbose=1)
        predictions_ensemble.append(preds)
    
    # Average predictions
    avg_predictions = np.mean(predictions_ensemble, axis=0)
    
    # Get predicted classes
    predicted_classes = np.argmax(avg_predictions, axis=1)
    true_classes = test_gen.classes
    
    # Calculate accuracy
    accuracy = np.mean(predicted_classes == true_classes)
    
    # Get confidence scores
    confidences = np.max(avg_predictions, axis=1)
    high_conf_mask = confidences >= CONFIDENCE_THRESHOLD
    high_conf_accuracy = np.mean(predicted_classes[high_conf_mask] == true_classes[high_conf_mask])
    
    print(f"\n{'='*60}")
    print(f"📊 ENSEMBLE RESULTS")
    print(f"{'='*60}")
    print(f"Overall Accuracy: {accuracy*100:.2f}%")
    print(f"High Confidence (>{CONFIDENCE_THRESHOLD*100}%) Accuracy: {high_conf_accuracy*100:.2f}%")
    print(f"High Confidence Samples: {np.sum(high_conf_mask)}/{len(confidences)} ({np.sum(high_conf_mask)/len(confidences)*100:.1f}%)")
    print(f"Average Confidence: {np.mean(confidences)*100:.2f}%")
    
    return accuracy, high_conf_accuracy, confidences

def main():
    """
    Main training pipeline
    """
    print("=" * 80)
    print("🍎 ShopVision Advanced Fruit Recognition Training")
    print("=" * 80)
    print(f"Target: 99%+ accuracy")
    print(f"Dataset: Fruits-360 (170 classes)")
    print(f"Models: EfficientNetB7 + MobileNetV3 + ResNet152V2 (Ensemble)")
    print("=" * 80 + "\n")
    
    # Prepare data
    train_gen, val_gen, test_gen, class_labels = prepare_data()
    
    # Create models
    print("\n🏗️ Creating ensemble models...\n")
    efficientnet = create_efficientnet_model(NUM_CLASSES)
    mobilenet = create_mobilenet_model(NUM_CLASSES)
    resnet = create_resnet_model(NUM_CLASSES)
    
    # Train each model
    trained_models = []
    
    # Train EfficientNet
    efficientnet, hist1_eff, hist2_eff = train_model(
        efficientnet, 'EfficientNetB7', train_gen, val_gen
    )
    trained_models.append(efficientnet)
    
    # Train MobileNet
    mobilenet, hist1_mob, hist2_mob = train_model(
        mobilenet, 'MobileNetV3Large', train_gen, val_gen
    )
    trained_models.append(mobilenet)
    
    # Train ResNet
    resnet, hist1_res, hist2_res = train_model(
        resnet, 'ResNet152V2', train_gen, val_gen
    )
    trained_models.append(resnet)
    
    # Evaluate ensemble
    accuracy, high_conf_acc, confidences = evaluate_ensemble(
        trained_models, test_gen, class_labels
    )
    
    # Save ensemble metadata
    metadata = {
        "models": ["EfficientNetB7", "MobileNetV3Large", "ResNet152V2"],
        "ensemble_accuracy": float(accuracy),
        "high_confidence_accuracy": float(high_conf_acc),
        "confidence_threshold": CONFIDENCE_THRESHOLD,
        "num_classes": NUM_CLASSES,
        "img_size": IMG_SIZE,
        "training_date": datetime.now().isoformat()
    }
    
    with open(os.path.join(MODEL_SAVE_DIR, 'ensemble_metadata.json'), 'w') as f:
        json.dump(metadata, f, indent=2)
    
    print("\n✅ Training complete!")
    print(f"📁 Models saved to: {MODEL_SAVE_DIR}")
    print(f"📊 Logs saved to: {LOGS_DIR}")
    
    return trained_models, metadata

if __name__ == "__main__":
    # Enable GPU memory growth
    gpus = tf.config.list_physical_devices('GPU')
    if gpus:
        for gpu in gpus:
            tf.config.experimental.set_memory_growth(gpu, True)
        print(f"🎮 Using GPU: {gpus}")
    
    main()
