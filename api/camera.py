from flask import Flask, request, jsonify, Response
import json
import os
import cv2
from flask_cors import CORS
import threading
from datetime import datetime
from roboflow import Roboflow
import numpy as np
import time

app = Flask(__name__)
CORS(app)

# Configuration
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CONFIG_FILE = os.path.join(BASE_DIR, 'camera_config.json')
VIOLATIONS_DIR = os.path.join(BASE_DIR, 'public/violations')

os.makedirs(VIOLATIONS_DIR, exist_ok=True)

# Initialize Roboflow
rf = Roboflow(api_key="njaeI4xUSjjdBYFcXo4P")
project = rf.workspace().project("testing-roboflow-k8mml")
model = project.version(1).model

# Global state
active_cameras = {}
camera_frames = {}
monitoring_threads = {}

def load_config():
    if os.path.exists(CONFIG_FILE):
        with open(CONFIG_FILE, 'r') as f:
            return json.load(f)
    return {"cameras": {}}

def save_config(config):
    with open(CONFIG_FILE, 'w') as f:
        json.dump(config, f, indent=2)

def monitor_camera(camera_id, config):
    print(f"Starting monitoring for camera {camera_id}")
    
    try:
        # Test için varsayılan kamera
        cap = cv2.VideoCapture(0)
        # Gerçek ortamda:
        # cap = cv2.VideoCapture(f"rtsp://{config['ipAddress']}:{config['port']}/stream")
        
        if not cap.isOpened():
            print(f"Failed to open camera {camera_id}")
            return

        active_cameras[camera_id] = cap
        camera_frames[camera_id] = None

        while camera_id in monitoring_threads:
            ret, frame = cap.read()
            if not ret:
                print(f"Failed to read frame from camera {camera_id}")
                time.sleep(0.1)
                continue

            camera_frames[camera_id] = frame.copy()

            # Yapay zeka ile analiz
            _, img_encoded = cv2.imencode('.jpg', frame)
            predictions = model.predict(img_encoded.tobytes(), confidence=40, overlap=30)
            
            # İhlalleri kontrol et
            for prediction in predictions:
                if prediction["class"] in config["monitoredViolations"]:
                    save_violation(camera_id, frame, prediction["class"])

            time.sleep(0.033)  # ~30 FPS

    except Exception as e:
        print(f"Error monitoring camera {camera_id}: {str(e)}")
    finally:
        if camera_id in active_cameras:
            active_cameras[camera_id].release()
            del active_cameras[camera_id]
        if camera_id in camera_frames:
            del camera_frames[camera_id]
        if camera_id in monitoring_threads:
            del monitoring_threads[camera_id]

def save_violation(camera_id, frame, violation_type):
    timestamp = datetime.now()
    filename = f"violation_{camera_id}_{timestamp.strftime('%Y%m%d_%H%M%S')}.jpg"
    filepath = os.path.join(VIOLATIONS_DIR, filename)
    cv2.imwrite(filepath, frame)

@app.route('/api/cameras', methods=['POST'])
def add_camera():
    try:
        data = request.json
        config = load_config()
        
        camera_id = data['id']
        config['cameras'][camera_id] = {
            "ipAddress": data['ipAddress'],
            "port": data['port'],
            "monitoredViolations": data.get('monitoredViolations', []),
            "status": "active"
        }
        
        save_config(config)
        
        # Start monitoring immediately
        thread = threading.Thread(
            target=monitor_camera,
            args=(camera_id, config['cameras'][camera_id]),
            daemon=True
        )
        monitoring_threads[camera_id] = thread
        thread.start()
        
        return jsonify({"status": "success", "message": "Camera added and started"})
    except Exception as e:
        print(f"Error adding camera: {str(e)}")
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/api/cameras/<camera_id>', methods=['DELETE'])
def delete_camera(camera_id):
    try:
        config = load_config()
        
        # Stop monitoring thread
        if camera_id in monitoring_threads:
            del monitoring_threads[camera_id]
        
        # Release camera resources
        if camera_id in active_cameras:
            active_cameras[camera_id].release()
            del active_cameras[camera_id]
        
        # Clear frame buffer
        if camera_id in camera_frames:
            del camera_frames[camera_id]
        
        # Remove from config
        if camera_id in config['cameras']:
            del config['cameras'][camera_id]
            save_config(config)
        
        return jsonify({"status": "success", "message": "Camera deleted"})
    except Exception as e:
        print(f"Error deleting camera: {str(e)}")
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/api/cameras/<camera_id>/status', methods=['GET'])
def get_camera_status(camera_id):
    try:
        # Check if camera is actively streaming
        is_active = (
            camera_id in active_cameras and 
            camera_id in camera_frames and 
            camera_frames[camera_id] is not None
        )
        
        return jsonify({
            "status": "active" if is_active else "inactive",
            "lastChecked": datetime.now().isoformat()
        })
    except Exception as e:
        print(f"Error checking camera status: {str(e)}")
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/api/stream/<camera_id>')
def video_feed(camera_id):
    def generate():
        while camera_id in monitoring_threads:
            if camera_id in camera_frames and camera_frames[camera_id] is not None:
                frame = camera_frames[camera_id]
                ret, buffer = cv2.imencode('.jpg', frame)
                if ret:
                    yield (b'--frame\r\n'
                           b'Content-Type: image/jpeg\r\n\r\n' + buffer.tobytes() + b'\r\n')
            time.sleep(0.033)
    
    return Response(generate(),
                   mimetype='multipart/x-mixed-replace; boundary=frame')

if __name__ == '__main__':
    # Load existing cameras and start monitoring
    config = load_config()
    for camera_id, camera_config in config['cameras'].items():
        thread = threading.Thread(
            target=monitor_camera,
            args=(camera_id, camera_config),
            daemon=True
        )
        monitoring_threads[camera_id] = thread
        thread.start()
    
    app.run(host='0.0.0.0', port=5000, threaded=True)