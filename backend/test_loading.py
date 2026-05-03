
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from models.ml_models import ml_models

print(f"Is loaded: {ml_models.is_loaded()}")
print(f"Models: {ml_models.models.keys()}")
print(f"Metadata: {ml_models.metadata.keys()}")
