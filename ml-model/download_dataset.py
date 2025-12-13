"""
Quick Dataset Download Script for Fruits-360
Fastest method: Kaggle CLI (5-10 minutes)
"""

import os
import subprocess
import sys
from pathlib import Path

def check_kaggle_installed():
    """Check if Kaggle CLI is installed"""
    try:
        subprocess.run(['kaggle', '--version'], capture_output=True, check=True)
        return True
    except (subprocess.CalledProcessError, FileNotFoundError):
        return False

def install_kaggle():
    """Install Kaggle CLI"""
    print("📦 Installing Kaggle CLI...")
    subprocess.run([sys.executable, '-m', 'pip', 'install', 'kaggle'], check=True)
    print("✅ Kaggle CLI installed")

def setup_kaggle_credentials():
    """Guide user to setup Kaggle API key"""
    kaggle_dir = Path.home() / '.kaggle'
    kaggle_json = kaggle_dir / 'kaggle.json'
    
    if kaggle_json.exists():
        print("✅ Kaggle credentials found")
        return True
    
    print("\n🔑 Kaggle API Key Setup Required:")
    print("1. Go to: https://www.kaggle.com/settings")
    print("2. Scroll to 'API' section")
    print("3. Click 'Create New API Token'")
    print("4. Download 'kaggle.json'")
    print(f"5. Move it to: {kaggle_dir}")
    print("\nPress Enter after completing these steps...")
    input()
    
    if not kaggle_json.exists():
        print("❌ kaggle.json not found. Please complete the setup.")
        return False
    
    # Set permissions (Unix-like systems)
    try:
        kaggle_json.chmod(0o600)
    except:
        pass
    
    return True

def download_fruits360():
    """Download Fruits-360 dataset from Kaggle"""
    print("\n📥 Downloading Fruits-360 Dataset...")
    print("⏱️  Estimated time: 5-10 minutes (depending on connection)")
    print("💾 Dataset size: ~8-9 GB\n")
    
    # Create data directory
    data_dir = Path('data/fruits-360')
    data_dir.mkdir(parents=True, exist_ok=True)
    
    # Download
    try:
        subprocess.run([
            'kaggle', 'datasets', 'download',
            '-d', 'moltean/fruits',
            '-p', 'data/'
        ], check=True)
        print("✅ Download complete!")
    except subprocess.CalledProcessError as e:
        print(f"❌ Download failed: {e}")
        return False
    
    # Unzip
    print("\n📦 Extracting dataset...")
    import zipfile
    
    zip_path = Path('data/fruits.zip')
    if zip_path.exists():
        with zipfile.ZipFile(zip_path, 'r') as zip_ref:
            zip_ref.extractall('data/fruits-360')
        
        # Remove zip file
        zip_path.unlink()
        print("✅ Extraction complete!")
        
        # Verify
        train_dir = data_dir / 'Training'
        test_dir = data_dir / 'Test'
        
        if train_dir.exists() and test_dir.exists():
            train_classes = len(list(train_dir.iterdir()))
            test_classes = len(list(test_dir.iterdir()))
            
            print(f"\n✅ Dataset ready!")
            print(f"📁 Training classes: {train_classes}")
            print(f"📁 Test classes: {test_classes}")
            print(f"📍 Location: {data_dir.absolute()}")
            return True
        else:
            print("❌ Dataset structure incorrect")
            return False
    else:
        print("❌ Downloaded zip file not found")
        return False

def main():
    """Main download flow"""
    print("🍎 BharatShop - Fruits-360 Dataset Downloader")
    print("=" * 50)
    
    # Check/Install Kaggle
    if not check_kaggle_installed():
        print("⚠️  Kaggle CLI not found")
        install_kaggle()
    
    # Setup credentials
    if not setup_kaggle_credentials():
        print("\n❌ Cannot proceed without Kaggle credentials")
        print("\nAlternative: Manual download")
        print("1. Visit: https://www.kaggle.com/datasets/moltean/fruits")
        print("2. Click 'Download'")
        print("3. Extract to: data/fruits-360/")
        return
    
    # Download dataset
    if download_fruits360():
        print("\n🎉 All done! Ready to train model.")
        print("\nNext step:")
        print("python ml-model/train_fruit_model.py")
    else:
        print("\n❌ Download failed. Try manual download:")
        print("https://www.kaggle.com/datasets/moltean/fruits")

if __name__ == "__main__":
    main()
