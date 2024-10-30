export interface Camera {
  id: string;
  name: string;
  ipAddress: string;
  port: number;
  status: 'active' | 'inactive';
  facilityId: string;
  lastChecked?: string;
  detectionClasses?: string[];
}

export interface CameraStatus {
  status: 'active' | 'inactive';
  lastChecked: string;
  error?: string;
}

export interface Facility {
  id: string;
  name: string;
  location: string;
  cameras?: Camera[];
}

export interface DetectionEvent {
  id: string;
  cameraId: string;
  facilityId: string;
  timestamp: string;
  type: string;
  imageUrl: string;
  confidence: number;
}