import React, { useState } from 'react';
import { Building2, Plus } from 'lucide-react';
import { useStore } from '../store';
import { FacilityForm } from '../components/FacilityForm';
import { format } from 'date-fns';

export const Facilities: React.FC = () => {
  const { facilities } = useStore();
  const [showFacilityForm, setShowFacilityForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Tesisler</h1>
        <button
          onClick={() => setShowFacilityForm(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          <span>Yeni Tesis Ekle</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {facilities.map((facility) => (
          <div
            key={facility.id}
            className="bg-white rounded-lg shadow-md p-6 space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Building2 className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-900">
                  {facility.name}
                </h2>
              </div>
              <button
                onClick={() => {
                  setEditId(facility.id);
                  setShowFacilityForm(true);
                }}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Düzenle
              </button>
            </div>
            <p className="text-gray-600">{facility.address}</p>
            <p className="text-sm text-gray-500">
              Eklenme Tarihi: {format(new Date(facility.createdAt), 'dd.MM.yyyy')}
            </p>
          </div>
        ))}
      </div>

      {showFacilityForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">
              {editId ? 'Tesis Düzenle' : 'Yeni Tesis Ekle'}
            </h2>
            <FacilityForm
              onClose={() => {
                setShowFacilityForm(false);
                setEditId(null);
              }}
              editId={editId}
            />
          </div>
        </div>
      )}
    </div>
  );
};