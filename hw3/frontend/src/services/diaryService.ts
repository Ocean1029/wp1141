// Service layer for diary-related operations
// This is a factory that returns the appropriate service implementation
// based on the current data mode (localStorage or API)

import { appConfig } from '../config/app.config';
import { localStorageDiaryService, seedLocalStorageData } from './diaryService.localStorage';
import { apiDiaryService } from './diaryService.api';
import type { Diary, DiaryFormData } from '../types/diary';

/**
 * DiaryService interface that both implementations must follow
 */
export interface DiaryServiceInterface {
  getAllDiaries: (searchQuery?: string) => Promise<Diary[]>;
  getDiaryById: (id: string) => Promise<Diary>;
  createDiary: (data: DiaryFormData) => Promise<Diary>;
  updateDiary: (id: string, data: DiaryFormData) => Promise<Diary>;
  deleteDiary: (id: string) => Promise<void>;
}

/**
 * Get the appropriate diary service based on current data mode
 */
function getDiaryServiceImplementation(): DiaryServiceInterface {
  if (appConfig.dataMode === 'localStorage') {
    // Seed data on first use in localStorage mode
    if (typeof window !== 'undefined') {
      const shouldSeed = !localStorage.getItem('sisyphean_diaries');
      if (shouldSeed) {
        seedLocalStorageData();
      }
    }
    return localStorageDiaryService;
  }
  
  return apiDiaryService;
}

/**
 * Main diary service - automatically uses the correct implementation
 */
export const diaryService: DiaryServiceInterface = getDiaryServiceImplementation();

export default diaryService;

