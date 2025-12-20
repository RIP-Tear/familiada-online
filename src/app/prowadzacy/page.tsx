"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { createGame as createGameAction } from "@/redux/reducer/gameSlice";
import { createGame, generateUserId, startGame, subscribeToGame, resetGameToWaiting, resetGameStatus, getGame } from "@/utils/firebaseUtils";
import { gameHistoryStorage, type GameHistoryEntry } from "@/utils/gameHistoryStorage";
import { Navbar } from "@/components";
import { PiUsers, PiUsersThree, PiBookOpenFill, PiPlus, PiClock, PiPlusCircleFill } from "react-icons/pi";
import "@/styles/multiplayer.scss";

export default function HostPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const gameState = useAppSelector((state) => state.game);
  
  // Stany dla wyboru gry
  const [gameSelected, setGameSelected] = useState(false);
  const [gameHistory, setGameHistory] = useState<GameHistoryEntry[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  
  // Stany dla poczekalni
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState(null);
  const [teams, setTeams] = useState([]);

  // Set dynamic meta tags
  useEffect(() => {
    document.title = "Stwórz grę jako prowadzący | Familiada Online";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Załóż nową rozgrywkę w Familiadę online. Generuj kod gry, zarządzaj drużynami i prowadź teleturniej jako host.');
    }
  }, []);

  // Jeśli mamy gameCode w Redux, automatycznie przejdź do widoku poczekalni
  useEffect(() => {
    if (gameState.gameCode) {
      setGameSelected(true);
    }
  }, [gameState.gameCode]);

  // Wczytanie historii gier przy starcie
  useEffect(() => {
    const loadHistoryWithCategories = async () => {
      setIsLoadingHistory(true);
      const history = gameHistoryStorage.getHistory();
      
      // Dla każdej gry w historii pobierz liczbę własnych kategorii
      const historyWithCategories = await Promise.all(
        history.map(async (game) => {
          try {
            const gameData = await getGame(game.gameCode);
            const customCategoriesCount = gameData?.hostCustomCategories?.length || 0;
            
            // Jeśli liczba się zmieniła, zaktualizuj w storage
            if (customCategoriesCount !== game.customCategoriesCount) {
              gameHistoryStorage.updateGame(game.gameCode, { 
                customCategoriesCount 
              });
            }
            
            return { ...game, customCategoriesCount };
          } catch (error) {
            console.error(`Error loading categories for game ${game.gameCode}:`, error);
            return game;
          }
        })
      );
      
      setGameHistory(historyWithCategories);
      setIsLoadingHistory(false);
    };
    
    loadHistoryWithCategories();
  }, []);

  useEffect(() => {
    if (gameState.gameCode && gameSelected) {
      const unsubscribe = subscribeToGame(gameState.gameCode, (gameData) => {
        setTeams(gameData.teams || []);
        
        // Aktualizuj historię
        if (gameData.teams && gameData.teams.length > 0) {
          gameHistoryStorage.updateTeams(
            gameState.gameCode,
            gameData.teams.map((t: any) => t.name)
          );
        }
        
        // Jeśli status zmienił się na 'playing', przekieruj do gry
        if (gameData.status === 'playing') {
          gameHistoryStorage.updateStatus(gameState.gameCode, 'playing');
          router.push('/game/host/');
        }
      });

      return () => unsubscribe();
    }
  }, [gameState.gameCode, gameSelected]);

  const handleCreateNewGame = async () => {
    setIsCreating(true);
    setError(null);
    
    try {
      const userId = generateUserId();
      const { gameCode, gameId } = await createGame(userId);
      
      // Zapisz do Redux
      dispatch(createGameAction({
        gameCode,
        gameId,
        userId,
      }));
      
      // Zapisz do historii
      gameHistoryStorage.addGame(gameCode);
      
      console.log(`✅ Game created successfully: ${gameCode}`);
      
      // Przejdź do poczekalni
      setGameSelected(true);
      
    } catch (err) {
      console.error("Error creating game:", err);
      setError("Nie udało się stworzyć gry. Spróbuj ponownie.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleSelectExistingGame = async (gameCode: string) => {
    setIsCreating(true);
    setError(null);
    
    try {
      // Wygeneruj nowy hostId
      const userId = generateUserId();
      
      // Zresetuj całą grę (usuń poprzednie drużyny i wyniki) i ustaw nowy hostId
      await resetGameToWaiting(gameCode, userId);
      
      // Wczytaj kod i przejdź do poczekalni
      dispatch(createGameAction({
        gameCode,
        gameId: gameCode,
        userId,
      }));
      
      // Aktualizuj czas ostatniego dostępu w historii
      gameHistoryStorage.updateGame(gameCode, { 
        lastAccessedAt: new Date().toISOString()
      });
      
      console.log(`✅ Loaded existing game: ${gameCode}`);
      
      // Przejdź do poczekalni
      setGameSelected(true);
    } catch (err) {
      console.error("Error loading game:", err);
      setError("Nie udało się wczytać gry. Gra może już nie istnieć.");
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

  const handleCancel = async () => {
    if (gameSelected && gameState.gameCode) {
      // Resetuj grę przed wyjściem z poczekalni (bez zmiany hostId)
      try {
        await resetGameToWaiting(gameState.gameCode);
        console.log(`🔄 Game ${gameState.gameCode} reset on cancel`);
      } catch (err) {
        console.error("Error resetting game on cancel:", err);
      }
      
      // Powrót do wyboru gry
      setGameSelected(false);
      setError(null);
    } else {
      // Powrót do strony głównej
      router.push('/gra/');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Przed chwilą';
    if (diffMins < 60) return `${diffMins} min temu`;
    if (diffHours < 24) return `${diffHours}h temu`;
    if (diffDays < 7) return `${diffDays} dni temu`;
    
    return date.toLocaleDateString('pl-PL', { 
      day: '2-digit', 
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Ekran ładowania
  if (isCreating) {
    return (
      <>
        <Navbar />
        <div className="host-container">
          <div className="title-section">
            <h1 className="host-title">
              {gameSelected ? 'Wczytywanie gry...' : 'Tworzenie gry...'}
            </h1>
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

  // Ekran wyboru gry (nowa/stara)
  if (!gameSelected) {
    return (
      <>
        <Navbar />
        <div className="host-container">
          <div className="title-section">
            <h1 className="host-title">Wybierz grę</h1>
          </div>
          
          <div className="host-content">
            {error && <div className="error-message">{error}</div>}
            
            {/* Przycisk nowej gry */}
            <div className="game-selection-section">
              <button 
                className="btn-new-game"
                onClick={handleCreateNewGame}
              >
                <PiPlus className="btn-icon" size={32} />
                <span className="btn-text">Stwórz nową grę</span>
              </button>
            </div>

            {/* Loader podczas ładowania historii */}
            {isLoadingHistory ? (
              <div className="game-history-loading">
                <div className="loading-spinner"></div>
                <p className="loading-text">Ładowanie historii gier...</p>
              </div>
            ) : (
              /* Lista poprzednich gier */
              gameHistory.length > 0 && (
              <div className="game-history-section">
                <h3 className="history-title">
                  <PiClock size={20} />
                  Poprzednie gry
                </h3>
                <div className="game-history-list">
                  {gameHistory.map((game) => (
                    <div 
                      key={game.gameCode}
                      className="game-history-item"
                      onClick={() => handleSelectExistingGame(game.gameCode)}
                    >
                      <div className="game-info">
                        <div className="game-code-display">{game.gameCode}</div>
                        <div className="game-details">
                          <span className="game-date">{formatDate(game.lastAccessedAt)}</span>
                          {game.teams && game.teams.length > 0 && (
                            <span className="game-teams">
                              {game.teams.join(' vs ')}
                            </span>
                          )}
                          {game.customCategoriesCount !== undefined && game.customCategoriesCount > 0 && (
                            <span className="game-custom-categories">
                              <PiBookOpenFill size={14} />
                              {game.customCategoriesCount} {game.customCategoriesCount === 1 ? 'własna kategoria' : 'własne kategorie'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              )
            )}

            <div className="host-actions">
              <button 
                className="btn-cancel"
                onClick={handleCancel}
              >
                Powrót
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Ekran poczekalni (gdy gra jest wybrana)
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
        
        {/* Przycisk do tworzenia kategorii przed grą */}
        <div className="pre-game-categories-section">
          <button 
            className="btn-create-categories"
            onClick={() => router.push('/prowadzacy/kategorie/')}
          >
            <PiPlusCircleFill className="btn-icon" size={20} />
            Stwórz własne kategorie w tej grze
          </button>
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
