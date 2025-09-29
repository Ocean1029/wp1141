import React from 'react';
import { useGameState } from './hooks/useGameState';
import { useKeyboardControls } from './hooks/useKeyboardControls';
import { createStateTransitionHandler } from './utils/gameStateTransitions';
import { GameSceneRenderer } from './components/GameSceneRenderer';
import ErrorBoundary from './components/ui/ErrorBoundary';

const App: React.FC = () => {
  // Get game state and data from custom hook
  const { gameState, setGameState, gameData } = useGameState();
  
  // Initialize keyboard controls
  useKeyboardControls(gameState, setGameState);
  
  // Create state transition handlers with clear, descriptive names
  const stateTransitions = createStateTransitionHandler(setGameState);

  return (
    <ErrorBoundary>
      <div className="app">
        <GameSceneRenderer
          gameState={gameState}
          gameData={gameData}
          onStartGame={stateTransitions.startGame}
          onPauseGame={stateTransitions.pauseGame}
          onResumeGame={stateTransitions.resumeGame}
          onEndGame={stateTransitions.endGame}
          onRestartGame={stateTransitions.restartGame}
        />
      </div>
    </ErrorBoundary>
  );
};

export default App;
