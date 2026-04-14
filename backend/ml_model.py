"""
RailGuard AI — ML Model (Simulated)
Uses scikit-learn to train a Random Forest classifier on synthetic sensor data.
In a real deployment, this would be trained on actual historical railway sensor logs.

Features used:
  - vibration  (mm/s)
  - temperature (°C)
  - acoustic    (dB)
  - wear        (%)

Outputs:
  - failure_probability  (0.0 – 1.0)
  - per-component risk scores
  - overall health score (0–100)
  - model confidence
"""

import numpy as np
import random
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
import warnings
warnings.filterwarnings("ignore")


class RailwayMLModel:
    def __init__(self):
        self.model = None
        self.scaler = StandardScaler()
        self.is_trained = False

    # ─────────────────────────────────────────────
    # GENERATE SYNTHETIC TRAINING DATA
    # ─────────────────────────────────────────────
    def _generate_training_data(self, n_samples: int = 2000):
        """
        Creates realistic synthetic sensor data for training.
        
        Labels:
          0 = Normal (healthy)
          1 = Warning (elevated)
          2 = Critical (failure imminent)
        """
        X, y = [], []
        random.seed(42)
        np.random.seed(42)

        for _ in range(n_samples):
            label = random.choices([0, 1, 2], weights=[0.60, 0.25, 0.15])[0]

            if label == 0:   # Normal operation
                vib   = np.random.uniform(0.5, 4.0)
                temp  = np.random.uniform(40, 65)
                acou  = np.random.uniform(20, 50)
                wear  = np.random.uniform(5, 30)
            elif label == 1: # Warning zone
                vib   = np.random.uniform(3.5, 6.5)
                temp  = np.random.uniform(60, 80)
                acou  = np.random.uniform(45, 70)
                wear  = np.random.uniform(28, 55)
            else:            # Critical / failure
                vib   = np.random.uniform(6.0, 12.0)
                temp  = np.random.uniform(78, 110)
                acou  = np.random.uniform(65, 100)
                wear  = np.random.uniform(50, 90)

            # Add sensor noise (real sensors are never perfectly clean)
            noise = np.random.normal(0, 0.1, 4)
            X.append([vib + noise[0], temp + noise[1], acou + noise[2], wear + noise[3]])
            y.append(label)

        return np.array(X), np.array(y)

    # ─────────────────────────────────────────────
    # TRAIN THE MODEL
    # ─────────────────────────────────────────────
    def train(self):
        """Train the Random Forest classifier on synthetic data."""
        print("[ML] Generating training data...")
        X, y = self._generate_training_data(2000)

        print("[ML] Training Random Forest model...")
        self.model = Pipeline([
            ("scaler", StandardScaler()),
            ("clf", RandomForestClassifier(
                n_estimators=100,
                max_depth=8,
                random_state=42,
                n_jobs=-1
            ))
        ])
        self.model.fit(X, y)
        self.is_trained = True

        # Quick accuracy check on training data
        score = self.model.score(X, y)
        print(f"[ML] Model trained. Training accuracy: {score*100:.1f}%")

    # ─────────────────────────────────────────────
    # PREDICT
    # ─────────────────────────────────────────────
    def predict(self, vibration: float, temperature: float,
                acoustic: float, wear: float) -> dict:
        """
        Given 4 sensor readings, returns:
          - failure_probability: overall risk (0.0–1.0)
          - per-component risks
          - health_score: 0–100 (100 = perfect)
          - confidence: model's confidence in its prediction
        """
        if not self.is_trained:
            raise RuntimeError("Model not trained. Call train() first.")

        features = np.array([[vibration, temperature, acoustic, wear]])
        proba = self.model.predict_proba(features)[0]  # [p_normal, p_warn, p_critical]

        # Failure probability = warning + critical probabilities
        failure_prob = float(proba[1] * 0.4 + proba[2] * 1.0)
        failure_prob = min(1.0, failure_prob)

        # Health score: inverse of failure risk
        health_score = round((1 - failure_prob) * 100)

        # Per-component risk estimates (weighted sensor contributions)
        # These simulate individual component assessments
        vib_norm  = min(vibration / 12.0, 1.0)
        temp_norm = min((temperature - 40) / 70.0, 1.0)
        acou_norm = min(acoustic / 100.0, 1.0)
        wear_norm = min(wear / 90.0, 1.0)

        wheel_bearing = min(vib_norm * 0.6 + wear_norm * 0.4, 1.0)
        track_damage  = min(vib_norm * 0.5 + acou_norm * 0.3 + wear_norm * 0.2, 1.0)
        overheating   = min(temp_norm * 0.7 + vib_norm * 0.3, 1.0)
        brake_wear    = min(wear_norm * 0.5 + acou_norm * 0.3 + temp_norm * 0.2, 1.0)

        # Add small random variation to make UI feel live
        noise = lambda: random.uniform(-0.03, 0.03)

        return {
            "failure_probability": round(failure_prob + noise(), 3),
            "health_score":        health_score,
            "wheel_bearing":       round(max(0, min(1, wheel_bearing + noise())), 3),
            "track_damage":        round(max(0, min(1, track_damage + noise())), 3),
            "overheating":         round(max(0, min(1, overheating + noise())), 3),
            "brake_wear":          round(max(0, min(1, brake_wear + noise())), 3),
            "confidence":          round(float(max(proba)), 3),
        }
