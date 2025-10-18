// Navigation component - switches between Diary and Theme views
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../styles/Navigation.css';

interface NavigationProps {
  className?: string;
  onNavigateAway?: () => void;
}

const Navigation: React.FC<NavigationProps> = ({ className = '', onNavigateAway }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const isDiaryActive = location.pathname.startsWith('/diary') || location.pathname === '/';
  const isThemeActive = location.pathname.startsWith('/theme');

  const handleDiaryClick = () => {
    onNavigateAway?.();
    navigate('/');
  };

  const handleThemeClick = () => {
    onNavigateAway?.();
    navigate('/theme');
  };

  return (
    <nav className={`navigation ${className}`}>
      <div className="navigation__tabs">
        <button
          className={`navigation__tab ${isDiaryActive ? 'navigation__tab--active' : ''}`}
          onClick={handleDiaryClick}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path 
              d="M4 3h12a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" 
              stroke="currentColor" 
              strokeWidth="1.5" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
            <path 
              d="M8 7h4M8 11h4M8 15h2" 
              stroke="currentColor" 
              strokeWidth="1.5" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
          <span>Diaries</span>
        </button>
        
        <button
          className={`navigation__tab ${isThemeActive ? 'navigation__tab--active' : ''}`}
          onClick={handleThemeClick}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path 
              d="M9.5 1L12 5.5L17 6L13.5 9.5L14.5 14.5L9.5 12L4.5 14.5L5.5 9.5L2 6L7 5.5L9.5 1Z" 
              stroke="currentColor" 
              strokeWidth="1.5" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
          <span>Themes</span>
        </button>
      </div>
    </nav>
  );
};

export default Navigation;
