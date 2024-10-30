import type { Camera } from '../types';

const API_BASE_URL = 'http://localhost:5000/api';

export class ApiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
    this.name = 'ApiError';
  }
}

export const cameraApi = {
  async addCamera(camera: Camera): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/cameras`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...camera,
        status: 'active' // Set initial status as active
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new ApiError(error.message || 'Failed to add camera', response.status);
    }
  },

  async deleteCamera(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/cameras/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to delete camera' }));
      throw new ApiError(error.message || 'Failed to delete camera', response.status);
    }
  },

  async updateCamera(id: string, data: Partial<Camera>): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/cameras/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new ApiError(error.message || 'Failed to update camera', response.status);
    }
  },

  async checkStatus(id: string): Promise<{ status: 'active' | 'inactive'; lastChecked: string }> {
    const response = await fetch(`${API_BASE_URL}/cameras/${id}/status`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new ApiError(error.message || 'Failed to check camera status', response.status);
    }
    
    return response.json();
  },

  getStreamUrl(id: string): string {
    return `${API_BASE_URL}/stream/${id}`;
  }
};