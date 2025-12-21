"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { PiArrowLeftBold, PiShieldCheckFill, PiLockKeyFill, PiDatabaseFill, PiUserFill } from "react-icons/pi";
import "./privacy.scss";

export default function PrivacyPolicyPage() {
  const router = useRouter();

  useEffect(() => {
    document.title = "Polityka Prywatności | Familiada Online";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Polityka prywatności Familiada Online. Dowiedz się jak dbamy o bezpieczeństwo Twoich danych i jakie informacje zbieramy podczas rozgrywki.');
    }
  }, []);

  return (
    <div className="privacy-container">
      <div className="privacy-content">
        <button className="btn-back" onClick={() => router.back()}>
          <PiArrowLeftBold /> Powrót
        </button>

        <h1 className="privacy-title">POLITYKA PRYWATNOŚCI</h1>
        <p className="privacy-update">Ostatnia aktualizacja: 21 grudnia 2025</p>

        {/* WPROWADZENIE */}
        <section className="privacy-section">
          <div className="section-icon-header">
            <PiShieldCheckFill className="section-icon" />
            <h2 className="section-title">Wprowadzenie</h2>
          </div>
          <div className="privacy-text">
            <p>
              Witamy w <strong>Familiada Online</strong> (dostępnej pod adresem <a href="https://www.familiada-online.pl" target="_blank" rel="noopener noreferrer">www.familiada-online.pl</a>). 
              Szanujemy Twoją prywatność i zobowiązujemy się do jej ochrony. Niniejsza Polityka Prywatności wyjaśnia, 
              jakie dane zbieramy (lub raczej NIE zbieramy), jak je wykorzystujemy i jakie masz prawa.
            </p>
            <div className="highlight-box success">
              <p><strong>Najważniejsze:</strong> Nie zbieramy żadnych danych osobowych. Nie wymagamy rejestracji, 
              adresu email, numeru telefonu ani żadnych innych danych identyfikujących użytkownika.</p>
            </div>
          </div>
        </section>

        {/* DANE KTÓRE ZBIERAMY */}
        <section className="privacy-section">
          <div className="section-icon-header">
            <PiDatabaseFill className="section-icon" />
            <h2 className="section-title">Jakie dane zbieramy?</h2>
          </div>
          <div className="privacy-text">
            <h3>1. Dane gry (minimalne, anonimowe)</h3>
            <p>W celu umożliwienia rozgrywki online przechowujemy następujące dane:</p>
            <ul>
              <li><strong>Kod gry</strong> - losowo wygenerowany identyfikator sesji (np. A7K2)</li>
              <li><strong>Nazwy drużyn</strong> - nazwy podane przez graczy (możesz użyć dowolnej nazwy, nawet wymyślonej)</li>
              <li><strong>Wyniki gry</strong> - punkty zebrane podczas rozgrywki</li>
              <li><strong>Własne kategorie pytań</strong> - jeśli prowadzący zdecyduje się je stworzyć</li>
            </ul>
            
            <div className="info-box">
              <p><strong>Ważne:</strong> Wszystkie powyższe dane są:</p>
              <ul>
                <li>✅ Całkowicie <strong>anonimowe</strong> - nie są powiązane z żadną osobą fizyczną</li>
                <li>✅ <strong>Tymczasowe</strong> - dane gry są usuwane po zakończeniu sesji lub po określonym czasie nieaktywności</li>
                <li>✅ <strong>Opcjonalne</strong> - możesz używać fikcyjnych nazw drużyn</li>
              </ul>
            </div>

            <h3>2. Google Search Console (dane analityczne)</h3>
            <p>Strona jest podłączona do <strong>Google Search Console</strong>, który zbiera anonimowe dane statystyczne:</p>
            <ul>
              <li>Liczba wyświetleń strony w wynikach wyszukiwania Google</li>
              <li>Liczba kliknięć w wyniki wyszukiwania</li>
              <li>Zapytania wyszukiwania, które doprowadziły użytkowników do strony</li>
              <li>Podstawowe dane techniczne o wydajności strony</li>
            </ul>
            <p><strong>Te dane są zbierane w formie zagregowanej i anonimowej - nie identyfikują konkretnych użytkowników.</strong> Wykorzystujemy je wyłącznie do poprawy widoczności strony w wyszukiwarkach i optymalizacji treści.</p>

            <h3>3. Czego NIE zbieramy?</h3>
            <div className="highlight-box warning">
              <p><strong>Nie zbieramy:</strong></p>
              <ul>
                <li>❌ Danych osobowych (imię, nazwisko, adres)</li>
                <li>❌ Adresu email</li>
                <li>❌ Numeru telefonu</li>
                <li>❌ Danych z mediów społecznościowych</li>
                <li>❌ Informacji o lokalizacji (poza podstawowym adresem IP)</li>
                <li>❌ Danych z ciasteczek reklamowych lub śledzących</li>
              </ul>
            </div>
          </div>
        </section>

        {/* JAK WYKORZYSTUJEMY DANE */}
        <section className="privacy-section">
          <div className="section-icon-header">
            <PiLockKeyFill className="section-icon" />
            <h2 className="section-title">Jak wykorzystujemy zebrane dane?</h2>
          </div>
          <div className="privacy-text">
            <p>Minimalne dane, które zbieramy, wykorzystujemy wyłącznie do:</p>
            <ul>
              <li><strong>Umożliwienia rozgrywki</strong> - synchronizacja gry między graczami w czasie rzeczywistym</li>
              <li><strong>Przechowywania historii gier</strong> - lokalnie w przeglądarce prowadzącego (opcjonalnie)</li>
              <li><strong>Zapewnienia bezpieczeństwa</strong> - ochrona przed nadużyciami i atakami</li>
              <li><strong>Poprawy funkcjonalności</strong> - wykrywanie i naprawa błędów technicznych</li>
            </ul>
            
            <div className="info-box">
              <p><strong>Nie wykorzystujemy danych do:</strong></p>
              <ul>
                <li>❌ Wyświetlania reklam</li>
                <li>❌ Sprzedaży danych firmom trzecim</li>
                <li>❌ Profilowania użytkowników</li>
                <li>❌ Śledzenia aktywności poza stroną</li>
              </ul>
            </div>
          </div>
        </section>

        {/* PRZECHOWYWANIE DANYCH */}
        <section className="privacy-section">
          <div className="section-icon-header">
            <PiDatabaseFill className="section-icon" />
            <h2 className="section-title">Gdzie i jak długo przechowujemy dane?</h2>
          </div>
          <div className="privacy-text">
            <h3>Baza danych Firebase (Google Cloud)</h3>
            <p>
              Dane gier są przechowywane w <strong>Firebase Realtime Database</strong>, która jest częścią 
              Google Cloud Platform. Firebase spełnia najwyższe standardy bezpieczeństwa i jest zgodny 
              z RODO (GDPR).
            </p>
            
            <h3>Czas przechowywania</h3>
            <ul>
              <li><strong>Aktywne gry</strong> - dane są przechowywane przez czas trwania sesji gry</li>
              <li><strong>Historia gier</strong> - przechowywana lokalnie w przeglądarce prowadzącego (localStorage)</li>
              <li><strong>Nieaktywne sesje</strong> - automatycznie usuwane po 7 dniach nieaktywności</li>
            </ul>

            <h3>Szyfrowanie</h3>
            <p>
              Wszystkie dane przesyłane między Twoją przeglądarką a serwerami są chronione 
              <strong> certyfikatem SSL/HTTPS</strong>, co oznacza pełne szyfrowanie komunikacji.
            </p>
          </div>
        </section>

        {/* UDOSTĘPNIANIE DANYCH */}
        <section className="privacy-section">
          <div className="section-icon-header">
            <PiUserFill className="section-icon" />
            <h2 className="section-title">Czy udostępniamy dane osobom trzecim?</h2>
          </div>
          <div className="privacy-text">
            <p><strong>Nie.</strong> Nie sprzedajemy, nie wynajmujemy ani nie udostępniamy żadnych danych osobowych osobom trzecim.</p>
            
            <p>Jedynymi "stronami trzecimi" są:</p>
            <ul>
              <li><strong>Google Firebase</strong> - jako dostawca infrastruktury chmurowej (zgodny z RODO)</li>
              <li><strong>Hosting</strong> - dostawca usług hostingowych dla strony internetowej</li>
            </ul>
            
            <p>Wszystkie te usługi działają wyłącznie jako procesorzy danych i są zobowiązane do zachowania poufności.</p>
          </div>
        </section>

        {/* TWOJE PRAWA */}
        <section className="privacy-section">
          <div className="section-icon-header">
            <PiShieldCheckFill className="section-icon" />
            <h2 className="section-title">Twoje prawa (RODO)</h2>
          </div>
          <div className="privacy-text">
            <p>Zgodnie z RODO (Ogólne Rozporządzenie o Ochronie Danych) masz prawo do:</p>
            <ul>
              <li><strong>Dostępu do danych</strong> - możesz zapytać, jakie dane o Tobie przechowujemy</li>
              <li><strong>Usunięcia danych</strong> - możesz poprosić o usunięcie danych (choć zbieramy ich minimalną ilość)</li>
              <li><strong>Sprostowania danych</strong> - możesz poprosić o korektę nieprawidłowych danych</li>
              <li><strong>Ograniczenia przetwarzania</strong> - możesz poprosić o ograniczenie sposobu wykorzystywania danych</li>
            </ul>
            
            <div className="info-box">
              <p>
                <strong>Kontakt w sprawie danych osobowych:</strong><br/>
                Email: <a href="mailto:service@rip-tear.com">service@rip-tear.com</a>
              </p>
            </div>
          </div>
        </section>

        {/* CIASTECZKA */}
        <section className="privacy-section">
          <div className="section-icon-header">
            <PiDatabaseFill className="section-icon" />
            <h2 className="section-title">Ciasteczka (Cookies)</h2>
          </div>
          <div className="privacy-text">
            <p>
              Nasza strona wykorzystuje <strong>minimalne ciasteczka techniczne</strong> niezbędne 
              do działania aplikacji:
            </p>
            <ul>
              <li><strong>localStorage</strong> - do przechowywania historii gier prowadzącego (lokalnie w przeglądarce)</li>
              <li><strong>sessionStorage</strong> - do utrzymania sesji gry</li>
            </ul>
            
            <p><strong>Nie używamy:</strong></p>
            <ul>
              <li>❌ Ciasteczek reklamowych</li>
              <li>❌ Ciasteczek śledzących od firm trzecich</li>
              <li>❌ Analityki marketingowej</li>
            </ul>
          </div>
        </section>

        {/* ZMIANY W POLITYCE */}
        <section className="privacy-section">
          <div className="section-icon-header">
            <PiShieldCheckFill className="section-icon" />
            <h2 className="section-title">Zmiany w Polityce Prywatności</h2>
          </div>
          <div className="privacy-text">
            <p>
              Zastrzegamy sobie prawo do aktualizacji niniejszej Polityki Prywatności. 
              O wszelkich istotnych zmianach poinformujemy poprzez umieszczenie powiadomienia na stronie głównej.
            </p>
            <p>
              Data ostatniej aktualizacji jest zawsze widoczna na górze tego dokumentu.
            </p>
          </div>
        </section>

        {/* KONTAKT */}
        <section className="privacy-section">
          <div className="section-icon-header">
            <PiUserFill className="section-icon" />
            <h2 className="section-title">Kontakt</h2>
          </div>
          <div className="privacy-text">
            <p>Jeśli masz pytania dotyczące tej Polityki Prywatności, skontaktuj się z nami:</p>
            <div className="contact-box">
              <p><strong>Firma:</strong> RIP & Tear</p>
              <p><strong>Email:</strong> <a href="mailto:service@rip-tear.com">service@rip-tear.com</a></p>
              <p><strong>Strona:</strong> <a href="https://www.familiada-online.pl" target="_blank" rel="noopener noreferrer">www.familiada-online.pl</a></p>
            </div>
          </div>
        </section>

        <div className="privacy-footer">
          <button className="btn-back-bottom" onClick={() => router.push('/')}>
            <PiArrowLeftBold /> Powrót do strony głównej
          </button>
        </div>
      </div>
    </div>
  );
}
