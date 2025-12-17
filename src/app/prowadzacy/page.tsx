"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { createGame as createGameAction } from "@/redux/reducer/gameSlice";
import { createGame, generateUserId, startGame, subscribeToGame } from "@/utils/firebaseUtils";
import { Navbar } from "@/components";
import { PiUsers, PiUsersThree, PiBookOpenFill } from "react-icons/pi";
import "@/styles/multiplayer.scss";

export default function HostPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const gameState = useAppSelector((state) => state.game);
  
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState(null);
  const [teams, setTeams] = useState([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Set dynamic meta tags
  useEffect(() => {
    document.title = "Stwórz grę jako prowadzący | Familiada Online";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Załóż nową rozgrywkę w Familiadę online. Generuj kod gry, zarządzaj drużynami i prowadź teleturniej jako host.');
    }
  }, []);

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
          router.push('/game/host/');
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
    router.push('/gra/');
  };

  if (isCreating) {
    return (
      <>
        <Navbar />
        <div className="host-container">
          <div className="title-section">
            <h1 className="host-title">Tworzenie gry</h1>
          </div>
          
          <div className="host-content">
            <div className="loading-section">
              <p className="loading-text">Przygotowujemy twój pokój gry...</p>
              <div className="loading-spinner"></div>
              <p className="loading-hint">Za chwilę otrzymasz kod dla drużyn</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="host-container">
        <div className="title-section">
          <h1 className="host-title">Poczekalnia</h1>
        </div>
        
        <div className="host-content">
          <div className="game-code-section">
            <label className="code-label">Podaj ten kod drużynom</label>
            <div className="game-code">{gameState.gameCode || '----'}</div>
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="players-section">
            <h3>Drużyny ({teams.length}/2)</h3>
            <div className="players-list">
              <div className={`player-card ${teams.length >= 1 ? 'active' : 'waiting'}`}>
                {teams.length >= 1 ? (
                  <>
                    <PiUsersThree className="team-icon active" />
                    <span className="player-name">{teams[0]?.name}</span>
                  </>
                ) : (
                  <>
                    <PiUsers className="team-icon waiting" />
                    <span className="player-name waiting">Oczekiwanie na drużynę...</span>
                  </>
                )}
              </div>
              
              <div className={`player-card ${teams.length >= 2 ? 'active' : 'waiting'}`}>
                {teams.length >= 2 ? (
                  <>
                    <PiUsersThree className="team-icon active" />
                    <span className="player-name">{teams[1]?.name}</span>
                  </>
                ) : (
                  <>
                    <PiUsers className="team-icon waiting" />
                    <span className="player-name waiting">Oczekiwanie na drużynę...</span>
                  </>
                )}
              </div>
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
        
        <div className="rules-link-section">
          <button className="btn-rules-link" onClick={() => router.push('/zasady/')}>
            <div className="button-icon">
              <PiBookOpenFill size={24} />
            </div>
            <div className="button-text">
              <h2>Instrukcja gry</h2>
            </div>
          </button>
        </div>
      </div>
    </>
  );
}