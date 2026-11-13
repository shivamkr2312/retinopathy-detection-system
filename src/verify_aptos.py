
from pathlib import Path
import pandas as pd
from PIL import Image

# Dataset path
BASE = Path("data/raw/aptos/aptos2019-blindness-detection")

train_dir = BASE / "train_images"
test_dir = BASE / "test_images"

# Load CSV files
train = pd.read_csv(BASE / "train.csv")
test = pd.read_csv(BASE / "test.csv")

print("\n===== APTOS DATASET VERIFICATION =====")

# CSV information
print("\nTraining CSV:", train.shape)
print("Testing CSV:", test.shape)

print("\nColumns:", train.columns.tolist())

# Image counts
train_images = list(train_dir.glob("*"))
test_images = list(test_dir.glob("*"))

print("\nTraining images:", len(train_images))
print("Testing images:", len(test_images))

# DR class distribution
print("\nDR CLASS DISTRIBUTION:")
print(train["diagnosis"].value_counts().sort_index())

# Verify image readability
valid = 0
corrupt = 0

for path in train_images + test_images:
    try:
        with Image.open(path) as img:
            img.verify()
        valid += 1
    except Exception:
        corrupt += 1

print("\nValid images:", valid)
print("Corrupted images:", corrupt)

# Sample image dimensions
print("\nSAMPLE IMAGE DIMENSIONS:")

for path in train_images[:5]:
    with Image.open(path) as img:
        print(path.name, img.size, img.format)

print("\n===== VERIFICATION COMPLETED =====")
