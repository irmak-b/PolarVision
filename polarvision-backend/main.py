# main.py
import io
from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
from ultralytics import YOLO
from risk_table import RISK_TABLE, DEFAULT
from typing import List, Optional
from fastapi import HTTPException
from pydantic import BaseModel
import reports

MODEL_PATH = "weights/best_model.pt"   
CONF = 0.4
IMGSZ = 800            # küçük nesneler için 640'tan büyük; 640 ile karşılaştır
FIRE_MIN_CONF = 0.6    # "olası" cam uyarısı için asgari güven

def scene_score(detections):
    if not detections:
        return 0
    scores = sorted((d["score"] for d in detections), reverse=True)
    return min(100, scores[0] + 5 * (len(scores) - 1))   # high risk items are more important than many low risk items

app = FastAPI(title="PolarVision API")
app.add_middleware(CORSMiddleware, allow_origins=["http://localhost:3000"],
                   allow_methods=["*"], allow_headers=["*"])

model = YOLO(MODEL_PATH)
model.predict(Image.new("RGB", (640, 640)), device=0, verbose=False)  # warm up the model


@app.post("/detect")
async def detect(file: UploadFile = File(...), conf: float = 0.3):
    img = Image.open(io.BytesIO(await file.read())).convert("RGB")
    result = model.predict(
        img, device=0, conf=conf, imgsz=IMGSZ,
        agnostic_nms=True,     # class-agnostic NMS (e.g. for overlapping bottle and bottle cap)
        verbose=False,
    )[0]

    detections, fire_levels = [], set()
    for box in result.boxes:
        name = model.names[int(box.cls)]
        c = float(box.conf)
        info = RISK_TABLE.get(name, DEFAULT)
        if info["fire"] == "yes" or (info["fire"] == "maybe" and c >= FIRE_MIN_CONF):
            fire_levels.add(info["fire"])
        detections.append({
            "label": name,
            "confidence": round(c, 3),
            "bbox": [round(v, 1) for v in box.xyxy[0].tolist()],
            **info,
        })

    fire_alert = "high" if "yes" in fire_levels else ("possible" if "maybe" in fire_levels else None)
    return {
        "width": img.width, "height": img.height,
        "count": len(detections),
        "risk_score": scene_score(detections),
        "fire_alert": fire_alert,
        "detections": detections,
    }

@app.get("/health")
def health():
    return {"status": "ok"}

class ReportIn(BaseModel):
    lat: float
    lng: float
    labels: List[str] = []
    risk_score: int = 0
    fire_alert: Optional[str] = None
    note: str = ""

class CleanIn(BaseModel):
    method: str = "self"  # "self" | "volunteers" | "municipality"


@app.post("/reports")
def create_report(r: ReportIn):
    return reports.add_report(**r.model_dump())


@app.get("/reports")
def get_reports():
    return reports.list_reports()

@app.patch("/reports/{report_id}/clean")
def clean_report(report_id: str, body: CleanIn):
    item = reports.mark_clean(report_id, body.method)
    if item is None:
        raise HTTPException(status_code=404, detail="Report not found")
    return item
