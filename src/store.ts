import { create } from 'zustand';
import type { Camera, Facility } from './types';

interface State {
  cameras: Camera[];
  facilities: Facility[];
  addCamera: (camera: Camera) => void;
  updateCamera: (id: string, camera: Camera) => void;
  deleteCamera: (id: string) => void;
  addFacility: (facility: Facility) => void;
  updateFacility: (id: string, facility: Facility) => void;
  deleteFacility: (id: string) => void;
}

export const useStore = create<State>((set) => ({
  cameras: [],
  facilities: [],
  
  addCamera: (camera) =>
    set((state) => ({
      cameras: [...state.cameras, camera],
    })),
    
  updateCamera: (id, camera) =>
    set((state) => ({
      cameras: state.cameras.map((c) => (c.id === id ? camera : c)),
    })),
    
  deleteCamera: (id) =>
    set((state) => ({
      cameras: state.cameras.filter((c) => c.id !== id),
    })),
    
  addFacility: (facility) =>
    set((state) => ({
      facilities: [...state.facilities, facility],
    })),
    
  updateFacility: (id, facility) =>
    set((state) => ({
      facilities: state.facilities.map((f) => (f.id === id ? facility : f)),
    })),
    
  deleteFacility: (id) =>
    set((state) => ({
      facilities: state.facilities.filter((f) => f.id !== id),
      cameras: state.cameras.filter((c) => c.facilityId !== id),
    })),
}));