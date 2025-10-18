// Main App component - diary reflection application

import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, useParams, useNavigate } from 'react-router-dom';
import type { Diary } from './types/diary';
import type { Theme, ThemeSegment } from './types/theme';
import diaryService from './services/diaryService';
import DiaryForm from './components/DiaryForm';
import ThemePage from './components/ThemePage';
import ThemeList from './components/ThemeList';
import ThemeSidebar from './components/ThemeSidebar';
import Navigation from './components/Navigation';
import ConfirmDialog from './components/ConfirmDialog';
import DataModeToggle from './components/DataModeToggle';
import DiarySidebar from './components/DiarySidebar';
import CreateFolderDialog from './components/CreateFolderDialog';
import { mockThemes, mockSegments } from './data/mockData';
import './App.css';

// Theme list page component
function ThemeListApp() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredThemes, setFilteredThemes] = useState<Theme[]>(mockThemes);
  
  // Filter themes based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredThemes(mockThemes);
    } else {
      const filtered = mockThemes.filter(theme =>
        theme.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (theme.description && theme.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setFilteredThemes(filtered);
    }
  }, [searchQuery]);
  
  const handleThemeClick = (theme: Theme) => {
    navigate(`/theme/${theme.id}`);
  };

  const handleEditTheme = (theme: Theme) => {
    console.log('Edit theme:', theme);
    // TODO: Implement theme editing
  };

  const handleDeleteTheme = (theme: Theme) => {
    console.log('Delete theme:', theme);
    // TODO: Implement theme deletion
  };

  const handleCreateTheme = () => {
    console.log('Create new theme');
    // TODO: Implement theme creation
  };

  return (
    <div className="app">
      {/* Header */}
      <header className="app__header">
        <div className="app__container">
          <div className="app__brand">
            <h1 className="app__title">Diary Reflection</h1>
            <p className="app__subtitle">Organize your thoughts by themes</p>
          </div>
          
          <div className="app__header-actions">
            <Navigation />
            <DataModeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="app__main">
        <div className="app__layout">
          {/* Left Sidebar - Theme List */}
          <ThemeSidebar
            themes={mockThemes}
            selectedThemeId={null}
            onThemeSelect={handleThemeClick}
            onCreateTheme={handleCreateTheme}
            onSearchChange={setSearchQuery}
            isLoading={false}
            searchQuery={searchQuery}
          />

          {/* Right Content Area */}
          <div className="app__content">
            <ThemeList
              themes={filteredThemes}
              onEditTheme={handleEditTheme}
              onDeleteTheme={handleDeleteTheme}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

// Theme page component
function ThemeApp() {
  const navigate = useNavigate();
  const { themeId } = useParams<{ themeId: string }>();
  
  const [theme, setTheme] = useState<Theme | null>(null);
  const [segments, setSegments] = useState<ThemeSegment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const loadThemeData = () => {
      setIsLoading(true);
      
      // Find theme from mock data
      const foundTheme = mockThemes.find(t => t.id === themeId);
      if (foundTheme) {
        setTheme(foundTheme);
        
        // Find segments for this theme
        const themeSegments = mockSegments.filter(s => s.theme_id === themeId);
        setSegments(themeSegments);
      } else {
        // Theme not found, redirect to home
        navigate('/');
      }
      
      setIsLoading(false);
    };

    loadThemeData();
  }, [themeId, navigate]);

  const handleSegmentClick = (segment: ThemeSegment) => {
    // Navigate to the diary that contains this segment
    navigate(`/diary/${segment.diary_id}`);
  };

  const handleEditTheme = (theme: Theme) => {
    console.log('Edit theme:', theme);
    // TODO: Implement theme editing
  };

  const handleDeleteTheme = (theme: Theme) => {
    console.log('Delete theme:', theme);
    // TODO: Implement theme deletion
  };

  const handleThemeClick = (theme: Theme) => {
    navigate(`/theme/${theme.id}`);
  };

  const handleCreateTheme = () => {
    console.log('Create new theme');
    // TODO: Implement theme creation
  };

  if (isLoading) {
    return (
      <div className="app">
        <div className="app__loading">
          <div className="spinner"></div>
          <p>Loading theme...</p>
        </div>
      </div>
    );
  }

  if (!theme) {
    return (
      <div className="app">
        <div className="app__error">
          <h2>Theme not found</h2>
          <p>The requested theme could not be found.</p>
          <button onClick={() => navigate('/')}>Go Home</button>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      {/* Header */}
      <header className="app__header">
        <div className="app__container">
          <div className="app__brand">
            <h1 className="app__title">Diary Reflection</h1>
            <p className="app__subtitle">Organize your thoughts by themes</p>
          </div>
          <div className="app__header-actions">
            <Navigation />
            <DataModeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="app__main">
        <div className="app__layout">
          {/* Left Sidebar - Theme List */}
          <ThemeSidebar
            themes={mockThemes}
            selectedThemeId={themeId}
            onThemeSelect={handleThemeClick}
            onCreateTheme={handleCreateTheme}
            onSearchChange={setSearchQuery}
            isLoading={false}
            searchQuery={searchQuery}
          />

          {/* Right Content Area */}
          <div className="app__content">
            <ThemePage
              theme={theme}
              segments={segments}
              onSegmentClick={handleSegmentClick}
              onEditTheme={handleEditTheme}
              onDeleteTheme={handleDeleteTheme}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

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
      name: 'All Notes',
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

  // Helper function to clean up empty temporary diaries
  const cleanupEmptyTempDiary = (tempDiary: Diary) => {
    if (tempDiary.id.startsWith('temp-') && 
        (!tempDiary.title || tempDiary.title.trim() === '') && 
        (!tempDiary.content || tempDiary.content.trim() === '')) {
      
      // Remove the empty temporary diary from folders
      setFolders(prevFolders => 
        prevFolders.map(folder => ({
          ...folder,
          diaries: folder.diaries.filter(d => d.id !== tempDiary.id)
        }))
      );
      
      // Remove from filtered diaries
      setFilteredDiaries(prevDiaries => 
        prevDiaries.filter(d => d.id !== tempDiary.id)
      );
    }
  };

  // Load diary from URL parameter
  useEffect(() => {
    const loadDiaryFromUrl = async () => {
      if (diaryId && diaryId !== 'new') {
        // Check if we're switching to a different diary (not the current one)
        if (selectedDiary && selectedDiary.id !== diaryId) {
          cleanupEmptyTempDiary(selectedDiary);
        }

        // Check if this is a temporary diary ID
        if (diaryId.startsWith('temp-')) {
          // For temporary diaries, find it in our local state
          const tempDiary = filteredDiaries.find(d => d.id === diaryId);
          if (tempDiary) {
            setSelectedDiary(tempDiary);
          } else {
            // If temp diary not found in state, navigate to home
            navigate('/');
          }
        } else {
          // For regular diaries, fetch from service
          try {
            const diary = await diaryService.getDiaryById(diaryId);
            setSelectedDiary(diary);
          } catch (err) {
            console.error('Failed to load diary from URL:', err);
            setSelectedDiary(null);
            navigate('/');
          }
        }
      } else if (diaryId === 'new') {
        // Check if we're switching away from a diary
        if (selectedDiary) {
          cleanupEmptyTempDiary(selectedDiary);
        }
        setSelectedDiary(null);
      }
    };

    loadDiaryFromUrl();
  }, [diaryId, navigate]);

  // Handle create new diary
  const handleCreateNew = (folderId: string) => {
    // Create a temporary diary entry immediately
    const tempDiary: Diary = {
      id: `temp-${Date.now()}`,
      title: null,
      content: '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Add the temporary diary to the appropriate folder
    setFolders(prevFolders => 
      prevFolders.map(folder => 
        folder.id === folderId 
          ? { ...folder, diaries: [tempDiary, ...folder.diaries] }
          : folder
      )
    );

    // Update filtered diaries to include the new entry
    setFilteredDiaries(prevDiaries => [tempDiary, ...prevDiaries]);

    // Set as selected diary and navigate to it
    setSelectedDiary(tempDiary);
    navigate(`/diary/${tempDiary.id}`);
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
    // Check if current selected diary is an empty temporary diary
    if (selectedDiary) {
      cleanupEmptyTempDiary(selectedDiary);
    }
    
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
        // Check if this is a temporary diary (starts with 'temp-')
        if (selectedDiary.id.startsWith('temp-')) {
          // Create new diary for temporary entries
          const newDiary = await diaryService.createDiary(data);
          
          // Update folders to replace temporary diary with real one
          setFolders(prevFolders => 
            prevFolders.map(folder => ({
              ...folder,
              diaries: folder.diaries.map(diary => 
                diary.id === selectedDiary.id ? newDiary : diary
              )
            }))
          );
          
          // Update filtered diaries
          setFilteredDiaries(prevDiaries => 
            prevDiaries.map(diary => 
              diary.id === selectedDiary.id ? newDiary : diary
            )
          );
          
          setSelectedDiary(newDiary);
          
          // Update URL to reflect the new diary ID
          navigate(`/diary/${newDiary.id}`, { replace: true });
        } else {
          // Update existing diary
          const updatedDiary = await diaryService.updateDiary(selectedDiary.id, data);
          setSelectedDiary(updatedDiary);
        }
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

  // Handle segment creation
  const handleCreateSegment = async (segmentData: { content: string; themeId: string; diaryId: string }) => {
    try {
      // TODO: Implement segment creation API call
      console.log('Creating segment:', segmentData);
      // Segment created successfully - no popup needed
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create segment');
    }
  };

  // Handle theme creation
  const handleCreateTheme = async (themeData: { name: string; description: string; color_hex: string }) => {
    try {
      // TODO: Implement theme creation API call
      console.log('Creating theme:', themeData);
      // Theme created successfully - no popup needed
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create theme');
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
            <Navigation onNavigateAway={() => selectedDiary && cleanupEmptyTempDiary(selectedDiary)} />
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
              onCreateSegment={handleCreateSegment}
              onCreateTheme={handleCreateTheme}
              themes={mockThemes}
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
      <Route path="/theme" element={<ThemeListApp />} />
      <Route path="/theme/:themeId" element={<ThemeApp />} />
    </Routes>
  );
}

export default App;
