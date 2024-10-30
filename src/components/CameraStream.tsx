import React, { useState, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';
import type { Camera } from '../types';

interface CameraStreamProps {
  camera: Camera;
  onClose: () => void;
}

export const CameraStream: React.FC<CameraStreamProps> = ({ camera, onClose }) => {
  const [error, setError] = useState<string>('');
  const streamUrl = `http://localhost:5000/api/stream/${camera.id}`;

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/cameras/${camera.id}/status`);
        const data = await response.json();
        
        if (data.status !== 'active') {
          setError('Kamera aktif değil');
        } else {
          setError('');
        }
      } catch (err) {
        setError('Kamera durumu kontrol edilemedi');
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 5000);
    return () => clearInterval(interval);
  }, [camera.id]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl relative">
        <div className="absolute top-4 right-4 z-10">
          <button
            onClick={onClose}
            className="bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors"
          >
            <X size={24} className="text-gray-600" />
          </button>
        </div>
        
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold">{camera.name} - Canlı Görüntü</h3>
          <p className="text-sm text-gray-500">
            IP: {camera.ipAddress}:{camera.port}
          </p>
        </div>
        
        <div className="p-4">
          <div className="aspect-video bg-black rounded-lg overflow-hidden relative">
            {error ? (
              <div className="absolute inset-0 flex items-center justify-center text-white space-x-2">
                <AlertCircle size={24} />
                <span>{error}</span>
              </div>
            ) : (
              <img
                src={streamUrl}
                alt="Kamera Görüntüsü"
                className="w-full h-full object-contain"
                onError={() => setError('Kamera görüntüsü alınamıyor')}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};