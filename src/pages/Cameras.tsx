import React, { useState } from 'react';
import { Camera as CameraIcon, Plus, Building2 } from 'lucide-react';
import { useStore } from '../store';
import { CameraForm } from '../components/CameraForm';
import { CameraStream } from '../components/CameraStream';
import { Modal } from '../components/Modal';
import { CameraCard } from '../components/CameraCard';
import type { ApiError } from '../api/camera';

export const Cameras: React.FC = () => {
  const { cameras, facilities, deleteCamera } = useStore();
  const [showCameraForm, setShowCameraForm] = useState(false);
  const [selectedFacility, setSelectedFacility] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [streamingCamera, setStreamingCamera] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    try {
      setError(null);
      await deleteCamera(id);
    } catch (err) {
      const message = err instanceof ApiError 
        ? err.message 
        : 'An unexpected error occurred while deleting the camera';
      setError(message);
      throw err; // Re-throw to be handled by the CameraCard component
    }
  };

  const camerasByFacility = facilities.map(facility => ({
    facility,
    cameras: cameras.filter(camera => camera.facilityId === facility.id),
  }));

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Cameras</h1>
        <div className="flex gap-4">
          <select
            className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            value={selectedFacility || ''}
            onChange={(e) => {
              const value = e.target.value;
              setSelectedFacility(value || null);
              setShowCameraForm(true);
            }}
          >
            <option value="">Select Facility...</option>
            {facilities.map((facility) => (
              <option key={facility.id} value={facility.id}>
                {facility.name}
              </option>
            ))}
          </select>
          <button
            onClick={() => setShowCameraForm(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            disabled={facilities.length === 0}
          >
            <Plus size={20} />
            <span>Add New Camera</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
          {error}
        </div>
      )}

      {facilities.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">
            Please add a facility first before adding cameras.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {camerasByFacility.map(({ facility, cameras }) => (
            <div key={facility.id} className="space-y-4">
              <div className="flex items-center space-x-3">
                <Building2 className="w-6 h-6 text-gray-600" />
                <h2 className="text-xl font-semibold text-gray-900">
                  {facility.name}
                </h2>
              </div>

              {cameras.length === 0 ? (
                <p className="text-gray-500 italic pl-9">
                  No cameras added to this facility yet
                </p>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 pl-9">
                  {cameras.map((camera) => (
                    <CameraCard
                      key={camera.id}
                      camera={camera}
                      onEdit={() => {
                        setEditId(camera.id);
                        setShowCameraForm(true);
                      }}
                      onStream={() => setStreamingCamera(camera.id)}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showCameraForm && (
        <Modal
          title={editId ? 'Edit Camera' : 'Add New Camera'}
          onClose={() => {
            setShowCameraForm(false);
            setEditId(null);
            setSelectedFacility(null);
          }}
        >
          <CameraForm
            onClose={() => {
              setShowCameraForm(false);
              setEditId(null);
              setSelectedFacility(null);
            }}
            editId={editId}
            selectedFacilityId={selectedFacility}
          />
        </Modal>
      )}

      {streamingCamera && (
        <CameraStream
          camera={cameras.find(c => c.id === streamingCamera)!}
          onClose={() => setStreamingCamera(null)}
        />
      )}
    </div>
  );
};