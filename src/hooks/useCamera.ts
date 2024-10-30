import { useState, useEffect, useCallback } from 'react';
import { Camera, CameraStatus } from '../types';
import { cameraApi } from '../api/camera';

interface UseCameraResult {
  status: CameraStatus | null;
  error: string | null;
  isLoading: boolean;
  checkStatus: () => Promise<void>;
}

export function useCamera(camera: Camera): UseCameraResult {
  const [status, setStatus] = useState<CameraStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const checkStatus = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const newStatus = await cameraApi.checkStatus(camera.id);
      setStatus(newStatus);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kamera durumu kontrol edilemedi');
      setStatus(null);
    } finally {
      setIsLoading(false);
    }
  }, [camera.id]);

  useEffect(() => {
    checkStatus();
    
    const interval = setInterval(checkStatus, 30000); // Check every 30 seconds
    
    return () => clearInterval(interval);
  }, [checkStatus]);

  return { status, error, isLoading, checkStatus };
}