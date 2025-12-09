"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PiGameControllerFill, PiUsersThreeFill, PiLightningFill, PiTrophyFill, PiArrowRightBold, PiSparkle, PiStarFill } from "react-icons/pi";
import "../styles/landing.scss";

const Page = () => {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState({});

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible((prev) => ({ ...prev, [entry.target.id]: true }));
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll('.animate-on-scroll').forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const handleStart = () => {
    router.push('/home');
  };

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-background"></div>
        <div className="hero-content">
          <div className="hero-badge">
            <PiSparkle /> Teleturniej online <PiSparkle />
          </div>
          <h1 className="hero-title">
            <span className="title-word">FAMILIADA</span>
            <span className="title-subtitle">Zagraj z przyjaciółmi!</span>
          </h1>
          <p className="hero-description">
            Przenieś legendarny teleturniej do swojego domu! Rywalizuj z przyjaciółmi,
            zdobywaj punkty i sprawdź, kto zna najlepsze odpowiedzi!
          </p>
          <div className="hero-buttons">
            <button className="btn-primary" onClick={handleStart}>
              Rozpocznij grę <PiArrowRightBold />
            </button>
            <button className="btn-secondary" onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}>
              Zobacz więcej
            </button>
          </div>
          <div className="hero-stats">
            <div className="stat-item">
              <PiUsersThreeFill className="stat-icon" />
              <div className="stat-content">
                <span className="stat-number">2 drużyny</span>
                <span className="stat-label">Rozgrywka</span>
              </div>
            </div>
            <div className="stat-item">
              <PiGameControllerFill className="stat-icon" />
              <div className="stat-content">
                <span className="stat-number">5 pytań</span>
                <span className="stat-label">Na rundę</span>
              </div>
            </div>
            <div className="stat-item">
              <PiTrophyFill className="stat-icon" />
              <div className="stat-content">
                <span className="stat-number">∞ kategorii</span>
                <span className="stat-label">Pytań</span>
              </div>
            </div>
          </div>
        </div>
        <div className="hero-image-container">
          <div className="floating-card">
            <div className="game-illustration">
              <div className="game-screen">
                <div className="screen-header">
                  <div className="screen-dot"></div>
                  <div className="screen-dot"></div>
                  <div className="screen-dot"></div>
                </div>
                <div className="screen-content">
                  <div className="game-title-text">FAMILIADA</div>
                  <div className="game-buttons">
                    <div className="game-btn game-btn-1"></div>
                    <div className="game-btn game-btn-2"></div>
                  </div>
                  <div className="game-code">Kod: XXXX</div>
                </div>
              </div>
              <div className="floating-icons">
                <div className="float-icon icon-1">⚡</div>
                <div className="float-icon icon-2">🏆</div>
                <div className="float-icon icon-3">🎮</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features-section">
        <div className="section-header animate-on-scroll" id="features-header">
          <span className="section-badge">
            <PiStarFill /> Funkcje <PiStarFill />
          </span>
          <h2 className="section-title-landing">Wszystko, czego potrzebujesz</h2>
          <p className="section-description">
            Profesjonalna platforma do rozgrywek online z pełną funkcjonalnością
          </p>
        </div>

        <div className="features-grid">
          <div className={`feature-card animate-on-scroll ${isVisible['feature-1'] ? 'visible' : ''}`} id="feature-1">
            <div className="feature-icon buzz">
              <PiLightningFill />
            </div>
            <h3 className="feature-title">System Buzzerów</h3>
            <p className="feature-description">
              Szybka reakcja decyduje! Pierwszy, który wciśnie buzzer, zdobywa prawo
              do odpowiedzi i może rozpocząć walkę o punkty dla swojej drużyny.
            </p>
            <div className="feature-image">
              <div className="buzzer-illustration">
                <div className="buzzer-container">
                  <div className="buzzer-button buzzer-pulse">
                    <div className="buzzer-inner">
                      <PiLightningFill className="buzzer-icon" />
                      <span className="buzzer-text">NACIŚNIJ!</span>
                    </div>
                  </div>
                  <div className="buzzer-waves">
                    <div className="wave wave-1"></div>
                    <div className="wave wave-2"></div>
                    <div className="wave wave-3"></div>
                  </div>
                </div>
                <div className="buzzer-result">PIERWSZY! 🎯</div>
              </div>
            </div>
          </div>

          <div className={`feature-card animate-on-scroll ${isVisible['feature-2'] ? 'visible' : ''}`} id="feature-2">
            <div className="feature-icon categories">
              <PiGameControllerFill />
            </div>
            <h3 className="feature-title">Różne Kategorie</h3>
            <p className="feature-description">
              Od przysłów szkolnych po popkulturę - wybierz kategorię, która
              najbardziej Ci odpowiada. Każda runda to nowa przygoda!
            </p>
            <div className="feature-image">
              <div className="categories-illustration">
                <div className="category-card-demo card-easy">
                  <div className="card-stars">⭐</div>
                  <div className="card-name">Łatwe</div>
                </div>
                <div className="category-card-demo card-medium">
                  <div className="card-stars">⭐⭐</div>
                  <div className="card-name">Średnie</div>
                </div>
                <div className="category-card-demo card-hard">
                  <div className="card-stars">⭐⭐⭐</div>
                  <div className="card-name">Trudne</div>
                </div>
              </div>
            </div>
          </div>

          <div className={`feature-card animate-on-scroll ${isVisible['feature-3'] ? 'visible' : ''}`} id="feature-3">
            <div className="feature-icon multiplayer">
              <PiUsersThreeFill />
            </div>
            <h3 className="feature-title">Tryb Multiplayer</h3>
            <p className="feature-description">
              Graj z przyjaciółmi w czasie rzeczywistym! Synchronizacja na żywo
              zapewnia płynną rozgrywkę dla wszystkich uczestników.
            </p>
            <div className="feature-image">
              <div className="multiplayer-illustration">
                <div className="players-container">
                  <div className="player-group team-1">
                    <div className="player-avatar">👤</div>
                    <div className="player-avatar">👤</div>
                    <div className="team-label">Drużyna A</div>
                  </div>
                  <div className="vs-badge">VS</div>
                  <div className="player-group team-2">
                    <div className="player-avatar">👤</div>
                    <div className="player-avatar">👤</div>
                    <div className="team-label">Drużyna B</div>
                  </div>
                </div>
                <div className="sync-indicator">
                  <div className="sync-dot"></div>
                  <span className="sync-text">Synchronizacja live</span>
                </div>
              </div>
            </div>
          </div>

          <div className={`feature-card animate-on-scroll ${isVisible['feature-4'] ? 'visible' : ''}`} id="feature-4">
            <div className="feature-icon scoring">
              <PiTrophyFill />
            </div>
            <h3 className="feature-title">Tablica Wyników</h3>
            <p className="feature-description">
              Profesjonalna tablica z efektami wizualnymi! Odkrywaj odpowiedzi,
              zbieraj punkty i obserwuj, jak rośnie wynik Twojej drużyny.
            </p>
            <div className="feature-image">
              <div className="board-illustration">
                <div className="board-question">Podaj odpowiedź na pytanie</div>
                <div className="board-answers">
                  <div className="board-answer revealed">
                    <span className="answer-num">1</span>
                    <span className="answer-txt">Długopis</span>
                    <span className="answer-pts">200</span>
                  </div>
                  <div className="board-answer">
                    <span className="answer-num">2</span>
                  </div>
                  <div className="board-answer">
                    <span className="answer-num">3</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works-section">
        <div className="section-header animate-on-scroll" id="how-header">
          <span className="section-badge">
            <PiArrowRightBold /> Jak to działa? <PiArrowRightBold />
          </span>
          <h2 className="section-title-landing">Rozpocznij w 3 krokach</h2>
        </div>

        <div className="steps-container">
          <div className={`step-card animate-on-scroll ${isVisible['step-1'] ? 'visible' : ''}`} id="step-1">
            <div className="step-number">1</div>
            <div className="step-content">
              <h3 className="step-title">Utwórz pokój</h3>
              <p className="step-description">
                Kliknij "Rozpocznij grę", wybierz tryb Demo lub Firebase i otrzymaj
                unikalny kod gry do udostępnienia znajomym.
              </p>
            </div>
          </div>

          <div className="step-arrow">→</div>

          <div className={`step-card animate-on-scroll ${isVisible['step-2'] ? 'visible' : ''}`} id="step-2">
            <div className="step-number">2</div>
            <div className="step-content">
              <h3 className="step-title">Zapros graczy</h3>
              <p className="step-description">
                Twoi znajomi dołączają przez kod, dzielą się na dwie drużyny
                i gotowi są do rywalizacji!
              </p>
            </div>
          </div>

          <div className="step-arrow">→</div>

          <div className={`step-card animate-on-scroll ${isVisible['step-3'] ? 'visible' : ''}`} id="step-3">
            <div className="step-number">3</div>
            <div className="step-content">
              <h3 className="step-title">Zacznij grać!</h3>
              <p className="step-description">
                Wybierz kategorię, wciskaj buzzery, odkrywaj odpowiedzi
                i walcz o zwycięstwo w emocjonującej rozgrywce!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Extra Features Section */}
      <section className="extra-section">
        <div className="extra-content" id="extra">
          <div className="extra-summary">
            <h2 className="summary-title">Gotowy na najlepszą zabawę?</h2>
            <p className="summary-text">
              Familiada online to darmowa platforma, która przeniesie kultowy teleturniej 
              wprost do Twojego domu! Żadnych ukrytych kosztów, żadnych ograniczeń - 
              po prostu czysta, emocjonująca rozgrywka z przyjaciółmi!
            </p>
            <button className="btn-primary btn-large btn-full-width" onClick={handleStart}>
              Rozpocznij grę za darmo <PiArrowRightBold />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
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
      </footer>
    </div>
  );
};

export default Page;

