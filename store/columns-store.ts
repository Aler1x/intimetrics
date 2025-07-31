import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { ActivityType } from '~/types';
import { ACTIVITY_TYPES } from '~/lib/constants';
import AsyncStorage from 'expo-sqlite/kv-store';

interface ColumnsState {
  visibleColumns: ActivityType[];
  toggleColumn: (column: ActivityType) => void;
  isColumnVisible: (column: ActivityType) => boolean;
  getVisibleColumns: () => ActivityType[];
}

export const useColumnsStore = create<ColumnsState>()(
  persist(
    (set, get) => ({
      visibleColumns: [...ACTIVITY_TYPES],
      
      toggleColumn: (column: ActivityType) =>
        set((state) => {
          const currentColumns = Array.isArray(state.visibleColumns) 
            ? state.visibleColumns 
            : [...ACTIVITY_TYPES];
          
          const isVisible = currentColumns.includes(column);
          return {
            visibleColumns: isVisible
              ? currentColumns.filter(col => col !== column)
              : [...currentColumns, column]
          };
        }),

      isColumnVisible: (column: ActivityType) => {
        const columns = get().visibleColumns;
        if (!Array.isArray(columns)) {
          return true;
        }
        return columns.includes(column);
      },

      getVisibleColumns: () => {
        const columns = get().visibleColumns;
        return Array.isArray(columns) ? columns : [...ACTIVITY_TYPES];
      },
    }),
    {
      name: 'columns-storage',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        if (state && !Array.isArray(state.visibleColumns)) {
          state.visibleColumns = [...ACTIVITY_TYPES];
        }
      },
    }
  )
);