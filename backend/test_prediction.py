
import requests
from pathlib import Path

API_URL = "http://127.0.0.1:5000/api/predict"

# Select an image from the APTOS training dataset.
IMAGE_DIR = Path(
    r"S:\ISP\data\raw\aptos\aptos2019-blindness-detection\train_images"
)

images = list(IMAGE_DIR.glob("*.png"))

if not images:
    raise FileNotFoundError(
        f"No PNG images found in {IMAGE_DIR}"
    )

image_path = images[0]

print("Testing image:", image_path.name)

with open(image_path, "rb") as image:
    response = requests.post(
        API_URL,
        files={"file": (image_path.name, image, "image/png")}
    )

print("\nHTTP status:", response.status_code)
print("API response:")

print(response.json())
