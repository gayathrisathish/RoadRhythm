from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib, numpy as np, os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"]
)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
model = joblib.load(os.path.join(BASE_DIR, 'model.joblib'))
LABELS = ['Low', 'Medium', 'High', 'Severe']

class Input(BaseModel):
    hour: int
    day_of_week: int
    is_weekend: int
    is_rush_hour: int
    weather_severity: int
    temp: float

@app.post("/predict")
def predict(data: Input):
    X = np.array([[
        data.hour,
        data.day_of_week,
        3,
        data.is_weekend,
        data.is_rush_hour,
        0,
        data.weather_severity,
        data.temp,
        data.weather_severity * data.is_rush_hour,
        data.is_weekend * data.hour,
        data.temp * data.hour,
        20, 0, 0
    ]])

    pred  = int(model.predict(X)[0])
    proba = model.predict_proba(X)[0].tolist()

    best_hour = 8
    best_score = 999
    for h in range(6, 23):
        Xh = X.copy()
        Xh[0][0] = h
        Xh[0][4] = int(h in [7,8,9,16,17,18])
        Xh[0][8] = data.weather_severity * int(h in [7,8,9,16,17,18])
        Xh[0][9] = data.is_weekend * h
        Xh[0][10] = data.temp * h
        score = int(model.predict(Xh)[0])
        if score < best_score:
            best_score = score
            best_hour = h

    return {
        "congestion_level": LABELS[pred],
        "confidence": round(proba[pred] * 100),
        "probabilities": {
            "Low":    round(proba[0] * 100),
            "Medium": round(proba[1] * 100),
            "High":   round(proba[2] * 100),
            "Severe": round(proba[3] * 100)
        },
        "best_hour": best_hour,
        "predicted_volume": int(3000 + pred * 800 + 
                               data.weather_severity * 200)
    }

@app.get("/health")
def health():
    return {"status": "ok"}
