// Main App component - diary reflection application

import React, { useState, useEffect, useCallback } from 'react';
import type { Diary } from './types/diary';
import type { Theme } from './types/theme';
import diaryService from './services/diaryService';
import themeService from './services/themeService';
import api from './services/api';
import SearchBar from './components/SearchBar';
import DiaryList from './components/DiaryList';
import DiaryForm from './components/DiaryForm';
import DiaryDetail from './components/DiaryDetail';
import ConfirmDialog from './components/ConfirmDialog';
import ThemeNav from './components/ThemeNav';
import ThemePage from './components/ThemePage';
import DataModeToggle from './components/DataModeToggle';
import DiarySidebar from './components/DiarySidebar';
import CreateFolderDialog from './components/CreateFolderDialog';
import './App.css';

type ViewMode = 'form' | 'theme';

function App() {
  // State management
  const [diaries, setDiaries] = useState<Diary[]>([]);
  const [filteredDiaries, setFilteredDiaries] = useState<Diary[]>([]);
  const [themes, setThemes] = useState<Theme[]>([]);
  const [selectedDiary, setSelectedDiary] = useState<Diary | null>(null);
  const [selectedThemeId, setSelectedThemeId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('form');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFormLoading, setIsFormLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirmDiary, setDeleteConfirmDiary] = useState<Diary | null>(null);
  const [isCreateFolderDialogOpen, setIsCreateFolderDialogOpen] = useState(false);
  const [pendingParentId, setPendingParentId] = useState<string>('root');
  const [folders, setFolders] = useState<Array<{id: string, name: string, diaries: Diary[], parentId?: string, level: number}>>([
    {
      id: 'root',
      name: 'All Diaries',
      diaries: [],
      level: 0,
    },
  ]);

  // Fetch all diaries on component mount
  const fetchDiaries = useCallback(async (query?: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const fetchedDiaries = await diaryService.getAllDiaries(query);
      setDiaries(fetchedDiaries);
      setFilteredDiaries(fetchedDiaries);
      
      // Update root folder with all diaries
      setFolders(prevFolders => 
        prevFolders.map(folder => 
          folder.id === 'root' 
            ? { ...folder, diaries: fetchedDiaries }
            : folder
        )
      );
      setFilteredDiaries(fetchedDiaries);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch diaries');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDiaries();
    fetchThemes();
  }, [fetchDiaries]);

  // Fetch themes
  const fetchThemes = async () => {
    try {
      const fetchedThemes = await themeService.getAllThemes();
      setThemes(fetchedThemes);
    } catch (err) {
      console.error('Failed to fetch themes:', err);
    }
  };

  // Handle search
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    fetchDiaries(query);
  }, [fetchDiaries]);

  // Handle create new diary
  const handleCreateNew = (folderId: string) => {
    setSelectedDiary(null);
    setViewMode('form');
  };

  // Handle create folder
  const handleCreateFolder = () => {
    setIsCreateFolderDialogOpen(true);
  };

  // Handle folder creation
  const handleFolderCreated = (folderName: string, parentId: string = 'root') => {
    const parentFolder = folders.find(f => f.id === parentId);
    const newFolder = {
      id: `folder-${Date.now()}`,
      name: folderName,
      diaries: [],
      parentId: parentId,
      level: (parentFolder?.level || 0) + 1,
    };
    
    setFolders(prevFolders => {
      const newFolders = [...prevFolders, newFolder];
      // Sort folders by level, then by name
      return newFolders.sort((a, b) => {
        if (a.level !== b.level) {
          return a.level - b.level;
        }
        return a.name.localeCompare(b.name);
      });
    });
    setIsCreateFolderDialogOpen(false);
  };

  // Handle diary click - show in edit mode
  const handleDiaryClick = (diary: Diary) => {
    setSelectedDiary(diary);
    setViewMode('form');
  };

  // Handle edit diary
  const handleEdit = (diary: Diary) => {
    setSelectedDiary(diary);
    setViewMode('form');
  };

  // Handle delete diary - show confirmation
  const handleDeleteClick = (diary: Diary) => {
    setDeleteConfirmDiary(diary);
  };

  // Confirm delete
  const handleDeleteConfirm = async () => {
    if (!deleteConfirmDiary) return;

    try {
      await diaryService.deleteDiary(deleteConfirmDiary.id);
      await fetchDiaries(searchQuery);
      setDeleteConfirmDiary(null);
      
      // If currently viewing the deleted diary, go back to form
      if (selectedDiary?.id === deleteConfirmDiary.id) {
        setViewMode('form');
        setSelectedDiary(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete diary');
    }
  };

  // Handle form submission
  const handleFormSubmit = async (data: { title?: string; content: string }) => {
    setIsFormLoading(true);
    
    try {
      if (selectedDiary) {
        // Update existing diary
        await diaryService.updateDiary(selectedDiary.id, data);
      } else {
        // Create new diary
        await diaryService.createDiary(data);
      }
      
      await fetchDiaries(searchQuery);
      setViewMode('form');
      setSelectedDiary(null);
    } catch (err) {
      throw err; // Let DiaryForm handle the error display
    } finally {
      setIsFormLoading(false);
    }
  };

  // Handle auto-save
  const handleAutoSave = async (data: { title?: string; content: string }) => {
    try {
      if (selectedDiary) {
        // Update existing diary
        const updatedDiary = await diaryService.updateDiary(selectedDiary.id, data);
        setSelectedDiary(updatedDiary);
      } else {
        // Create new diary
        const newDiary = await diaryService.createDiary(data);
        setSelectedDiary(newDiary);
      }
      
      // Refresh the diary list to show updates
      await fetchDiaries(searchQuery);
    } catch (err) {
      console.error('Auto-save failed:', err);
      throw err;
    }
  };

  // Handle theme selection
  const handleThemeSelect = (themeId: string) => {
    setSelectedThemeId(themeId);
    setViewMode('theme');
  };

  // Handle show all themes
  const handleShowAll = () => {
    setSelectedThemeId(null);
    setViewMode('form');
  };

  // Handle view diary from theme page
  const handleViewDiaryFromTheme = async (diaryId: string) => {
    try {
      const diary = await diaryService.getDiaryById(diaryId);
      setSelectedDiary(diary);
      setViewMode('form');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load diary');
    }
  };

  // Handle close theme page
  const handleCloseTheme = () => {
    setSelectedThemeId(null);
    setViewMode('form');
  };

  return (
    <div className="app">
      {/* Header */}
      <header className="app__header">
        <div className="app__container">
          <div className="app__brand">
            <h1 className="app__title">Diary Reflection</h1>
            <p className="app__subtitle">Your personal space for thoughts and memories</p>
          </div>
          
          <div className="app__header-actions">
            <DataModeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="app__main">
        <div className="app__layout">
          {/* Left Sidebar - Folder-based Diary List */}
        <DiarySidebar
          diaries={filteredDiaries}
          folders={folders}
          selectedDiaryId={selectedDiary?.id}
          onDiarySelect={handleDiaryClick}
          onCreateNew={handleCreateNew}
          onCreateFolder={(parentId) => {
            // Store the parent ID for folder creation
            setPendingParentId(parentId || 'root');
            handleCreateFolder();
          }}
          onDeleteDiary={handleDeleteClick}
          isLoading={isLoading}
          searchQuery={searchQuery}
        />

          {/* Right Content Area */}
          <div className="app__content">
            {error && (
              <div className="app__error" role="alert">
                <p>{error}</p>
                <button onClick={() => setError(null)}>Dismiss</button>
              </div>
            )}

            {/* Form View (Default) */}
            {viewMode === 'form' && (
              <DiaryForm
                diary={selectedDiary}
                onAutoSave={handleAutoSave}
                isLoading={isFormLoading}
              />
            )}

            {/* Theme View */}
            {viewMode === 'theme' && selectedThemeId && (
              <ThemePage
                themeId={selectedThemeId}
                onViewDiary={handleViewDiaryFromTheme}
                onClose={handleCloseTheme}
              />
            )}
          </div>
        </div>
      </main>


      {/* Create Folder Dialog */}
        <CreateFolderDialog
          isOpen={isCreateFolderDialogOpen}
          onClose={() => {
            setIsCreateFolderDialogOpen(false);
            setPendingParentId('root');
          }}
          onCreateFolder={(folderName) => handleFolderCreated(folderName, pendingParentId)}
        />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirmDiary !== null}
        title="Delete Diary"
        message="Are you sure you want to delete this diary? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteConfirmDiary(null)}
        isDestructive={true}
      />
    </div>
  );
}

export default App;
