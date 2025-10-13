// Main App component - diary reflection application

import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, useParams, useNavigate } from 'react-router-dom';
import type { Diary } from './types/diary';
import diaryService from './services/diaryService';
import DiaryForm from './components/DiaryForm';
import ConfirmDialog from './components/ConfirmDialog';
import DataModeToggle from './components/DataModeToggle';
import DiarySidebar from './components/DiarySidebar';
import CreateFolderDialog from './components/CreateFolderDialog';
import './App.css';

// Main layout component
function DiaryApp() {
  const navigate = useNavigate();
  const { diaryId } = useParams<{ diaryId: string }>();
  
  // State management
  const [filteredDiaries, setFilteredDiaries] = useState<Diary[]>([]);
  const [selectedDiary, setSelectedDiary] = useState<Diary | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
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
  }, [fetchDiaries]);

  // Load diary from URL parameter
  useEffect(() => {
    const loadDiaryFromUrl = async () => {
      if (diaryId && diaryId !== 'new') {
        try {
          const diary = await diaryService.getDiaryById(diaryId);
          setSelectedDiary(diary);
        } catch (err) {
          console.error('Failed to load diary from URL:', err);
          setSelectedDiary(null);
          navigate('/');
        }
      } else if (diaryId === 'new') {
        setSelectedDiary(null);
      }
    };

    loadDiaryFromUrl();
  }, [diaryId, navigate]);

  // Handle create new diary
  const handleCreateNew = (folderId: string) => {
    setSelectedDiary(null);
    navigate('/diary/new');
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

  // Handle diary click - navigate to diary page
  const handleDiaryClick = (diary: Diary) => {
    navigate(`/diary/${diary.id}`);
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
      
      // If currently viewing the deleted diary, navigate to home
      if (selectedDiary?.id === deleteConfirmDiary.id) {
        setSelectedDiary(null);
        navigate('/');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete diary');
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
          onSearchChange={setSearchQuery}
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

            {/* Diary Editor */}
            <DiaryForm
              diary={selectedDiary}
              onAutoSave={handleAutoSave}
              isLoading={isLoading}
            />

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

// Main App component with routing
function App() {
  return (
    <Routes>
      <Route path="/" element={<DiaryApp />} />
      <Route path="/diary/:diaryId" element={<DiaryApp />} />
    </Routes>
  );
}

export default App;
