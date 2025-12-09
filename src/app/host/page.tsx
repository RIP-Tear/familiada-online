"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { createGame as createGameAction } from "@/redux/reducer/gameSlice";
import { createGame, generateUserId, startGame, subscribeToGame } from "@/utils/firebaseUtils";
import { Navbar } from "@/components";
import "@/styles/multiplayer.scss";

export default function HostPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const gameState = useAppSelector((state) => state.game);
  
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState(null);
  const [teams, setTeams] = useState([]);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Automatyczne tworzenie gry tylko raz przy pierwszym renderze
    if (!isInitialized && !gameState.gameCode) {
      setIsInitialized(true);
      handleCreateGame();
    }
  }, []);

  useEffect(() => {
    if (gameState.gameCode) {
      const unsubscribe = subscribeToGame(gameState.gameCode, (gameData) => {
        setTeams(gameData.teams || []);
        
        // Jeśli status zmienił się na 'playing', przekieruj do gry
        if (gameData.status === 'playing') {
          router.push('/game/host');
        }
      });

      return () => unsubscribe();
    }
  }, [gameState.gameCode]);

  const handleCreateGame = async () => {
    setIsCreating(true);
    setError(null);
    
    try {
      const userId = generateUserId();
      const { gameCode, gameId } = await createGame(userId);
      
      // Zapisz do Redux DOPIERO po stworzeniu gry
      dispatch(createGameAction({
        gameCode,
        gameId,
        userId,
      }));
      
      console.log(`✅ Game created successfully: ${gameCode}`);
      
    } catch (err) {
      console.error("Error creating game:", err);
      setError("Nie udało się stworzyć gry. Spróbuj ponownie.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleStartGame = async () => {
    if (teams.length < 2) {
      setError("Minimum 2 drużyny muszą dołączyć do gry!");
      return;
    }
    
    try {
      await startGame(gameState.gameCode);
    } catch (err) {
      console.error("Error starting game:", err);
      setError("Nie udało się rozpocząć gry.");
    }
  };

  const handleCancel = () => {
    router.push('/home');
  };

  if (isCreating) {
    return (
      <>
        <Navbar />
        <div className="host-container">
          <div className="loading">Tworzenie gry...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="host-container">
        <div className="host-content">
          <h1 className="host-title">Poczekalnia</h1>
          
          <div className="game-code-display">
            <p className="code-label">Kod gry:</p>
            <h2 className="game-code">{gameState.gameCode || '----'}</h2>
            <p className="code-instruction">Podaj ten kod drużynom</p>
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="players-section">
            <h3>Drużyny ({teams.length}/2)</h3>
            <div className="players-list">
              {teams.length === 0 ? (
                <p className="no-players">Oczekiwanie na drużyny...</p>
              ) : (
                teams.map((team, index) => (
                  <div key={team.id} className="player-card">
                    <span className="player-name">
                      {index === 0 ? '🔴' : '🔵'} {team.name}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="host-actions">
            <button 
              className="btn-start"
              onClick={handleStartGame}
              disabled={teams.length < 2}
            >
              {teams.length < 2 ? `Czekaj na drużyny (${teams.length}/2)` : 'Rozpocznij grę'}
            </button>
            <button 
              className="btn-cancel"
              onClick={handleCancel}
            >
              Anuluj
            </button>
          </div>
        </div>
      </div>
    </>
  );
}