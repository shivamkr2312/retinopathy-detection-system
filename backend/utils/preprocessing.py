import numpy as np
import tensorflow as tf

IMAGE_SIZE = 300

def preprocess_image(pil_image):
    # Match Notebook 09: RGB, 300x300, float32 values in [0, 255].
    image = pil_image.convert("RGB").resize((IMAGE_SIZE, IMAGE_SIZE))
    array = np.asarray(image, dtype=np.float32)
    return tf.convert_to_tensor(array[None, ...], dtype=tf.float32)
