import { create } from 'zustand';
import { YEAR_MIN, YEAR_MAX } from '@/lib/data';

export type ViewMode = 'map' | 'trend' | 'table';

interface IndicatorState {
  selectedRegion: string;
  selectedDataType: 'average' | 'total';
  selectedDemographics: string[];
  yearRange: [number, number];
  activeView: ViewMode;
  setRegion: (region: string) => void;
  setDataType: (type: 'average' | 'total') => void;
  toggleDemographic: (demo: string) => void;
  setYearRange: (range: [number, number]) => void;
  setActiveView: (view: ViewMode) => void;
}

export const useIndicatorStore = create<IndicatorState>((set) => ({
  selectedRegion: 'Global',
  selectedDataType: 'average',
  selectedDemographics: ['infants', '65plus'],
  yearRange: [YEAR_MIN, YEAR_MAX],
  activeView: 'trend',

  setRegion: (region) => set({ selectedRegion: region }),
  setDataType: (type) => set({ selectedDataType: type }),

  toggleDemographic: (demo) =>
    set((state) => ({
      selectedDemographics: state.selectedDemographics.includes(demo)
        ? state.selectedDemographics.length > 1
          ? state.selectedDemographics.filter((d) => d !== demo)
          : state.selectedDemographics
        : [...state.selectedDemographics, demo],
    })),

  setYearRange: (range) => set({ yearRange: range }),
  setActiveView: (view) => set({ activeView: view }),
}));
