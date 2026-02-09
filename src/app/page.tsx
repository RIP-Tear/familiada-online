"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PiGameControllerFill, PiUsersThreeFill, PiLightningFill, PiTrophyFill, PiArrowRightBold, PiSparkle, PiStarFill } from "react-icons/pi";
import Script from "next/script";
import "../styles/landing.scss";

const Page = () => {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState({});

  // Set dynamic meta tags
  useEffect(() => {
    document.title = "Familiada Online - Gra Familijna Za Darmo | Multiplayer Po Polsku";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Familiada gra online za darmo! Multiplayer po polsku z własnymi pytaniami. Graj na telefon lub komputer. Tablica online jak w teleturnieju!');
    }
  }, []);

  // Structured data FAQ dla lepszego SEO
  const faqStructuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Jak grać w Familiadę online?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Wybierz tryb gry: stwórz grę jako prowadzący lub dołącz do istniejącej rozgrywki. Dwie drużyny rywalizują odpowiadając na pytania ankietowe. Celem jest zgadnięcie najpopularniejszych odpowiedzi."
        }
      },
      {
        "@type": "Question",
        "name": "Czy Familiada online jest darmowa?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Tak, Familiada online jest całkowicie darmowa i za darmo. Możesz grać bez żadnych opłat z przyjaciółmi w trybie multiplayer. Nie musisz niczego pobierać - graj bezpośrednio w przeglądarce!"
        }
      },
      {
        "@type": "Question",
        "name": "Czy mogę grać w Familiadę na telefonie?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Tak! Familiada online działa na telefonie, tablecie i komputerze. Gra jest w pełni responsywna i dostosowana do urządzeń mobilnych. Wystarczy przeglądarka - bez pobierania aplikacji."
        }
      },
      {
        "@type": "Question",
        "name": "Czy mogę dodać własne pytania do Familiady?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Tak! Jako prowadzący możesz tworzyć własne kategorie i pytania. To pozwala dostosować grę do Twojej grupy, imprezy lub wydarzenia. Możesz też używać gotowych zestawów pytań."
        }
      },
      {
        "@type": "Question",
        "name": "Ile osób może grać w Familiadę online?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "W Familiadzie online grają dwie drużyny. Każda drużyna może składać się z dowolnej liczby graczy. Dodatkowo potrzebny jest jeden prowadzący. To idealna gra familijna!"
        }
      },
      {
        "@type": "Question",
        "name": "Czy Familiada online ma tryb multiplayer?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Tak! Familiada online jest grą multiplayer. Grasz online z przyjaciółmi w czasie rzeczywistym. Prowadzący tworzy pokój, a gracze dołączają przez kod gry."
        }
      },
      {
        "@type": "Question",
        "name": "Czy Familiada online jest po polsku?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Tak, Familiada online jest w 100% po polsku. Interfejs, pytania i cała gra są w języku polskim. To polska gra stworzona dla polskich graczy!"
        }
      },
      {
        "@type": "Question",
        "name": "Czy potrzebuję rejestracji aby grać?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Nie, nie potrzebujesz rejestracji. Wystarczy że prowadzący stworzy grę i poda kod innym graczom, którzy mogą od razu dołączyć. Szybki start bez zbędnych formularzy!"
        }
      },
      {
        "@type": "Question",
        "name": "Czy muszę coś pobierać aby grać w Familiadę?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Nie! Familiada online działa bezpośrednio w przeglądarce. Nie musisz nic pobierać ani instalować. Wystarczy wejść na stronę i rozpocząć grę."
        }
      }
    ]
  };

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
    router.push('/gra/');
  };

  return (
    <div className="landing-page">
      {/* FAQ Structured Data */}
      <Script
        id="faq-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqStructuredData) }}
      />
      
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-background"></div>
        <div className="hero-content">
          <div className="hero-badge">
            <PiSparkle /> Teleturniej online <PiSparkle />
          </div>
          <h1 className="hero-title">
            <span className="title-word">FAMILIADA</span>
            <span className="title-subtitle">Online za darmo!</span>
          </h1>
          <p className="hero-description">
            Gra familijna online multiplayer po polsku! Przenieś legendarny teleturniej do swojego domu. 
            Rywalizuj z przyjaciółmi na telefon lub komputer, dodawaj własne pytania i korzystaj z tablicy online.
            Bez pobierania - zacznij grać natychmiast!
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
                Jako prowadzący kliknij "Rozpocznij grę" i otrzymaj
                unikalny kod, który przekażesz drużynom do dołączenia.
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

      {/* Custom Categories Section */}
      <section className="custom-categories-section">
        <div className={`section-header animate-on-scroll ${isVisible['custom-header'] ? 'visible' : ''}`} id="custom-header">
          <span className="section-badge">
            <PiSparkle /> Twoja gra, Twoje pytania <PiSparkle />
          </span>
          <h2 className="section-title-landing">Twórz własne kategorie</h2>
          <p className="section-subtitle">
            Spersonalizuj swoją rozgrywkę! Jako prowadzący możesz stworzyć unikalne kategorie 
            pytań dostosowane do zainteresowań Twoich graczy.
          </p>
        </div>

        <div className="custom-categories-content">
          <div className={`custom-feature animate-on-scroll ${isVisible['custom-1'] ? 'visible' : ''}`} id="custom-1">
            <div className="custom-icon">
              <div className="icon-wrapper create">
                <PiGameControllerFill />
              </div>
            </div>
            <div className="custom-text">
              <h3 className="custom-title">Pełna kontrola nad pytaniami</h3>
              <p className="custom-description">
                Twórz własne pytania z odpowiedziami dopasowanymi do Twojej grupy. 
                Każda kategoria zawiera 5 pytań, a każde pytanie może mieć od 3 do 10 odpowiedzi.
                Określasz kolejność odpowiedzi, która wpływa na punktację!
              </p>
            </div>
          </div>

          <div className={`custom-feature animate-on-scroll ${isVisible['custom-2'] ? 'visible' : ''}`} id="custom-2">
            <div className="custom-icon">
              <div className="icon-wrapper difficulty">
                <PiStarFill />
              </div>
            </div>
            <div className="custom-text">
              <h3 className="custom-title">Wybierz poziom trudności</h3>
              <p className="custom-description">
                Oznacz swoją kategorię jako łatwą (⭐), średnią (⭐⭐) lub trudną (⭐⭐⭐). 
                To pomaga graczom wybrać odpowiedni poziom wyzwania i dodaje strategiczny element 
                do głosowania na kategorie.
              </p>
            </div>
          </div>

          <div className={`custom-feature animate-on-scroll ${isVisible['custom-3'] ? 'visible' : ''}`} id="custom-3">
            <div className="custom-icon">
              <div className="icon-wrapper timing">
                <PiLightningFill />
              </div>
            </div>
            <div className="custom-text">
              <h3 className="custom-title">Twórz w dowolnym momencie</h3>
              <p className="custom-description">
                Kategorie możesz tworzyć w poczekalni przed rozpoczęciem gry lub nawet podczas 
                głosowania drużyn. Edytuj swoje kategorie w każdej chwili, aby dostosować 
                pytania do sytuacji lub poprawić szczegóły.
              </p>
            </div>
          </div>

          <div className={`custom-feature animate-on-scroll ${isVisible['custom-4'] ? 'visible' : ''}`} id="custom-4">
            <div className="custom-icon">
              <div className="icon-wrapper drag">
                <PiUsersThreeFill />
              </div>
            </div>
            <div className="custom-text">
              <h3 className="custom-title">Unikalne dla Twojej grupy</h3>
              <p className="custom-description">
                Stworzone kategorie są dostępne tylko w Twojej grze - nie są publikowane publicznie. 
                To idealne rozwiązanie do tworzenia pytań nawiązujących do wspólnych wspomnień, 
                wewnętrznych żartów czy specyficznych zainteresowań Twojej grupy!
              </p>
            </div>
          </div>
        </div>

        <div className={`custom-note animate-on-scroll ${isVisible['custom-note'] ? 'visible' : ''}`} id="custom-note">
          <div className="note-box">
            <PiSparkle className="note-icon" />
            <p className="note-text">
              <strong>Wskazówka:</strong> Najlepsze kategorie to te, które znają wszyscy gracze! 
              Twórz pytania dopasowane do zainteresowań Twojej grupy - od memów po wspólne 
              doświadczenia. Pamiętaj, że kolejność odpowiedzi określa punktację (pierwsza = 100 pkt).
            </p>
          </div>
        </div>
      </section>

      {/* Security & Privacy Section */}
      <section className="security-section">
        <div className={`section-header animate-on-scroll ${isVisible['security-header'] ? 'visible' : ''}`} id="security-header">
          <span className="section-badge">
            🔒 Bezpieczeństwo i Prywatność
          </span>
          <h2 className="section-title-landing">Twoje dane są bezpieczne</h2>
          <p className="section-subtitle">
            Zapewniamy pełne bezpieczeństwo i ochronę prywatności podczas rozgrywki
          </p>
        </div>

        <div className="security-features">
          <div className={`security-card animate-on-scroll ${isVisible['security-1'] ? 'visible' : ''}`} id="security-1">
            <div className="security-icon ssl">
              <span className="icon-emoji">🔒</span>
            </div>
            <h3 className="security-title">Szyfrowane połączenie</h3>
            <p className="security-description">
              Cała komunikacja jest chroniona certyfikatem SSL/HTTPS. 
              Twoje dane są bezpiecznie przesyłane w zaszyfrowanej formie.
            </p>
            <div className="security-badge">
              <span className="badge-text">SSL Secured</span>
            </div>
          </div>

          <div className={`security-card animate-on-scroll ${isVisible['security-2'] ? 'visible' : ''}`} id="security-2">
            <div className="security-icon privacy">
              <span className="icon-emoji">🛡️</span>
            </div>
            <h3 className="security-title">Zero danych osobowych</h3>
            <p className="security-description">
              Nie zbieramy żadnych danych osobowych. Nie wymagamy rejestracji, 
              adresu email ani numerów telefonu. Grasz anonimowo!
            </p>
            <div className="security-badge">
              <span className="badge-text">Privacy First</span>
            </div>
          </div>

          <div className={`security-card animate-on-scroll ${isVisible['security-3'] ? 'visible' : ''}`} id="security-3">
            <div className="security-icon cloud">
              <span className="icon-emoji">☁️</span>
            </div>
            <h3 className="security-title">Google Cloud Platform</h3>
            <p className="security-description">
              Dane gier przechowywane są w Firebase (Google Cloud), 
              na infrastrukturze o najwyższych standardach bezpieczeństwa.
            </p>
            <div className="security-badge">
              <span className="badge-text">Firebase Secure</span>
            </div>
          </div>

          <div className={`security-card animate-on-scroll ${isVisible['security-4'] ? 'visible' : ''}`} id="security-4">
            <div className="security-icon ads">
              <span className="icon-emoji">⚡</span>
            </div>
            <h3 className="security-title">Szybka i stabilna rozgrywka</h3>
            <p className="security-description">
              Nowoczesna infrastruktura zapewnia płynną synchronizację 
              w czasie rzeczywistym. Graj bez opóźnień i zawieszek!
            </p>
            <div className="security-badge">
              <span className="badge-text">Real-time Sync</span>
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

      {/* SEO Section */}
      <section className="seo-section">
        <div className={`section-header animate-on-scroll ${isVisible['seo-header'] ? 'visible' : ''}`} id="seo-header">
          <span className="section-badge">
            🎮 Familiada Online
          </span>
          <h2 className="section-title-landing">Gra Familijna Multiplayer Po Polsku</h2>
        </div>
        
        <div className={`seo-content animate-on-scroll ${isVisible['seo-content'] ? 'visible' : ''}`} id="seo-content">
          <div className="seo-text">
            <p>
              <strong>Familiada online</strong> to popularna <strong>gra familijna</strong>, która pozwala Ci cieszyć się kultowym teleturniejem 
              bez wychodzenia z domu! Nasza <strong>gra online za darmo</strong> działa w trybie <strong>multiplayer</strong>, 
              co oznacza, że możesz grać z przyjaciółmi w czasie rzeczywistym.
            </p>
            <p>
              <strong>Familiada gra online</strong> jest dostępna <strong>po polsku</strong> i działa na każdym urządzeniu - 
              możesz grać <strong>na telefon</strong>, tablet lub komputer. Nie musisz nic pobierać - wystarczy przeglądarka!
              Nasza <strong>tablica online</strong> wygląda dokładnie jak w prawdziwym teleturnieju.
            </p>
            <p>
              Jedną z najlepszych funkcji jest możliwość tworzenia <strong>własnych pytań</strong>. Jako prowadzący możesz 
              przygotować pytania dopasowane do Twojej grupy, co sprawia, że <strong>familiada w domu</strong> jest jeszcze 
              bardziej osobista i zabawna. To idealna <strong>gra online</strong> na imprezę lub spotkanie rodzinne!
            </p>
            <p>
              <strong>Gra familiada online</strong> nie wymaga rejestracji ani pobierania. Po prostu wejdź na stronę, 
              stwórz pokój jako prowadzący i podziel się kodem z innymi graczami. To naprawdę tak proste!
              <strong>Familiada gra za darmo</strong> - bez ukrytych opłat i bez ograniczeń czasowych.
            </p>
            <p>
              Zapraszamy do rozgrywki! Wypróbuj najlepszą polską <strong>grę familijną online</strong> i przekonaj się, 
              dlaczego tysiące graczy wybrało naszą <strong>familiadę online</strong>. Rozpocznij grę już teraz i baw się świetnie!
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-main">
            <p className="footer-copyright">
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
          
          <div className="footer-links">
            <a href="/polityka-prywatnosci/" className="footer-nav-link">
              Polityka Prywatności
            </a>
            <span className="footer-separator">•</span>
            <a href="/zasady/" className="footer-nav-link">
              Zasady Gry
            </a>
            <span className="footer-separator">•</span>
            <a href="mailto:service@rip-tear.com" className="footer-nav-link">
              Kontakt
            </a>
          </div>
          
          <div className="footer-security-badges">
            <div className="footer-badge">
              <span>🔒 SSL Secured</span>
            </div>
            <div className="footer-badge">
              <span>🛡️ Privacy Protected</span>
            </div>
            <div className="footer-badge">
              <span>⚡ Real-time Sync</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Page;

