import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';

export const Violations: React.FC = () => {
  const [violations, setViolations] = React.useState<any[]>([]);

  React.useEffect(() => {
    // Fetch violations from the API
    fetch('http://localhost:5000/api/violations')
      .catch(error => console.error('İhlaller yüklenirken hata oluştu:', error));
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">İhlal Kayıtları</h1>
      </div>

      {violations.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <p className="text-gray-600">Henüz kayıtlı ihlal bulunmamaktadır.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {violations.map((violation) => (
            <div key={violation.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <img
                src={violation.imageUrl}
                alt="İhlal Görüntüsü"
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-red-600">
                    {violation.type === 'no_helmet' && 'Kask Eksikliği'}
                    {violation.type === 'no_vest' && 'Yelek Eksikliği'}
                    {violation.type === 'no_gloves' && 'Eldiven Eksikliği'}
                  </span>
                  <span className="text-sm text-gray-500">
                    {format(new Date(violation.timestamp), 'dd.MM.yyyy HH:mm')}
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  Kamera: {violation.cameraId}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};