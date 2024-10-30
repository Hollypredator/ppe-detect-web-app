import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Camera, Facility } from '../types';
import { cameraApi } from '../api/camera';

interface State {
  cameras: Camera[];
  facilities: Facility[];
  addCamera: (camera: Camera) => Promise<void>;
  updateCamera: (id: string, camera: Partial<Camera>) => Promise<void>;
  deleteCamera: (id: string) => Promise<void>;
  addFacility: (facility: Facility) => void;
  updateFacility: (id: string, facility: Partial<Facility>) => void;
  deleteFacility: (id: string) => void;
}

export const useStore = create<State>()(
  persist(
    (set) => ({
      cameras: [],
      facilities: [],
      
      addCamera: async (camera) => {
        try {
          await cameraApi.addCamera(camera);
          set((state) => ({
            cameras: [...state.cameras, camera],
          }));
        } catch (error) {
          throw error;
        }
      },
      
      updateCamera: async (id, updatedCamera) => {
        try {
          await cameraApi.updateCamera(id, updatedCamera);
          set((state) => ({
            cameras: state.cameras.map((camera) =>
              camera.id === id ? { ...camera, ...updatedCamera } : camera
            ),
          }));
        } catch (error) {
          throw error;
        }
      },
      
      deleteCamera: async (id) => {
        try {
          await cameraApi.deleteCamera(id);
          set((state) => ({
            cameras: state.cameras.filter((camera) => camera.id !== id),
          }));
        } catch (error) {
          throw error;
        }
      },
      
      addFacility: (facility) =>
        set((state) => ({
          facilities: [...state.facilities, facility],
        })),
      
      updateFacility: (id, updatedFacility) =>
        set((state) => ({
          facilities: state.facilities.map((facility) =>
            facility.id === id ? { ...facility, ...updatedFacility } : facility
          ),
        })),
      
      deleteFacility: (id) =>
        set((state) => ({
          facilities: state.facilities.filter((facility) => facility.id !== id),
          cameras: state.cameras.filter((camera) => camera.facilityId !== id),
        })),
    }),
    {
      name: 'camera-store',
    }
  )
);