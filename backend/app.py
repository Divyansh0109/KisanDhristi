import json
from pathlib import Path
from typing import List

import numpy as np
import tensorflow as tf
from flask import Flask, jsonify, request
from flask_cors import CORS
from PIL import Image, UnidentifiedImageError


BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH = BASE_DIR / "model.h5"
CLASS_NAMES_PATH = BASE_DIR / "class_names.json"
IMAGE_SIZE = (224, 224)


def load_class_names(path: Path) -> List[str]:
    with path.open("r", encoding="utf-8") as file:
        class_names = json.load(file)

    if not isinstance(class_names, list) or not all(
        isinstance(name, str) for name in class_names
    ):
        raise ValueError("class_names.json must contain a JSON array of strings.")

    return class_names


def load_assets():
    if not MODEL_PATH.exists():
        raise FileNotFoundError(f"Model file not found: {MODEL_PATH}")
    if not CLASS_NAMES_PATH.exists():
        raise FileNotFoundError(f"Class names file not found: {CLASS_NAMES_PATH}")

    loaded_model = tf.keras.models.load_model(MODEL_PATH)
    loaded_class_names = load_class_names(CLASS_NAMES_PATH)
    return loaded_model, loaded_class_names


model, class_names = load_assets()


app = Flask(__name__)
CORS(app)


@app.get("/")
def health_check():
    return jsonify({"status": "ok"})


@app.post("/predict")
def predict():
    if "image" not in request.files:
        return jsonify({"error": 'Missing image file under key "image".'}), 400

    image_file = request.files["image"]
    if image_file.filename == "":
        return jsonify({"error": "No image file selected."}), 400

    try:
        image = Image.open(image_file.stream).convert("RGB")
    except (UnidentifiedImageError, OSError, ValueError):
        return jsonify({"error": "Invalid or corrupt image file."}), 400

    image = image.resize(IMAGE_SIZE)
    image_array = np.array(image, dtype=np.float32)
    input_batch = np.expand_dims(image_array, axis=0)

    predictions = model.predict(input_batch, verbose=0)
    predicted_index = int(np.argmax(predictions[0]))
    confidence = float(predictions[0][predicted_index] * 100.0)
    class_name = class_names[predicted_index]

    if "___" in class_name:
        crop, condition = class_name.split("___", 1)
    else:
        crop = class_name
        condition = ""

    return jsonify(
        {
            "class_name": class_name,
            "confidence": confidence,
            "crop": crop,
            "condition": condition,
        }
    )


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
