// LocalStorage implementation of diary service
// Stores diary data in browser's localStorage

import type { Diary, DiaryFormData } from '../types/diary';

const STORAGE_KEY = 'sisyphean_diaries';

/**
 * Get all diaries from localStorage
 */
function getAllFromStorage(): Diary[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    return JSON.parse(data);
  } catch (error) {
    console.error('Failed to read from localStorage:', error);
    return [];
  }
}

/**
 * Save diaries to localStorage
 */
function saveToStorage(diaries: Diary[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(diaries));
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
    throw new Error('Failed to save data');
  }
}

/**
 * Generate a unique ID for new diary entries
 */
function generateId(): string {
  return `diary_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Filter diaries by search query
 */
function filterDiaries(diaries: Diary[], searchQuery?: string): Diary[] {
  if (!searchQuery || !searchQuery.trim()) {
    return diaries;
  }

  const query = searchQuery.toLowerCase();
  return diaries.filter(
    (diary) =>
      diary.title?.toLowerCase().includes(query) ||
      diary.content.toLowerCase().includes(query)
  );
}

/**
 * LocalStorage-based diary service
 */
export const localStorageDiaryService = {
  /**
   * Fetch all diaries, optionally filtered by search query
   */
  getAllDiaries: async (searchQuery?: string): Promise<Diary[]> => {
    // Simulate async behavior
    await new Promise((resolve) => setTimeout(resolve, 100));

    const allDiaries = getAllFromStorage();
    const filteredDiaries = filterDiaries(allDiaries, searchQuery);

    // Sort by created_at descending (newest first)
    return filteredDiaries.sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  },

  /**
   * Fetch a single diary by ID
   */
  getDiaryById: async (id: string): Promise<Diary> => {
    // Simulate async behavior
    await new Promise((resolve) => setTimeout(resolve, 50));

    const diaries = getAllFromStorage();
    const diary = diaries.find((d) => d.id === id);

    if (!diary) {
      throw new Error('Diary not found');
    }

    return diary;
  },

  /**
   * Create a new diary entry
   */
  createDiary: async (data: DiaryFormData): Promise<Diary> => {
    // Simulate async behavior
    await new Promise((resolve) => setTimeout(resolve, 100));

    const now = new Date().toISOString();
    const newDiary: Diary = {
      id: generateId(),
      title: data.title || null,
      content: data.content,
      created_at: now,
      updated_at: now,
    };

    const diaries = getAllFromStorage();
    diaries.push(newDiary);
    saveToStorage(diaries);

    return newDiary;
  },

  /**
   * Update an existing diary entry
   */
  updateDiary: async (id: string, data: DiaryFormData): Promise<Diary> => {
    // Simulate async behavior
    await new Promise((resolve) => setTimeout(resolve, 100));

    const diaries = getAllFromStorage();
    const index = diaries.findIndex((d) => d.id === id);

    if (index === -1) {
      throw new Error('Diary not found');
    }

    const updatedDiary: Diary = {
      ...diaries[index],
      title: data.title !== undefined ? data.title : diaries[index].title,
      content: data.content,
      updated_at: new Date().toISOString(),
    };

    diaries[index] = updatedDiary;
    saveToStorage(diaries);

    return updatedDiary;
  },

  /**
   * Delete a diary entry
   */
  deleteDiary: async (id: string): Promise<void> => {
    // Simulate async behavior
    await new Promise((resolve) => setTimeout(resolve, 100));

    const diaries = getAllFromStorage();
    const filteredDiaries = diaries.filter((d) => d.id !== id);

    if (filteredDiaries.length === diaries.length) {
      throw new Error('Diary not found');
    }

    saveToStorage(filteredDiaries);
  },
};

/**
 * Seed some initial data for testing (optional)
 */
export function seedLocalStorageData(): void {
  const existingData = getAllFromStorage();
  if (existingData.length > 0) {
    console.log('LocalStorage already has data, skipping seed');
    return;
  }

  const now = new Date();
  const sampleDiaries: Diary[] = [
    {
      id: generateId(),
      title: '關於拖延的一天',
      content:
        '今天又沒有開始寫作業。我知道自己應該早點動手，但總覺得無法集中注意力。也許我太在意結果，反而忽略了過程。明天一定要開始行動。',
      created_at: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: generateId(),
      title: '意外的平靜',
      content:
        '昨晚散步時突然覺得心情很平靜。看著路燈下的影子，想起小時候的自己。那時候對未來充滿期待，現在雖然有些迷茫，但也在慢慢找到方向。',
      created_at: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: generateId(),
      title: null,
      content:
        '今天的咖啡特別好喝。坐在窗邊看著外面的雨，突然有種想寫點什麼的衝動。生活就是這樣，在平凡中找到小確幸。',
      created_at: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];

  saveToStorage(sampleDiaries);
  console.log('LocalStorage seeded with sample data');
}

