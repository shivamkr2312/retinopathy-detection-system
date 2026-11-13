# Flask backend

1. Copy the final `.keras` file into `backend/model/retinopathy_detection_final_model.keras`.
2. Open terminal at `S:\ISP\backend`.
3. Activate the existing environment: `..\venv\Scripts\activate`
4. Install: `pip install -r requirements.txt`
5. Run: `python app.py`

Health check: `http://127.0.0.1:5000/api/health`

Prediction endpoint: `POST http://127.0.0.1:5000/api/predict`
Send multipart form-data with key `file`.

The model input preprocessing matches Notebook 09: RGB 300x300 float32, 0-255.
This is a research prototype, not a clinical device.
