import React, { createContext, useContext, useReducer } from 'react';
import type { ReactNode } from 'react';

// 遊戲狀態類型定義
export interface GameData {
  score: number;
  level: number;
  lives: number;
  combo: number;
  bestScore: number;
}

export interface GameConfig {
  canvas: {
    width: number;
    height: number;
  };
  audio: {
    masterVolume: number;
    musicVolume: number;
    sfxVolume: number;
  };
  game: {
    fps: number;
    debug: boolean;
  };
}

// 遊戲狀態
interface GameState {
  gameData: GameData;
  config: GameConfig;
  isAudioEnabled: boolean;
  isFullscreen: boolean;
}

// Action 類型
type GameAction =
  | { type: 'UPDATE_SCORE'; payload: number }
  | { type: 'INCREMENT_LEVEL' }
  | { type: 'DECREASE_LIVES' }
  | { type: 'RESET_GAME' }
  | { type: 'UPDATE_COMBO'; payload: number }
  | { type: 'TOGGLE_AUDIO' }
  | { type: 'TOGGLE_FULLSCREEN' }
  | { type: 'UPDATE_BEST_SCORE'; payload: number };

// 初始狀態
const initialState: GameState = {
  gameData: {
    score: 0,
    level: 1,
    lives: 3,
    combo: 0,
    bestScore: parseInt(localStorage.getItem('bestScore') || '0'),
  },
  config: {
    canvas: { width: 800, height: 600 },
    audio: { masterVolume: 0.7, musicVolume: 0.5, sfxVolume: 0.8 },
    game: { fps: 60, debug: false },
  },
  isAudioEnabled: true,
  isFullscreen: false,
};

// Reducer
const gameReducer = (state: GameState, action: GameAction): GameState => {
  switch (action.type) {
    case 'UPDATE_SCORE':
      return {
        ...state,
        gameData: {
          ...state.gameData,
          score: state.gameData.score + action.payload,
        },
      };
    
    case 'INCREMENT_LEVEL':
      return {
        ...state,
        gameData: {
          ...state.gameData,
          level: state.gameData.level + 1,
        },
      };
    
    case 'DECREASE_LIVES':
      return {
        ...state,
        gameData: {
          ...state.gameData,
          lives: Math.max(0, state.gameData.lives - 1),
        },
      };
    
    case 'RESET_GAME':
      return {
        ...state,
        gameData: {
          ...initialState.gameData,
          bestScore: state.gameData.bestScore,
        },
      };
    
    case 'UPDATE_COMBO':
      return {
        ...state,
        gameData: {
          ...state.gameData,
          combo: action.payload,
        },
      };
    
    case 'TOGGLE_AUDIO':
      return {
        ...state,
        isAudioEnabled: !state.isAudioEnabled,
      };
    
    case 'TOGGLE_FULLSCREEN':
      return {
        ...state,
        isFullscreen: !state.isFullscreen,
      };
    
    case 'UPDATE_BEST_SCORE':
      localStorage.setItem('bestScore', action.payload.toString());
      return {
        ...state,
        gameData: {
          ...state.gameData,
          bestScore: action.payload,
        },
      };
    
    default:
      return state;
  }
};

// Context
interface GameContextType {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

// Provider
interface GameProviderProps {
  children: ReactNode;
  config: GameConfig;
}

export const GameProvider: React.FC<GameProviderProps> = ({ children, config }) => {
  const [state, dispatch] = useReducer(gameReducer, {
    ...initialState,
    config: { ...initialState.config, ...config },
  });

  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
};

// Hook
export const useGameContext = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGameContext must be used within a GameProvider');
  }
  return context;
};
