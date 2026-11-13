# Retinopathy Detection System

<p align="center">
  <strong>A Deep Learning-Based Retinal Image Classification and Explainability Platform</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Python-3.11-blue?logo=python" />
  <img src="https://img.shields.io/badge/TensorFlow-2.16.1-orange?logo=tensorflow" />
  <img src="https://img.shields.io/badge/React-Frontend-61DAFB?logo=react" />
  <img src="https://img.shields.io/badge/Flask-Backend-black?logo=flask" />
  <img src="https://img.shields.io/badge/License-MIT-green.svg" />
</p>

---

## Overview

**Retinopathy Detection System** is a deep learning-based research project designed to classify retinal fundus images into five severity grades (Grade 0–Grade 4).

The project explores transfer learning and hybrid convolutional neural network architectures using EfficientNetB3 and MobileNetV2. It integrates image preprocessing, model evaluation, Grad-CAM explainability, and a web-based application.

The platform provides an interactive interface where users can upload retinal images and view the model's predicted grade, confidence score, and class probability distribution.

> This project is an academic research prototype and is not intended to replace professional medical examination or diagnosis.

## Key Features

- Five-grade retinal image classification (Grade 0–Grade 4).
- Retinal image preprocessing and enhancement.
- EfficientNetB3 and MobileNetV2 model experiments.
- Hybrid CNN architecture combining feature representations.
- Targeted model optimization using focal loss.
- Grad-CAM-based visual explainability.
- Model performance comparison and evaluation.
- React-based interactive frontend.
- Flask-based prediction API.
- Image upload, prediction confidence, and probability visualization.

## System Architecture

```text
                 USER
                  |
                  v
          REACT WEB APPLICATION
                  |
             Image Upload
                  |
                  v
             FLASK REST API
                  |
                  v
          IMAGE PREPROCESSING
                  |
          Resize / Enhancement
                  |
                  v
          TRAINED HYBRID MODEL
                  |
          EfficientNetB3
                  +
             MobileNetV2
                  |
                  v
          FIVE-GRADE CLASSIFIER
                  |
          Prediction + Confidence
                  |
                  v
          RESULTS DASHBOARD
                  |
          Grade / Probabilities
```

## Model Development

The project evaluates multiple deep learning architectures to compare classification performance and computational efficiency.

| Architecture | Validation Accuracy |
|---|---:|
| EfficientNetB3 | 74.08% |
| MobileNetV2 | 66.58% |
| Hybrid EfficientNetB3 + MobileNetV2 | 76.94% |
| Optimized Hybrid (Focal Loss) | **78.17%** |

**Selected candidate:** Optimized Hybrid EfficientNetB3 + MobileNetV2.

The candidate was selected using validation performance, with consideration of Quadratic Weighted Kappa (QWK), macro F1-score, and accuracy.

### Selected Model Metrics

| Metric | Validation Result |
|---|---:|
| Accuracy | 78.17% |
| Macro Precision | 62.81% |
| Macro Recall | 63.60% |
| Macro F1-score | 62.84% |
| Quadratic Weighted Kappa | 0.8476 |

*These are validation results from the project's model-selection workflow. They are not independent test-set results or evidence of clinical performance.*

## Explainability with Grad-CAM

Grad-CAM is used to generate visual heatmaps showing image regions that influence the selected model class score.

This provides an additional interpretability view of the model's predictions. Heatmaps should not be interpreted as proof of medical findings or clinical reasoning.

## Technology Stack

| Component | Technologies |
|---|---|
| Programming | Python |
| Deep Learning | TensorFlow, Keras |
| Computer Vision | OpenCV |
| Data Processing | NumPy, Pandas |
| Model Architectures | EfficientNetB3, MobileNetV2 |
| Explainability | Grad-CAM |
| Backend | Flask, Flask-CORS |
| Frontend | React, JavaScript, CSS |
| Development | VS Code, Jupyter Notebook, Git |

## Repository Structure

```text
retinopathy-detection-system/
│
├── backend/
│   ├── app.py
│   ├── requirements.txt
│   ├── test_prediction.py
│   ├── model/
│   ├── outputs/
│   └── utils/
│       └── preprocessing.py
│
├── data/
│   └── processed/
│       └── results/
│
├── docs/
│
├── frontend/
│   ├── public/
│   ├── src/
│   ├── package.json
│   └── vite.config.js
│
├── notebooks/
│   ├── 01_aptos_dataset_exploration.ipynb
│   ├── 02_aptos_dataset_splitting.ipynb
│   ├── 03_image_preprocessing.ipynb
│   ├── 04_data_augmentation.ipynb
│   ├── 05_efficientnetb3_model.ipynb
│   ├── 06_mobilenetv2_model.ipynb
│   ├── 07_hybrid_model.ipynb
│   ├── 08_model_optimization.ipynb
│   ├── 09_gradcam_visualization.ipynb
│   └── 10_final_model_evaluation.ipynb
│
├── src/
├── tests/
├── .gitignore
├── README.md
└── requirements.txt
```

## Dataset

The model development workflow uses the APTOS 2019 dataset.

The dataset contains retinal fundus images with five ordinal severity grades, labelled from Grade 0 to Grade 4.

Dataset access:

- [APTOS 2019 Blindness Detection – Kaggle](https://www.kaggle.com/competitions/aptos2019-blindness-detection)

The dataset is not included in this repository. Users must obtain it separately and follow its applicable terms of use.

## Installation and Setup

### Prerequisites

- Python 3.11
- Node.js and npm
- Git
- VS Code (recommended)

### 1. Clone the repository

```bash
git clone https://github.com/shivamkr2312/retinopathy-detection-system.git

cd retinopathy-detection-system
```

### 2. Create a Python virtual environment

Windows PowerShell:

```powershell
python -m venv venv

.\venv\Scripts\Activate.ps1
```

### 3. Install backend dependencies

```powershell
cd backend

pip install -r requirements.txt
```

### 4. Configure the trained model

Place the trained model file at:

```text
backend/model/retinopathy_detection_final_model.keras
```

The model is distributed separately and is not included in this Git repository.

### 5. Start the Flask backend

From the `backend` directory:

```powershell
python app.py
```

The backend runs on the local development address configured in the application.

### 6. Install frontend dependencies

Open a second terminal:

```powershell
cd frontend

npm install
```

### 7. Start the React application

```powershell
npm run dev
```

Open the local URL printed by Vite in your browser.

Ensure that the frontend API configuration points to the running Flask backend.

## Model Evaluation

The project includes evaluation artifacts such as:

- Classification reports.
- Confusion matrices.
- Model comparison results.
- Training and fine-tuning histories.
- Prediction analysis.
- Efficiency measurements.
- Grad-CAM visualizations.

These artifacts support the experimental analysis and comparison of the evaluated architectures.

## Limitations

- Performance depends on image quality, dataset characteristics, and class distribution.
- Validation results do not establish generalization to unseen clinical populations.
- External images may differ from the training dataset.
- Grad-CAM visualizations are interpretability aids, not clinical explanations.
- Independent external validation and clinical assessment are required before any real-world medical use.

## Future Improvements

- Evaluate on an independent external dataset.
- Improve minority-grade classification and recall.
- Investigate calibration and prediction uncertainty.
- Optimize inference speed and deployment efficiency.
- Expand automated testing and API validation.
- Improve deployment reliability and monitoring.

## Academic Project

Developed as an academic deep learning project exploring computer vision, transfer learning, model evaluation, and explainable AI.

**Author:** Shivam Kumar

**GitHub:** [@shivamkr2312](https://github.com/shivamkr2312)

**Project:** [Retinopathy Detection System](https://github.com/shivamkr2312/retinopathy-detection-system)

---

<p align="center">
  <strong>Retinopathy Detection System</strong><br/>
  Deep Learning • Computer Vision • Explainable AI
</p>