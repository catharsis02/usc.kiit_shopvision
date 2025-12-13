# 🍎 SHOPVISION FRUIT DETECTION - QUICK START GUIDE

## ⚡ FOR HACKATHON: FASTEST WAY TO WIN

### 📋 REQUIREMENTS
```bash
pip install opencv-python numpy scikit-learn pillow
```

### 🚀 3 STEPS TO SUCCESS

#### STEP 1: Download & Organize Dataset
```
1. Download your Google Drive dataset
2. Extract to folder: ./fruit_dataset/
3. Structure should be:
   
   fruit_dataset/
   ├── apple/
   │   ├── apple_1.jpg
   │   ├── apple_2.jpg
   │   └── ...
   ├── grapes/
   │   ├── grapes_1.jpg
   │   └── ...
   ├── strawberry/
   ├── tomato/
   └── ... (all your fruit types)
```

#### STEP 2: Train Model (10-15 minutes)
```bash
python train_fruit_detection.py
```

**Output files created:**
- ✅ `fruit_model.pkl` (trained model)
- ✅ `scaler.pkl` (feature scaler)
- ✅ `classes.json` (fruit class names)

#### STEP 3: Use in Your App

**Option A: Python Backend**
```python
from predict_fruit import FruitDetector
import json

detector = FruitDetector()
result = detector.predict('path/to/image.jpg')
print(json.dumps(result, indent=2))
```

**Option B: Flask Web API** (for your app)
```python
from flask import Flask, request, jsonify
from predict_fruit import FruitDetector

app = Flask(__name__)
detector = FruitDetector()

@app.route('/detect', methods=['POST'])
def detect_fruit():
    file = request.files['image']
    file.save('temp.jpg')
    result = detector.predict('temp.jpg')
    return jsonify(result)

if __name__ == '__main__':
    app.run(debug=True, port=5000)
```

Then call from JavaScript:
```javascript
const formData = new FormData();
formData.append('image', imageFile);

fetch('http://localhost:5000/detect', {
    method: 'POST',
    body: formData
})
.then(res => res.json())
.then(data => {
    console.log(data);
    // Update UI with result
});
```

---

## 📊 EXPECTED RESULTS

After training, you'll get output like:

```json
{
    "status": "SUCCESS",
    "item": "Apple",
    "quantity": 1,
    "confidence": 94.5,
    "price_per_unit": "₹4.99",
    "reason": "Color, texture, and shape match apple",
    "all_predictions": {
        "apple": 94.5,
        "tomato": 3.2,
        "strawberry": 2.3
    }
}
```

Instead of wrong predictions like "Strawberry" for an Apple! ✅

---

## 🎯 HACKATHON TIPS

1. **Start training immediately** - it takes 10-15 min, do it while coding UI
2. **Use the confidence threshold** - reject low confidence predictions
3. **Test with your app images** - make sure they're similar quality to training data
4. **Show confidence scores to user** - "94% confident it's an Apple"
5. **Add manual review** - for low confidence, let user correct

---

## ❌ TROUBLESHOOTING

**Problem: "No images found in dataset"**
- Check folder structure is correct
- Files should be .jpg, .jpeg, .png

**Problem: Low accuracy (~50-60%)**
- Need more images (minimum 100 per fruit type)
- Images should be clear, well-lit
- Similar quality to what users will upload

**Problem: "Module not found"**
```bash
pip install --upgrade opencv-python numpy scikit-learn pillow
```

---

## 📈 IMPROVEMENT IDEAS (after hackathon)

1. Use **YOLOv8** for faster, more accurate detection
2. Add **data augmentation** during training
3. Ensemble multiple models
4. Use **transfer learning** with pre-trained models

---

**Good luck in the hackathon! 🚀🍎**
