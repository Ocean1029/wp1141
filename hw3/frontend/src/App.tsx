// Main App component - diary reflection application

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Routes, Route, useParams, useNavigate } from 'react-router-dom';
import type { Diary } from './types/diary';
import type { Theme, ThemeSegment } from './types/theme';
import diaryService from './services/diaryService';
import themeService from './services/themeService';
import segmentService from './services/segmentService';
import colorService from './services/colorService';
import DiaryForm, { DiaryFormRef } from './components/DiaryForm';
import ThemePage from './components/ThemePage';
import ThemeList from './components/ThemeList';
import ThemeSidebar from './components/ThemeSidebar';
import Navigation from './components/Navigation';
import ConfirmDialog from './components/ConfirmDialog';
import DataModeToggle from './components/DataModeToggle';
import DiarySidebar from './components/DiarySidebar';
import CreateFolderDialog from './components/CreateFolderDialog';
import './App.css';

// Theme list page component
function ThemeListApp() {
  const navigate = useNavigate();
  const [themes, setThemes] = useState<Theme[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load themes from API
  useEffect(() => {
    const loadThemes = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const themesData = await themeService.getAllThemes();
        setThemes(themesData);
      } catch (err) {
        console.error('Failed to load themes:', err);
        setError(err instanceof Error ? err.message : 'Failed to load themes');
      } finally {
        setIsLoading(false);
      }
    };

    loadThemes();
  }, []);

  // Filter themes based on search query
  const filteredThemes = themes.filter(theme =>
    theme.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (theme.description && theme.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  
  const handleThemeClick = (theme: Theme) => {
    navigate(`/theme/${theme.id}`);
  };

  const handleEditTheme = async (theme: Theme) => {
    try {
      // TODO: Open edit dialog
      console.log('Edit theme:', theme);
    } catch (err) {
      console.error('Failed to edit theme:', err);
    }
  };

  const handleDeleteTheme = async (theme: Theme) => {
    try {
      if (window.confirm(`Are you sure you want to delete "${theme.name}"?`)) {
        await themeService.deleteTheme(theme.id);
        setThemes(prev => prev.filter(t => t.id !== theme.id));
      }
    } catch (err) {
      console.error('Failed to delete theme:', err);
      alert('Failed to delete theme');
    }
  };

  const handleCreateTheme = async () => {
    try {
      // TODO: Open create dialog
      console.log('Create new theme');
    } catch (err) {
      console.error('Failed to create theme:', err);
    }
  };

  return (
    <div className="app">
      {/* Header */}
      <header className="app__header">
        <div className="app__container app__container--centered">
          <Navigation />
          <DataModeToggle />
        </div>
      </header>

      {/* Main Content */}
      <main className="app__main">
        <div className="app__layout">
          {/* Left Sidebar - Theme List */}
          <ThemeSidebar
            themes={themes}
            selectedThemeId={null}
            onThemeSelect={handleThemeClick}
            onCreateTheme={handleCreateTheme}
            onSearchChange={setSearchQuery}
            isLoading={isLoading}
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
  const [themes, setThemes] = useState<Theme[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadThemeData = async () => {
      if (!themeId) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        // Load all themes for sidebar
        const allThemes = await themeService.getAllThemes();
        setThemes(allThemes);
        
        // Load specific theme with segments
        const themeData = await themeService.getThemeById(themeId);
        setTheme(themeData);
        setSegments(themeData.segments);
      } catch (err) {
        console.error('Failed to load theme:', err);
        setError(err instanceof Error ? err.message : 'Failed to load theme');
        // Redirect to theme list if theme not found
        navigate('/theme');
      } finally {
        setIsLoading(false);
      }
    };

    loadThemeData();
  }, [themeId, navigate]);

  const handleSegmentClick = (segment: ThemeSegment) => {
    // Navigate to the diary that contains this segment
    navigate(`/diary/${segment.diary_id}`);
  };

  const handleEditTheme = async (theme: Theme) => {
    try {
      // TODO: Open edit dialog
      console.log('Edit theme:', theme);
    } catch (err) {
      console.error('Failed to edit theme:', err);
    }
  };

  const handleDeleteTheme = async (theme: Theme) => {
    try {
      if (window.confirm(`Are you sure you want to delete "${theme.name}"?`)) {
        await themeService.deleteTheme(theme.id);
        navigate('/theme');
      }
    } catch (err) {
      console.error('Failed to delete theme:', err);
      alert('Failed to delete theme');
    }
  };

  const handleThemeClick = (theme: Theme) => {
    navigate(`/theme/${theme.id}`);
  };

  const handleCreateTheme = async () => {
    try {
      // TODO: Open create dialog
      console.log('Create new theme');
    } catch (err) {
      console.error('Failed to create theme:', err);
    }
  };

  const handleBackToThemes = () => {
    navigate('/theme');
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
        <div className="app__container app__container--centered">
          <Navigation />
          <DataModeToggle />
        </div>
      </header>

      {/* Main Content */}
      <main className="app__main">
        <div className="app__layout">
          {/* Left Sidebar - Theme List */}
          <ThemeSidebar
            themes={themes}
            selectedThemeId={themeId}
            onThemeSelect={handleThemeClick}
            onCreateTheme={handleCreateTheme}
            onSearchChange={setSearchQuery}
            isLoading={isLoading}
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
              onBackToThemes={handleBackToThemes}
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
  const [themes, setThemes] = useState<Theme[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirmDiary, setDeleteConfirmDiary] = useState<Diary | null>(null);
  const [isCreateFolderDialogOpen, setIsCreateFolderDialogOpen] = useState(false);
  const [pendingParentId, setPendingParentId] = useState<string>('root');
  const diaryFormRef = useRef<DiaryFormRef>(null);
  const [folders, setFolders] = useState<Array<{id: string, name: string, diaries: Diary[], parentId?: string, level: number}>>([
    {
      id: 'root',
      name: 'All Notes',
      diaries: [],
      level: 0,
    },
  ]);

  // Fetch all diaries and themes on component mount
  const fetchData = useCallback(async (query?: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Fetch diaries and themes in parallel
      const [fetchedDiaries, fetchedThemes] = await Promise.all([
        diaryService.getAllDiaries(query),
        themeService.getAllThemes()
      ]);
      
      setFilteredDiaries(fetchedDiaries);
      setThemes(fetchedThemes);
      
      // Update root folder with all diaries
      setFolders(prevFolders => 
        prevFolders.map(folder => 
          folder.id === 'root' 
            ? { ...folder, diaries: fetchedDiaries }
            : folder
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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
  const handleDiaryClick = async (diary: Diary) => {
    // Save current changes before switching
    if (diaryFormRef.current?.hasUnsavedChanges) {
      try {
        await diaryFormRef.current.saveChanges();
      } catch (err) {
        console.error('Failed to save changes before navigation:', err);
        // Continue with navigation even if save fails
      }
    }

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
      await fetchData(searchQuery);
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
      await fetchData(searchQuery);
    } catch (err) {
      console.error('Auto-save failed:', err);
      throw err;
    }
  };

  // Handle segment creation
  const handleCreateSegment = async (segmentData: { content: string; themeId: string; diaryId: string }) => {
    try {
      // Create segment using API
      const newSegment = await segmentService.createSegment({
        diary_id: segmentData.diaryId,
        theme_id: segmentData.themeId,
        content: segmentData.content,
        segment_order: 0, // Will be updated by backend
      });
      
      console.log('Segment created successfully:', newSegment);
      
      // Show success message (optional)
      // You could add a toast notification here
      
    } catch (err) {
      console.error('Failed to create segment:', err);
      setError(err instanceof Error ? err.message : 'Failed to create segment');
    }
  };

  // Handle theme creation
  const handleCreateTheme = async (themeData: { name: string; description: string; color_hex: string }) => {
    try {
      // Find color by hex code or create a new one
      let colorId: number | undefined;
      
      // Try to find existing color by hex code
      const colors = await colorService.getAllColors();
      const existingColor = colors.find(color => color.hex_code === themeData.color_hex);
      
      if (existingColor) {
        colorId = existingColor.id;
      } else {
        // Create new color
        const newColor = await colorService.createColor({
          hexCode: themeData.color_hex,
          name: `Color ${themeData.color_hex}`,
          meaning: `Color for ${themeData.name} theme`,
        });
        colorId = newColor.id;
      }
      
      // Create theme using API
      const newTheme = await themeService.createTheme({
        name: themeData.name,
        description: themeData.description,
        color_id: colorId,
      });
      
      console.log('Theme created successfully:', newTheme);
      
      // Update themes list
      setThemes(prev => [...prev, newTheme]);
      
    } catch (err) {
      console.error('Failed to create theme:', err);
      setError(err instanceof Error ? err.message : 'Failed to create theme');
    }
  };

  return (
    <div className="app">
      {/* Header */}
      <header className="app__header">
        <div className="app__container app__container--centered">
          <Navigation onNavigateAway={async () => {
            if (diaryFormRef.current?.hasUnsavedChanges) {
              try {
                await diaryFormRef.current.saveChanges();
              } catch (err) {
                console.error('Failed to save changes before navigation:', err);
              }
            }
            if (selectedDiary) {
              cleanupEmptyTempDiary(selectedDiary);
            }
          }} />
          <DataModeToggle />
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
              ref={diaryFormRef}
              diary={selectedDiary}
              onAutoSave={handleAutoSave}
              onCreateSegment={handleCreateSegment}
              onCreateTheme={handleCreateTheme}
              themes={themes}
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
