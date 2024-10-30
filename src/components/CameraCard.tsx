import React, { useState } from 'react';
import { Camera as CameraIcon, Eye, Trash2, Settings } from 'lucide-react';
import type { Camera } from '../types';
import { ApiError } from '../api/camera';

interface CameraCardProps {
  camera: Camera;
  onEdit: () => void;
  onStream: () => void;
  onDelete: (id: string) => Promise<void>;
}

export const CameraCard: React.FC<CameraCardProps> = ({
  camera,
  onEdit,
  onStream,
  onDelete,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this camera?')) {
      return;
    }

    try {
      setIsDeleting(true);
      setError(null);
      await onDelete(camera.id);
    } catch (err) {
      const message = err instanceof ApiError 
        ? err.message 
        : 'An unexpected error occurred while deleting the camera';
      setError(message);
      console.error('Camera deletion error:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <CameraIcon className={`w-6 h-6 ${camera.status === 'active' ? 'text-green-600' : 'text-gray-400'}`} />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{camera.name}</h3>
            <p className="text-sm text-gray-500">
              {camera.ipAddress}:{camera.port}
            </p>
            <span className={`text-xs font-medium ${
              camera.status === 'active' ? 'text-green-600' : 'text-red-600'
            }`}>
              {camera.status === 'active' ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={onStream}
            disabled={camera.status !== 'active'}
            className="flex items-center space-x-1 px-3 py-1 rounded-md text-sm font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Eye size={16} />
            <span>Watch</span>
          </button>
          
          <button
            onClick={onEdit}
            className="flex items-center space-x-1 px-3 py-1 rounded-md text-sm font-medium bg-gray-100 text-gray-800 hover:bg-gray-200"
          >
            <Settings size={16} />
            <span>Edit</span>
          </button>
          
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex items-center space-x-1 px-3 py-1 rounded-md text-sm font-medium bg-red-100 text-red-800 hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Trash2 size={16} />
            <span>{isDeleting ? 'Deleting...' : 'Delete'}</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="mt-2 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="mt-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Monitored Violations:</h4>
        <div className="flex flex-wrap gap-2">
          {camera.monitoredViolations?.map((violation) => (
            <span
              key={violation}
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
            >
              {violation === 'no_helmet' && 'No Helmet'}
              {violation === 'no_vest' && 'No Vest'}
              {violation === 'no_gloves' && 'No Gloves'}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};