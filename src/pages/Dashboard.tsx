import React from 'react';
import { Building2, Camera, AlertTriangle } from 'lucide-react';
import { useStore } from '../store';

export const Dashboard: React.FC = () => {
  const { facilities, cameras } = useStore();

  const activeCount = cameras.filter(c => c.status === 'active').length;
  const inactiveCount = cameras.filter(c => c.status === 'inactive').length;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Sistem Durumu</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center space-x-3">
            <Building2 className="w-8 h-8 text-blue-600" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Tesisler</h2>
              <p className="text-3xl font-bold text-gray-900">{facilities.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center space-x-3">
            <Camera className="w-8 h-8 text-green-600" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Aktif Kameralar</h2>
              <p className="text-3xl font-bold text-gray-900">{activeCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-8 h-8 text-red-600" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Pasif Kameralar</h2>
              <p className="text-3xl font-bold text-gray-900">{inactiveCount}</p>
            </div>
          </div>
        </div>
      </div>

      {facilities.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Hoş Geldiniz!</h2>
          <p className="text-gray-600">
            Sistemi kullanmaya başlamak için sol menüden "Tesisler" bölümüne giderek ilk
            tesisinizi ekleyebilirsiniz.
          </p>
        </div>
      ) : null}
    </div>
  );
};