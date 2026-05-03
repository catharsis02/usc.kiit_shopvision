# ML Training Guide

This project trains a fruit classifier using the Fruits 360 dataset from Kaggle.

## Dataset (Fruits 360)
Source: https://www.kaggle.com/datasets/moltean/fruits

### Kaggle API setup
1. Create a Kaggle account and download an API token (kaggle.json) from your Kaggle profile.
2. Place the token at:
   - Linux/macOS: ~/.kaggle/kaggle.json
   - Windows: %USERPROFILE%\.kaggle\kaggle.json
3. Linux/macOS only: chmod 600 ~/.kaggle/kaggle.json

### Download and extract
From the repo root:

```bash
mkdir -p fruit_dataset/dataset/Fruits-360_/data
kaggle datasets download -d moltean/fruits -p fruit_dataset/dataset/Fruits-360_/data
unzip fruit_dataset/dataset/Fruits-360_/data/fruits.zip -d fruit_dataset/dataset/Fruits-360_/data
```

If the extracted folder name is different, move or rename it so the paths below exist.

### Required folder layout
The training script expects this exact layout:

```
fruit_dataset/
  dataset/
    Fruits-360_/
      data/
        fruits-360_100x100/
          fruits-360/
            Training/
            Test/
```

## Train the model
Install dependencies and run the training script:

```bash
pip install -r requirements.txt
python ml/scripts/train_fruit_model.py
```

## Outputs
The script writes model artifacts to:

```
ml/artifacts/classifier.keras
ml/artifacts/class_names.txt
ml/artifacts/fruit_classes.json
```
