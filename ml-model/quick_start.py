"""
Quick Start Script for ShopVision ML Training
Automates the entire training process
"""

import os
import sys
import subprocess
from pathlib import Path

def print_header(text):
    print("\n" + "="*80)
    print(f"  {text}")
    print("="*80 + "\n")

def check_python_version():
    """Ensure Python 3.8+"""
    version = sys.version_info
    if version.major < 3 or (version.major == 3 and version.minor < 8):
        print("❌ Python 3.8+ required")
        sys.exit(1)
    print(f"✅ Python {version.major}.{version.minor}.{version.micro}")

def install_requirements():
    """Install all required packages"""
    print_header("Installing Requirements")
    
    requirements_file = 'requirements_advanced.txt'
    
    if not os.path.exists(requirements_file):
        print(f"❌ {requirements_file} not found")
        return False
    
    try:
        subprocess.run([
            sys.executable, '-m', 'pip', 'install', '-r', requirements_file
        ], check=True)
        print("✅ All requirements installed")
        return True
    except subprocess.CalledProcessError:
        print("❌ Failed to install requirements")
        return False

def download_dataset():
    """Download Fruits-360 dataset"""
    print_header("Downloading Fruits-360 Dataset")
    
    if os.path.exists('data/fruits-360'):
        print("✅ Dataset already exists")
        return True
    
    try:
        subprocess.run([sys.executable, 'download_dataset.py'], check=True)
        print("✅ Dataset downloaded successfully")
        return True
    except subprocess.CalledProcessError:
        print("❌ Failed to download dataset")
        print("💡 Manual download: https://www.kaggle.com/datasets/moltean/fruits")
        return False

def verify_dataset():
    """Verify dataset integrity"""
    print_header("Verifying Dataset")
    
    train_dir = Path('data/fruits-360/Training')
    test_dir = Path('data/fruits-360/Test')
    
    if not train_dir.exists() or not test_dir.exists():
        print("❌ Dataset directories not found")
        return False
    
    # Count classes
    train_classes = len(list(train_dir.iterdir()))
    test_classes = len(list(test_dir.iterdir()))
    
    print(f"✅ Training classes: {train_classes}")
    print(f"✅ Testing classes: {test_classes}")
    
    # Count images
    train_images = sum(1 for _ in train_dir.rglob('*.jpg'))
    test_images = sum(1 for _ in test_dir.rglob('*.jpg'))
    
    print(f"✅ Training images: {train_images}")
    print(f"✅ Testing images: {test_images}")
    
    if train_images < 1000:
        print("⚠️ Warning: Low training image count")
        return False
    
    return True

def train_models():
    """Train ensemble models"""
    print_header("Training Ensemble Models")
    print("🚀 This will take 6-8 hours with GPU, 24-36 hours with CPU")
    print("📊 Monitor progress: tensorboard --logdir=logs/training")
    
    response = input("\nContinue with training? (y/n): ")
    if response.lower() != 'y':
        print("⏸️ Training cancelled")
        return False
    
    try:
        subprocess.run([sys.executable, 'advanced_train.py'], check=True)
        print("✅ Training completed successfully")
        return True
    except subprocess.CalledProcessError:
        print("❌ Training failed")
        return False

def start_api():
    """Start prediction API server"""
    print_header("Starting Prediction API")
    
    if not Path('models/ensemble').exists():
        print("❌ Models not found. Train models first.")
        return False
    
    print("🌐 Starting API on http://localhost:5000")
    print("📡 Endpoints:")
    print("   POST /predict - Predict fruit/vegetable")
    print("   GET  /health  - Health check")
    print("   GET  /classes - List all classes")
    
    try:
        subprocess.run([sys.executable, 'ensemble_predict.py'])
    except KeyboardInterrupt:
        print("\n⏹️ API server stopped")

def main():
    """Main setup workflow"""
    print("="*80)
    print("  🍎 ShopVision ML Training - Quick Start")
    print("="*80)
    
    # Step 1: Check Python version
    print_header("Step 1/5: Checking Python Version")
    check_python_version()
    
    # Step 2: Install requirements
    print_header("Step 2/5: Installing Requirements")
    if not install_requirements():
        print("\n❌ Setup failed at requirements installation")
        return
    
    # Step 3: Download dataset
    print_header("Step 3/5: Downloading Dataset")
    if not download_dataset():
        print("\n⚠️ Dataset download failed. Please download manually.")
        print("💡 Extract to: ml-model/data/fruits-360/")
        return
    
    # Step 4: Verify dataset
    print_header("Step 4/5: Verifying Dataset")
    if not verify_dataset():
        print("\n❌ Dataset verification failed")
        return
    
    # Step 5: Train models
    print_header("Step 5/5: Training Models")
    if not train_models():
        print("\n⏸️ Training skipped or failed")
        return
    
    # Success!
    print_header("🎉 Setup Complete!")
    print("✅ All steps completed successfully")
    print("\n📋 Next steps:")
    print("   1. Start API: python ensemble_predict.py")
    print("   2. Test prediction: curl -X POST http://localhost:5000/predict -F 'image=@test.jpg'")
    print("   3. Integrate with ShopVision app")
    print("\n📊 View training logs:")
    print("   tensorboard --logdir=logs/training")
    
    # Ask to start API
    response = input("\nStart prediction API now? (y/n): ")
    if response.lower() == 'y':
        start_api()

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n⏹️ Setup interrupted by user")
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")
        import traceback
        traceback.print_exc()
