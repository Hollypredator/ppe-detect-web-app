import React, { useState, useEffect } from 'react';
import { useStore } from '../store';
import type { Camera } from '../types';

interface CameraFormProps {
  onClose: () => void;
  editId?: string | null;
  selectedFacilityId?: string | null;
}

export const CameraForm: React.FC<CameraFormProps> = ({
  onClose,
  editId,
  selectedFacilityId,
}) => {
  const { cameras, facilities, addCamera, updateCamera } = useStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    facilityId: selectedFacilityId || '',
    ipAddress: '',
    port: '',
    monitoredViolations: [] as string[],
  });

  useEffect(() => {
    if (editId) {
      const camera = cameras.find((c) => c.id === editId);
      if (camera) {
        setFormData({
          name: camera.name,
          facilityId: camera.facilityId,
          ipAddress: camera.ipAddress,
          port: camera.port.toString(),
          monitoredViolations: camera.monitoredViolations || [],
        });
      }
    }
  }, [editId, cameras]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const cameraData: Camera = {
        id: editId || crypto.randomUUID(),
        facilityId: formData.facilityId,
        name: formData.name,
        ipAddress: formData.ipAddress,
        port: parseInt(formData.port, 10),
        status: 'active',
        monitoredViolations: formData.monitoredViolations,
      };

      if (editId) {
        await updateCamera(editId, cameraData);
      } else {
        await addCamera(cameraData);
      }
      
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save camera');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleViolationType = (type: string) => {
    setFormData(prev => ({
      ...prev,
      monitoredViolations: prev.monitoredViolations.includes(type)
        ? prev.monitoredViolations.filter(t => t !== type)
        : [...prev.monitoredViolations, type],
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Facility
        </label>
        <select
          value={formData.facilityId}
          onChange={(e) => setFormData({ ...formData, facilityId: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          required
        >
          <option value="">Select Facility...</option>
          {facilities.map((facility) => (
            <option key={facility.id} value={facility.id}>
              {facility.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Camera Name
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700">
          IP Address
        </label>
        <input
          type="text"
          value={formData.ipAddress}
          onChange={(e) => setFormData({ ...formData, ipAddress: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          required
          pattern="^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$"
          placeholder="192.168.1.1"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Port
        </label>
        <input
          type="text"
          value={formData.port}
          onChange={(e) => setFormData({ ...formData, port: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          required
          pattern="^[0-9]{1,5}$"
          placeholder="8080"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Monitored Violations
        </label>
        <div className="space-y-2">
          {[
            { type: 'no_helmet', label: 'No Helmet' },
            { type: 'no_vest', label: 'No Vest' },
            { type: 'no_gloves', label: 'No Gloves' },
          ].map(({ type, label }) => (
            <label key={type} className="flex items-center">
              <input
                type="checkbox"
                checked={formData.monitoredViolations.includes(type)}
                onChange={() => toggleViolationType(type)}
                className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              />
              <span className="ml-2 text-sm text-gray-700">{label}</span>
            </label>
          ))}
        </div>
      </div>
      
      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : editId ? 'Update' : 'Add'}
        </button>
      </div>
    </form>
  );
};