import cv2
import os
import time
from datetime import datetime
from roboflow import Roboflow
import numpy as np
import json
import threading

class PPEMonitor:
    def __init__(self, api_key, project_name, project_version):
        self.rf = Roboflow(api_key=api_key)
        self.project = self.rf.workspace().project(project_name)
        self.model = self.project.version(project_version).model
        
        self.violations_dir = "public/violations"
        os.makedirs(self.violations_dir, exist_ok=True)
        
        self.active_cameras = {}
        self.camera_threads = {}
        self.load_camera_config()
        self.start_monitoring()

    def load_camera_config(self):
        try:
            with open('camera_config.json', 'r') as f:
                self.camera_config = json.load(f)
        except FileNotFoundError:
            self.camera_config = {"cameras": {}}

    def connect_camera(self, camera_id):
        config = self.camera_config["cameras"].get(camera_id)
        if not config:
            return None
            
        camera_url = f"rtsp://{config['ipAddress']}:{config['port']}/stream"
        cap = cv2.VideoCapture(camera_url)
        if cap.isOpened():
            self.active_cameras[camera_id] = cap
            return cap
        return None

    def process_frame(self, frame, camera_id):
        _, img_encoded = cv2.imencode('.jpg', frame)
        predictions = self.model.predict(img_encoded.tobytes(), confidence=40, overlap=30)
        
        violations_detected = []
        config = self.camera_config["cameras"].get(camera_id)
        if config and predictions:
            for prediction in predictions:
                if prediction["class"] in config["monitoredViolations"]:
                    violations_detected.append(prediction["class"])
                    
        return violations_detected

    def save_violation(self, frame, camera_id, violation_type):
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"violation_{camera_id}_{timestamp}.jpg"
        filepath = os.path.join(self.violations_dir, filename)
        cv2.imwrite(filepath, frame)
        
        violation = {
            "id": f"{camera_id}_{timestamp}",
            "cameraId": camera_id,
            "timestamp": datetime.now().isoformat(),
            "imageUrl": f"/violations/{filename}",
            "type": violation_type
        }
        
        with open('violations.json', 'a') as f:
            f.write(json.dumps(violation) + '\n')
        
        return violation

    def monitor_camera(self, camera_id):
        while True:
            try:
                cap = self.active_cameras.get(camera_id)
                if not cap or not cap.isOpened():
                    cap = self.connect_camera(camera_id)
                    if not cap:
                        time.sleep(5)
                        continue

                ret, frame = cap.read()
                if not ret:
                    if camera_id in self.active_cameras:
                        del self.active_cameras[camera_id]
                    time.sleep(1)
                    continue

                violations = self.process_frame(frame, camera_id)
                for violation in violations:
                    self.save_violation(frame, camera_id, violation)

                time.sleep(0.1)

            except Exception as e:
                print(f"Error monitoring camera {camera_id}: {str(e)}")
                time.sleep(5)

    def start_monitoring(self):
        while True:
            try:
                self.load_camera_config()
                
                # Start new camera threads
                for camera_id in self.camera_config["cameras"]:
                    if camera_id not in self.camera_threads:
                        thread = threading.Thread(
                            target=self.monitor_camera,
                            args=(camera_id,),
                            daemon=True
                        )
                        thread.start()
                        self.camera_threads[camera_id] = thread
                
                # Clean up disconnected cameras
                for camera_id in list(self.active_cameras.keys()):
                    if camera_id not in self.camera_config["cameras"]:
                        if camera_id in self.active_cameras:
                            self.active_cameras[camera_id].release()
                            del self.active_cameras[camera_id]
                
                time.sleep(5)

            except Exception as e:
                print(f"Error in monitoring loop: {str(e)}")
                time.sleep(5)

def main():
    ROBOFLOW_API_KEY = "njaeI4xUSjjdBYFcXo4P"
    PROJECT_NAME = "testing-roboflow-k8mml"
    PROJECT_VERSION = 1
    
    monitor = PPEMonitor(ROBOFLOW_API_KEY, PROJECT_NAME, PROJECT_VERSION)
    
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("Shutting down...")
        for cap in monitor.active_cameras.values():
            cap.release()

if __name__ == "__main__":
    main()