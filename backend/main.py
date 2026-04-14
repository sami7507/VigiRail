"""
RailGuard AI - FastAPI Backend (v2)
Supports train/route selection + per-station monitoring
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import random
from datetime import datetime
from pydantic import BaseModel
from ml_model import RailwayMLModel
from trains_data import TRAINS

app = FastAPI(title="RailGuard AI API", version="2.0.0")
app.add_middleware(CORSMiddleware, allow_origins=["http://localhost:3000","http://127.0.0.1:3000"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

ml_model = RailwayMLModel()
ml_model.train()

sim = {"failure_mode": False, "selected_train": "12951", "current_station_idx": 0, "tick": 0, "alerts_today": 0, "station_health": {}}

class SimulateRequest(BaseModel):
    failure: bool
class TrainSelectRequest(BaseModel):
    train_number: str
class StationSelectRequest(BaseModel):
    station_idx: int

def generate_sensor_data(failure_mode, tick, km):
    kf = min(km / 1500, 1.0)
    if failure_mode:
        return {"vibration": round(random.uniform(7.5,10.5),2), "temperature": round(random.uniform(82,97),1), "acoustic": round(random.uniform(75,95),1), "wear": round(random.uniform(65,80),1)}
    slight = (tick % 30) < 10
    return {
        "vibration":    round(1.5 + kf*1.2 + random.uniform(0, 2.5 if slight else 1.5), 2),
        "temperature":  round(45  + kf*10  + random.uniform(0, 18 if slight else 12), 1),
        "acoustic":     round(28  + random.uniform(0, 20 if slight else 12), 1),
        "wear":         round(12  + kf*15  + random.uniform(0, 15 if slight else 8), 1),
    }

def generate_bogie_data(failure_mode):
    if failure_mode:
        statuses = ["danger","warn","danger","warn","danger","warn"]
        temps = [random.randint(87,95),random.randint(70,78),random.randint(89,96),random.randint(68,74),random.randint(86,94),random.randint(71,77)]
    else:
        statuses = ["good","good","good","good","warn","good"]
        temps = [random.randint(48,56),random.randint(46,54),random.randint(50,58),random.randint(49,55),random.randint(64,70),random.randint(51,57)]
    labels = ["Bogie 1 (Front)","Bogie 2","Bogie 3","Bogie 4","Bogie 5","Bogie 6 (Rear)"]
    return [{"id":f"B{i+1}","label":labels[i],"status":statuses[i],"temp":temps[i]} for i in range(6)]

def build_route_health(train_data, failure_mode):
    route = train_data["route"]
    result = []
    for i, st in enumerate(route):
        if failure_mode and i == sim["current_station_idx"]:
            h, s = random.randint(15,30), "danger"
        elif i < sim["current_station_idx"]:
            h = sim["station_health"].get(st["code"], random.randint(78,96))
            s = "good" if h >= 70 else "warn"
        elif i == sim["current_station_idx"]:
            h = sim["station_health"].get(st["code"], random.randint(80,92))
            s = "warn" if h < 70 else "good"
        else:
            h, s = random.randint(75,95), "good"
        result.append({**st, "health": h, "status": s, "is_current": i == sim["current_station_idx"]})
    return result

def get_maintenance_suggestions(predictions, sensors, failure_mode):
    if failure_mode:
        return [
            {"title":"STOP TRAIN — Emergency Inspection","detail":"Critical vibration and heat. Immediate stop required.","urgency":"urgent","icon":"🚨"},
            {"title":"Cool Down Axle Bearings","detail":"Temperature above 85°C on Bogies 1,3,5. Apply coolant.","urgency":"urgent","icon":"🔥"},
            {"title":"Replace Wheel Bearings B1, B3","detail":"Estimated service: 4 hours. Use set WB-4471.","urgency":"today","icon":"🔧"},
        ]
    items = [{"title":"Wheel Inspection","detail":"All wheels within safe limits.","urgency":"done","icon":"✅"}]
    if sensors["wear"] > 30:
        items.append({"title":"Lubricate Axle Bearings","detail":"Mild friction detected. Do within 7 days.","urgency":"soon","icon":"🔩"})
    items.append({"title":"Brake Pad Measurement","detail":"Pads at 69% life. Check before next long run.","urgency":"planned","icon":"🔍"})
    return items

@app.get("/")
def root(): return {"message": "RailGuard AI v2 API", "status": "ok"}

@app.get("/api/trains")
def list_trains():
    return [{"number":t["number"],"name":t["name"],"from":t["from"],"to":t["to"],"zone":t["zone"],"type":t["type"],"distance_km":t["distance_km"],"stations":len(t["route"])} for t in TRAINS.values()]

@app.post("/api/select-train")
def select_train(req: TrainSelectRequest):
    if req.train_number not in TRAINS:
        raise HTTPException(status_code=404, detail=f"Train {req.train_number} not found")
    sim["selected_train"] = req.train_number
    sim["current_station_idx"] = 0
    sim["station_health"] = {}
    sim["alerts_today"] = 0
    return {"status":"ok","train":TRAINS[req.train_number]["name"]}

@app.post("/api/select-station")
def select_station(req: StationSelectRequest):
    train = TRAINS[sim["selected_train"]]
    if req.station_idx < 0 or req.station_idx >= len(train["route"]):
        raise HTTPException(status_code=400, detail="Invalid station index")
    sim["current_station_idx"] = req.station_idx
    return {"status":"ok","station":train["route"][req.station_idx]["name"]}

@app.get("/api/sensor-data")
def get_sensor_data():
    sim["tick"] += 1
    tick = sim["tick"]
    failure = sim["failure_mode"]
    train_data = TRAINS[sim["selected_train"]]
    st_idx = sim["current_station_idx"]
    station = train_data["route"][st_idx]
    sensors = generate_sensor_data(failure, tick, station["km"])
    bogies = generate_bogie_data(failure)
    pred = ml_model.predict(sensors["vibration"],sensors["temperature"],sensors["acoustic"],sensors["wear"])
    health_score = pred["health_score"]
    sim["station_health"][station["code"]] = health_score
    # Auto-advance train along route every 30 ticks
    if tick % 30 == 0 and not failure:
        nxt = st_idx + 1
        if nxt < len(train_data["route"]):
            sim["current_station_idx"] = nxt
    fp = pred["failure_probability"]
    if failure or fp >= 0.70:
        sys_state = "danger"
        alert_msg = f"🚨 CRITICAL: Multiple sensors in danger zone near {station['name']}. Stop train immediately."
        sim["alerts_today"] += 1
    elif fp >= 0.35:
        sys_state = "warn"
        alert_msg = f"⚠️ Attention: Elevated readings approaching {station['name']}. Monitor closely."
    else:
        sys_state = "good"
        alert_msg = f"✅ All systems normal near {station['name']}, {station['state']}. Train is in good health."
    return {
        "timestamp": datetime.now().isoformat(),
        "train": {"number":train_data["number"],"name":train_data["name"],"zone":train_data["zone"],"type":train_data["type"],"from":train_data["from"],"to":train_data["to"],"distance_km":train_data["distance_km"],"avg_speed_kmh":train_data["avg_speed_kmh"],"rake_type":train_data["rake_type"]},
        "current_station": {**station, "index": st_idx},
        "route": build_route_health(train_data, failure),
        "state": sys_state,
        "health_score": health_score,
        "failure_probability": round(fp*100,1),
        "days_until_service": max(0, round((1-fp)*20)),
        "alerts_today": sim["alerts_today"],
        "alert_message": alert_msg,
        "sensors": sensors,
        "bogies": bogies,
        "predictions": {"wheel_bearing_failure":round(pred["wheel_bearing"]*100,1),"track_damage_risk":round(pred["track_damage"]*100,1),"overheating_risk":round(pred["overheating"]*100,1),"brake_wear":round(pred["brake_wear"]*100,1)},
        "model_confidence": round(pred["confidence"]*100,1),
        "maintenance_suggestions": get_maintenance_suggestions(pred, sensors, failure),
    }

@app.post("/api/simulate")
def set_simulation(req: SimulateRequest):
    sim["failure_mode"] = req.failure
    if not req.failure: sim["alerts_today"] = 0
    return {"status":"ok","failure_mode":sim["failure_mode"]}

@app.get("/api/status")
def get_status():
    train = TRAINS[sim["selected_train"]]
    return {"api":"online","selected_train":train["name"],"train_number":sim["selected_train"],"failure_mode":sim["failure_mode"],"uptime_ticks":sim["tick"]}
