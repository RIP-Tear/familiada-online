"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { joinGame as joinGameAction } from "@/redux/reducer/gameSlice";
import { 
  subscribeToGame, 
  getAvailableTeams, 
  joinGameAsParticipant,
  leaveGameAsParticipant 
} from "@/utils/firebaseUtils";
import { Navbar } from "@/components";
import { PiBookOpenFill, PiUsersThree, PiUsers } from "react-icons/pi";
import "@/styles/multiplayer.scss";
import type { Team } from "@/types/game";

export default function ParticipantJoinPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  
  const [gameCode, setGameCode] = useState("");
  const [participantName, setParticipantName] = useState("");
  const [selectedTeam, setSelectedTeam] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const [gameCodeError, setGameCodeError] = useState("");
  const [participantNameError, setParticipantNameError] = useState("");
  const [teamError, setTeamError] = useState("");
  const [gameId, setGameId] = useState<string | null>(null);
  const [participantId, setParticipantId] = useState<string | null>(null);
  const [availableTeams, setAvailableTeams] = useState<Team[]>([]);
  const [isLoadingTeams, setIsLoadingTeams] = useState(false);

  // Set dynamic meta tags
  useEffect(() => {
    document.title = "Dołącz jako uczestnik | Familiada Online";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Dołącz do rozgrywki jako uczestnik i obserwuj grę z perspektywy swojej drużyny.');
    }
  }, []);

  // Nasłuchuj zmian w grze - sprawdzaj czy gra się rozpoczęła
  useEffect(() => {
    if (gameId) {
      const unsubscribe = subscribeToGame(gameId, (gameData) => {
        // Aktualizuj dostępne drużyny
        if (gameData.teams && gameData.teams.length > 0) {
          setAvailableTeams(gameData.teams);
          setIsLoadingTeams(false);
        }
        
        // Jeśli gra się rozpoczęła, przekieruj do widoku uczestnika
        if (gameData.status === 'playing') {
          router.push('/game/player/'); // Tymczasowo używamy tego samego widoku
        }
      });

      return () => unsubscribe();
    }
  }, [gameId, router]);

  // Sprawdź kod gry i załaduj dostępne drużyny
  const handleGameCodeChange = async (code: string) => {
    setGameCode(code.toUpperCase());
    setGameCodeError("");
    
    if (code.length === 4) {
      setIsLoadingTeams(true);
      try {
        const teams = await getAvailableTeams(code.toUpperCase());
        setAvailableTeams(teams);
        if (teams.length > 0) {
          setGameId(code.toUpperCase());
        } else {
          setGameCodeError("Czekaj na kapitanów drużyn");
        }
      } catch (error) {
        setGameCodeError("Nie można pobrać drużyn");
        setAvailableTeams([]);
      } finally {
        setIsLoadingTeams(false);
      }
    } else {
      setAvailableTeams([]);
      setGameId(null);
    }
  };

  const handleJoinGame = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Resetuj błędy
    setGameCodeError("");
    setParticipantNameError("");
    setTeamError("");
    
    // Walidacja
    let hasError = false;
    
    if (!gameCode.trim() || gameCode.trim().length < 4) {
      setGameCodeError("Niepoprawny kod");
      hasError = true;
    }
    
    if (!participantName.trim()) {
      setParticipantNameError("Uzupełnij nazwę");
      hasError = true;
    }
    
    if (!selectedTeam) {
      setTeamError("Wybierz drużynę");
      hasError = true;
    }
    
    if (hasError) {
      return;
    }
    
    setIsJoining(true);
    
    try {
      const result = await joinGameAsParticipant(
        gameCode.toUpperCase().trim(),
        participantName.trim(),
        selectedTeam
      );
      
      // Sprawdź czy zwrócono błąd
      if (result.error) {
        if (result.error === 'Gra nie istnieje') {
          setGameCodeError("Kod do gry nie istnieje");
        } else {
          setGameCodeError(result.error);
        }
        setIsJoining(false);
        return;
      }
      
      dispatch(joinGameAction({
        gameCode: result.gameCode,
        gameId: result.gameId,
        userId: result.teamId,
        userName: participantName.trim(),
        userTeam: selectedTeam,
        isParticipant: true,
      }));
      
      setParticipantId(result.teamId);
      
    } catch (err) {
      setGameCodeError("Nie udało się dołączyć do gry");
      setIsJoining(false);
    }
  };

  const handleCancel = async () => {
    // Jeśli uczestnik dołączył do gry, usuń go przed wyjściem
    if (gameId && participantId) {
      try {
        await leaveGameAsParticipant(gameId, participantId);
      } catch (err) {
        console.error("Error leaving game:", err);
      }
    }
    router.push('/gra/');
  };

  // Widok oczekiwania
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
          <h1 className="join-title">Dołącz jako uczestnik</h1>
        </div>
        
        <div className="join-content">
          <form onSubmit={handleJoinGame} className="join-form">
            <div className="form-group">
              <label htmlFor="gameCode">
                Wpisz kod gry
                {gameCodeError && <span style={{ color: 'red', marginLeft: '8px' }}>({gameCodeError})</span>}
              </label>
              <input
                id="gameCode"
                type="text"
                className="form-input code-input"
                style={gameCodeError ? { borderColor: 'red', borderWidth: '2px' } : {}}
                value={gameCode}
                onChange={(e) => handleGameCodeChange(e.target.value)}
                placeholder="np. A7K2"
                maxLength={4}
                disabled={isJoining}
              />
            </div>

            <div className="form-group">
              <label htmlFor="participantName">
                Twoje imię
                {participantNameError && <span style={{ color: 'red', marginLeft: '8px' }}>({participantNameError})</span>}
              </label>
              <input
                id="participantName"
                type="text"
                className="form-input"
                style={participantNameError ? { borderColor: 'red', borderWidth: '2px' } : {}}
                value={participantName}
                onChange={(e) => {
                  setParticipantName(e.target.value);
                  setParticipantNameError("");
                }}
                placeholder="np. Jan Kowalski"
                maxLength={30}
                disabled={isJoining}
              />
            </div>

            <div className="form-group">
              <label htmlFor="teamSelect">
                Wybierz drużynę
                {teamError && <span style={{ color: 'red', marginLeft: '8px' }}>({teamError})</span>}
              </label>
              
              {isLoadingTeams ? (
                <div className="loading-teams">Ładowanie drużyn...</div>
              ) : (
                <div className="teams-selection">
                  {/* Drużyna 1 */}
                  <div 
                    className={`team-box ${availableTeams.length >= 1 ? 'active' : 'waiting'} ${selectedTeam === availableTeams[0]?.id ? 'selected' : ''}`}
                    onClick={() => {
                      if (availableTeams.length >= 1) {
                        setSelectedTeam(availableTeams[0].id);
                        setTeamError("");
                      }
                    }}
                  >
                    {availableTeams.length >= 1 ? (
                      <>
                        <PiUsersThree className="team-icon active" />
                        <span className="team-name">{availableTeams[0]?.name}</span>
                      </>
                    ) : (
                      <>
                        <PiUsers className="team-icon waiting" />
                        <span className="team-name waiting">Oczekiwanie na kapitana...</span>
                      </>
                    )}
                  </div>
                  
                  {/* Drużyna 2 */}
                  <div 
                    className={`team-box ${availableTeams.length >= 2 ? 'active' : 'waiting'} ${selectedTeam === availableTeams[1]?.id ? 'selected' : ''}`}
                    onClick={() => {
                      if (availableTeams.length >= 2) {
                        setSelectedTeam(availableTeams[1].id);
                        setTeamError("");
                      }
                    }}
                  >
                    {availableTeams.length >= 2 ? (
                      <>
                        <PiUsersThree className="team-icon active" />
                        <span className="team-name">{availableTeams[1]?.name}</span>
                      </>
                    ) : (
                      <>
                        <PiUsers className="team-icon waiting" />
                        <span className="team-name waiting">Oczekiwanie na kapitana...</span>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="form-actions">
              <button 
                type="submit" 
                className="btn-join"
                disabled={isJoining || !participantName.trim() || !selectedTeam}
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
