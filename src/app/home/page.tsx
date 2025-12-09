"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { setMode, leaveGame } from "@/redux/reducer/gameSlice";
import { PiGameControllerFill, PiUsersFill, PiBookOpenFill } from "react-icons/pi";
import "./home.scss";

export default function Home() {
  const router = useRouter();
  const dispatch = useDispatch();

  // Wyczyść cache gry za każdym razem gdy użytkownik wejdzie na stronę główną
  useEffect(() => {
    dispatch(leaveGame());
    console.log("[HOME] Game cache cleared");
  }, [dispatch]);

  const handleCreateGame = () => {
    dispatch(setMode('host'));
    router.push('/host');
  };

  const handleJoinGame = () => {
    dispatch(setMode('player'));
    router.push('/join');
  };

  const handleRules = () => {
    router.push('/rules');
  };

  return (
    <div className="home-container">
      <div className="home-content">
        <h1 className="home-title">FAMILIADA</h1>
        <p className="home-subtitle">Wybierz tryb gry</p>
        
        <div className="button-container">
          <button 
            className="mode-button host-button"
            onClick={handleCreateGame}
          >
            <div className="button-icon"><PiGameControllerFill size={48} /></div>
            <div className="button-text">
              <h2>Stwórz grę</h2>
              <p>jako prowadzący</p>
            </div>
          </button>

          <button 
            className="mode-button player-button"
            onClick={handleJoinGame}
          >
            <div className="button-icon"><PiUsersFill size={48} /></div>
            <div className="button-text">
              <h2>Dołącz do gry</h2>
              <p>jako drużyna</p>
            </div>
          </button>

          <button 
            className="mode-button rules-button"
            onClick={handleRules}
          >
            <div className="button-icon"><PiBookOpenFill size={48} /></div>
            <div className="button-text">
              <h2>Instrukcja gry</h2>
              <p>zasady i poradnik</p>
            </div>
          </button>
        </div>

        <div className="home-footer">
          <p>
            © 2025 Familiada. Gra stworzona przez{" "}
            <a 
              href="https://www.rip-tear.com/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="footer-link"
            >
              <img 
                src="https://www.rip-tear.com/favicon.ico" 
                alt="RIP & Tear" 
                className="footer-icon"
              />
              RIP & Tear
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
