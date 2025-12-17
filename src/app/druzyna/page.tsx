"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { joinGame as joinGameAction } from "@/redux/reducer/gameSlice";
import { joinGame, leaveGame, subscribeToGame } from "@/utils/firebaseUtils";
import { Navbar } from "@/components";
import { PiBookOpenFill } from "react-icons/pi";
import "@/styles/multiplayer.scss";

export default function JoinPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  
  const [gameCode, setGameCode] = useState("");
  const [teamName, setTeamName] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState(null);
  const [gameId, setGameId] = useState(null);
  const [teamId, setTeamId] = useState(null);

  // Set dynamic meta tags
  useEffect(() => {
    document.title = "Dołącz do gry | Familiada Online";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Wpisz kod gry i dołącz do rozgrywki w Familiadę online. Stwórz nazwę drużyny i rozpocznij rywalizację z innymi graczami.');
    }
  }, []);

  useEffect(() => {
    if (gameId) {
      const unsubscribe = subscribeToGame(gameId, (gameData) => {
        // Jeśli gra się rozpoczęła, przekieruj do widoku gracza
        if (gameData.status === 'playing') {
          router.push('/game/player/');
        }
      });

      return () => unsubscribe();
    }
  }, [gameId]);

  const handleJoinGame = async (e) => {
    e.preventDefault();
    
    if (!gameCode.trim() || !teamName.trim()) {
      setError("Wypełnij wszystkie pola!");
      return;
    }
    
    setIsJoining(true);
    setError(null);
    
    try {
      const result = await joinGame(
        gameCode.toUpperCase().trim(), 
        teamName.trim()
      );
      
      dispatch(joinGameAction({
        gameCode: result.gameCode,
        gameId: result.gameId,
        userId: result.teamId,
        userName: teamName.trim(),
        userTeam: null,
      }));
      
      setGameId(result.gameId);
      setTeamId(result.teamId);
      
    } catch (err) {
      console.error("Error joining game:", err);
      setError(err.message || "Nie udało się dołączyć do gry.");
      setIsJoining(false);
    }
  };

  const handleCancel = async () => {
    // Jeśli drużyna dołączyła do gry, usuń ją przed wyjściem
    if (gameId && teamId) {
      try {
        await leaveGame(gameId, teamId);
      } catch (err) {
        console.error("Error leaving game:", err);
      }
    }
    router.push('/gra/');
  };

  if (isJoining && gameId) {
    return (
      <>
        <Navbar />
        <div className="join-container">
          <div className="title-section">
            <h1 className="join-title">Poczekaj na grę...</h1>
          </div>
          
          <div className="join-content">
            <p>Prowadzący wkrótce rozpocznie rozgrywkę</p>
            <div className="loading-spinner"></div>
            
            <div className="form-actions">
              <button 
                type="button" 
                className="btn-join"
                disabled={true}
              >
                Dołącz
              </button>
              <button 
                type="button"
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

  return (
    <>
      <Navbar />
      <div className="join-container">
        <div className="title-section">
          <h1 className="join-title">Dołącz jako drużyna</h1>
        </div>
        
        <div className="join-content">
        <form onSubmit={handleJoinGame} className="join-form">
          <div className="form-group">
            <label htmlFor="gameCode">Wpisz kod gry który poda prowadzący</label>
            <input
              id="gameCode"
              type="text"
              className="form-input code-input"
              value={gameCode}
              onChange={(e) => setGameCode(e.target.value.toUpperCase())}
              placeholder="np. A7K2"
              maxLength={4}
              disabled={isJoining}
            />
          </div>

          <div className="form-group">
            <label htmlFor="teamName">Nazwa drużyny</label>
            <input
              id="teamName"
              type="text"
              className="form-input"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              placeholder="np. Czerwone Smoki"
              maxLength={30}
              disabled={isJoining}
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="form-actions">
            <button 
              type="submit" 
              className="btn-join"
              disabled={isJoining}
            >
              {isJoining ? 'Dołączanie...' : 'Dołącz'}
            </button>
            <button 
              type="button"
              className="btn-cancel"
              onClick={handleCancel}
              disabled={isJoining}
            >
              Anuluj
            </button>
          </div>
        </form>
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
