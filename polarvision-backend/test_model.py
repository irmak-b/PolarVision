# test_model.py
from ultralytics import YOLO

model = YOLO("weights/best_model.pt")          
results = model("test2.jpeg", device=0, conf=0.25)   
results[0].save("sonuc2.jpeg")
print(model.names)