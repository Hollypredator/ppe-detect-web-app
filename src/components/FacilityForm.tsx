import React, { useState, useEffect } from 'react';
import { useStore } from '../store';
import type { Facility } from '../types';

interface FacilityFormProps {
  onClose: () => void;
  editId?: string;
}

export const FacilityForm: React.FC<FacilityFormProps> = ({ onClose, editId }) => {
  const { facilities, addFacility, updateFacility } = useStore();
  const [formData, setFormData] = useState({
    name: '',
    address: '',
  });

  useEffect(() => {
    if (editId) {
      const facility = facilities.find((f) => f.id === editId);
      if (facility) {
        setFormData({
          name: facility.name,
          address: facility.address,
        });
      }
    }
  }, [editId, facilities]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const facilityData: Facility = {
      id: editId || crypto.randomUUID(),
      name: formData.name,
      address: formData.address,
      createdAt: editId ? (facilities.find(f => f.id === editId)?.createdAt || new Date()) : new Date(),
    };

    if (editId) {
      updateFacility(editId, facilityData);
    } else {
      addFacility(facilityData);
    }
    
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Tesis Adı
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
          Adres
        </label>
        <textarea
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          rows={3}
          required
        />
      </div>
      
      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          İptal
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
        >
          {editId ? 'Güncelle' : 'Ekle'}
        </button>
      </div>
    </form>
  );
};