from pathlib import Path
import uuid
import numpy as np
import tensorflow as tf
from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image, UnidentifiedImageError
from utils.preprocessing import preprocess_image

ROOT = Path(__file__).resolve().parent
MODEL_PATH = ROOT / "model" / "retinopathy_detection_final_model.keras"
UPLOAD_DIR = ROOT / "outputs" / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

app = Flask(__name__)
CORS(app)
app.config["MAX_CONTENT_LENGTH"] = 12 * 1024 * 1024

if not MODEL_PATH.exists():
    raise FileNotFoundError(f"Copy the final model to: {MODEL_PATH}")

# compile=False avoids deserializing the custom focal-loss training function.
model = tf.keras.models.load_model(MODEL_PATH, compile=False)

CLASS_NAMES = {0: "Grade 0", 1: "Grade 1", 2: "Grade 2", 3: "Grade 3", 4: "Grade 4"}

@app.get("/api/health")
def health():
    return jsonify({
        "status": "ok",
        "model_loaded": True,
        "input_shape": str(model.input_shape),
        "output_shape": str(model.output_shape)
    })

@app.post("/api/predict")
def predict():
    if "file" not in request.files:
        return jsonify({"error": "Send an image in the 'file' field."}), 400
    uploaded = request.files["file"]
    if not uploaded.filename:
        return jsonify({"error": "No file selected."}), 400
    try:
        image = Image.open(uploaded.stream).convert("RGB")
        x = preprocess_image(image)
        probabilities = np.asarray(model.predict(x, verbose=0))[0]
        if probabilities.shape != (5,):
            return jsonify({"error": f"Expected five class scores; received {probabilities.shape}."}), 500
        predicted = int(np.argmax(probabilities))
        image_id = f"{uuid.uuid4().hex}.jpg"
        image.save(UPLOAD_DIR / image_id, format="JPEG", quality=95)
        return jsonify({
            "predicted_class": predicted,
            "predicted_label": CLASS_NAMES[predicted],
            "confidence": float(probabilities[predicted]),
            "probabilities": {CLASS_NAMES[i]: float(probabilities[i]) for i in range(5)},
            "image_id": image_id,
            "notice": "Research prototype only; not a medical diagnosis."
        })
    except (UnidentifiedImageError, OSError):
        return jsonify({"error": "Uploaded file is not a valid image."}), 400
    except Exception as exc:
        app.logger.exception("Prediction failed")
        return jsonify({"error": str(exc)}), 500

@app.errorhandler(413)
def too_large(_error):
    return jsonify({"error": "Maximum upload size is 12 MB."}), 413

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)
