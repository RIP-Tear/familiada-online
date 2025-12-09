"use client";
import { useRouter } from "next/navigation";
import { PiArrowLeftBold, PiGameControllerFill, PiUsersFill, PiLightningFill, PiTrophyFill, PiXCircleFill, PiCheckCircleFill } from "react-icons/pi";
import "./rules.scss";

export default function RulesPage() {
  const router = useRouter();

  return (
    <div className="rules-container">
      <div className="rules-content">
        <button className="btn-back" onClick={() => router.push('/home')}>
          <PiArrowLeftBold /> Powrót
        </button>

        <h1 className="rules-title">INSTRUKCJA GRY</h1>

        {/* OGÓLNE ZASADY GRY */}
        <section className="rules-section">
          <h2 className="section-title"><PiGameControllerFill /> Ogólne zasady gry</h2>
          <div className="rules-text">
            <p><strong>Familiada</strong> to gra oparta na popularnym teleturnieju, w której dwie drużyny rywalizują, odpowiadając na pytania ankietowe.</p>
            
            <h3>Przebieg gry:</h3>
            <ol>
              <li><strong>Pytania ankietowe:</strong> Gra składa się z 5 pytań. Każde pytanie ma kilka odpowiedzi.</li>
              <li><strong>Punktacja:</strong> Odpowiedzi są punktowane w malejącej kolejności - pierwsza odpowiedź (najbardziej popularna) daje 100 punktów, druga 90 punktów, trzecia 80 punktów, czwarta 70 punktów itd. Im wyżej odpowiedź na liście, tym więcej punktów!</li>
              <li><strong>Faza buzzera:</strong> Na początku każdej rundy obie drużyny rywalizują o to, kto pierwszy wciśnie buzzer.</li>
              <li><strong>Rozpoczęcie rundy:</strong>
                <ul>
                  <li>Drużyna, która wcisnęła buzzer pierwsza, podaje swoją odpowiedź</li>
                  <li>Jeśli odpowiedź jest <strong>najwyżej punktowana</strong> (pierwsza na liście) - ta drużyna zaczyna grę</li>
                  <li>Jeśli odpowiedź jest poprawna, ale <strong>nie najwyżej punktowana</strong> - pytanie przechodzi do drugiej drużyny</li>
                  <li>Druga drużyna musi podać odpowiedź wyżej punktowaną - jeśli się uda, grają dalej. Jeśli podadzą odpowiedź niżej punktowaną lub błędną, pytanie wraca do pierwszej drużyny</li>
                </ul>
              </li>
              <li><strong>Błędne odpowiedzi:</strong>
                <ul>
                  <li>Grająca drużyna może udzielić maksymalnie <strong>4 błędne odpowiedzi</strong> (wyświetlane jako czerwone X)</li>
                  <li>Po 4 błędach pytanie automatycznie przechodzi do drugiej drużyny</li>
                  <li>Druga drużyna ma <strong>tylko jedną szansę</strong> na odpowiedź:</li>
                  <ul>
                    <li>Jeśli odpowiedzą poprawnie (niezależnie od punktacji) - <strong>wszystkie punkty z rundy przechodzą do nich</strong></li>
                    <li>Jeśli odpowiedzą źle - <strong>wszystkie punkty przechodzą do drużyny, która miała 3 błędy</strong></li>
                  </ul>
                </ul>
              </li>
              <li><strong>Pytanie finałowe:</strong> 5. pytanie jest pytaniem finałowym - wszystkie punkty są podwojone!</li>
              <li><strong>Zwycięzca:</strong> Wygrywa drużyna, która zdobędzie więcej punktów po wszystkich 5 rundach.</li>
            </ol>

            <div className="info-box">
              <PiTrophyFill />
              <p><strong>Pamiętaj:</strong> Gra wymaga minimum 2 drużyn i jednego prowadzącego. Prowadzący kontroluje przebieg gry, a drużyny odpowiadają na pytania.</p>
            </div>
          </div>
        </section>

        {/* INSTRUKCJA DLA PROWADZĄCEGO */}
        <section className="rules-section">
          <h2 className="section-title"><PiGameControllerFill /> Instrukcja dla prowadzącego</h2>
          <div className="rules-text">
            <h3>1. Tworzenie gry</h3>
            <ol>
              <li>Na stronie głównej kliknij <strong>"Stwórz grę jako prowadzący"</strong></li>
              <li>System wygeneruje unikalny <strong>kod gry</strong> (np. A7K2)</li>
              <li>Przekaż ten kod drużynom, aby mogły dołączyć do gry</li>
              <li>Poczekaj, aż obie drużyny się zalogują i podadzą swoje nazwy</li>
              <li>Gdy obie drużyny będą gotowe, kliknij <strong>"Rozpocznij grę"</strong></li>
            </ol>

            <h3>2. Wybór kategorii</h3>
            <ol>
              <li>Po rozpoczęciu gry zobaczysz listę dostępnych kategorii pytań</li>
              <li>Każda kategoria ma oznaczony poziom trudności (gwiazdki)</li>
              <li>Kliknij na wybraną kategorię, aby załadować pytania</li>
            </ol>

            <h3>3. Faza buzzera</h3>
            <ol>
              <li>Po wyborze kategorii wyświetli się pytanie dla prowadzącego</li>
              <li>Przeczytaj pytanie na głos dla drużyn</li>
              <li>Drużyny wciskają swoje buzzery na swoich urządzeniach</li>
              <li>System automatycznie wykryje, która drużyna była pierwsza</li>
              <li>Zobaczysz komunikat: <strong>"Drużyna która wcisneła pierwsza: [Nazwa drużyny]"</strong></li>
              <li>Kliknij <strong>"Rozpocznij tablicę"</strong>, aby przejść do fazy odpowiedzi</li>
            </ol>

            <h3>4. Odkrywanie odpowiedzi</h3>
            <ol>
              <li>Na ekranie pojawi się tablica z ukrytymi odpowiedziami</li>
              <li>Drużyny zgadują odpowiedzi - ty je ujawniasz</li>
              <li>Kliknij na kartę z odpowiedzią, aby ją odkryć (jeśli drużyna udzieliła poprawnej odpowiedzi)</li>
              <li>Punkty za odkrytą odpowiedź są automatycznie dodawane do puli rundowej</li>
            </ol>

            <h3>5. Błędne odpowiedzi i ostrzeżenia</h3>
            <ol>
              <li><PiXCircleFill style={{color: 'var(--burnt-peach)', verticalAlign: 'middle'}} /> <strong>Błędna odpowiedź:</strong> Kliknij ten przycisk, gdy drużyna udzieli złej odpowiedzi lub nie odpowie w czasie. Pojawi się czerwony X.</li>
              <li><strong>Ostrzeżenie:</strong> Włącz 3-sekundowe ostrzeżenie, gdy drużyna zbyt długo zastanawia się nad odpowiedzią. Drużyna ma tylko 3 sekundy na udzielenie odpowiedzi - jeśli czas minie, kliknij przycisk "Błędna odpowiedź".</li>
              <li><strong>Reset błędnych:</strong> Opcja dostępna w nagłych przypadkach, jeśli chcesz cofnąć pomyłkowo dodany błąd.</li>
            </ol>

            <h3>6. Przekazywanie punktów</h3>
            <ol>
              <li>Po zebraniu 5 błędnych odpowiedzi lub odkryciu wszystkich odpowiedzi, przyciski przekazania punktów staną się aktywne</li>
              <li>Kliknij przycisk <strong>"Przekaż punkty - [Nazwa drużyny]"</strong>, aby przyznać punkty zwycięskiej drużynie</li>
              <li>Po przekazaniu punktów wszystkie przyciski kontrolne zostają zablokowane</li>
              <li>Kliknij <strong>"Przejdź do następnego pytania"</strong>, aby kontynuować grę</li>
            </ol>

            <h3>7. Zakończenie gry</h3>
            <ol>
              <li>Po 5 pytaniach gra automatycznie przechodzi do podsumowania</li>
              <li>Zobaczysz wyniki obu drużyn i zwycięzcę</li>
              <li>Możesz rozpocząć nową grę klikając <strong>"Rozpocznij kolejną grę"</strong></li>
            </ol>

            <div className="warning-box">
              <PiXCircleFill />
              <p><strong>Ważne:</strong> Po przekazaniu punktów drużynie nie możesz już odkrywać odpowiedzi ani dodawać błędów. Upewnij się, że przyznałeś punkty właściwej drużynie!</p>
            </div>
          </div>
        </section>

        {/* INSTRUKCJA DLA DRUŻYNY */}
        <section className="rules-section">
          <h2 className="section-title"><PiUsersFill /> Instrukcja dla drużyny</h2>
          <div className="rules-text">
            <h3>1. Dołączanie do gry</h3>
            <ol>
              <li>Na stronie głównej kliknij <strong>"Dołącz do gry jako drużyna"</strong></li>
              <li>Wprowadź <strong>kod gry</strong> otrzymany od prowadzącego (np. A7K2)</li>
              <li>Wpisz <strong>nazwę swojej drużyny</strong></li>
              <li>Kliknij <strong>"Dołącz do gry"</strong></li>
              <li>Poczekaj, aż prowadzący rozpocznie grę</li>
            </ol>

            <h3>2. Ekran oczekiwania</h3>
            <ol>
              <li>Po dołączeniu zobaczysz ekran oczekiwania</li>
              <li>Zobaczysz listę drużyn, które już dołączyły</li>
              <li>Poczekaj, aż prowadzący wybierze kategorię i rozpocznie rundę</li>
            </ol>

            <h3>3. Faza buzzera</h3>
            <ol>
              <li>Prowadzący przeczyta pytanie na głos</li>
              <li>Na waszym ekranie pojawi się duży przycisk <strong>"NACIŚNIJ!"</strong></li>
              <li><PiLightningFill style={{color: 'var(--jasmine)', verticalAlign: 'middle'}} /> Kliknij go jak najszybciej, aby być pierwszym!</li>
              <li>System automatycznie wykryje, która drużyna była pierwsza</li>
              <li>Zobaczysz komunikat: <strong>"Drużyna która wcisneła pierwsza: [Nazwa drużyny]"</strong></li>
            </ol>

            <h3>4. Oglądanie tablicy</h3>
            <ol>
              <li>Po rozpoczęciu tablicy przez prowadzącego zobaczysz wszystkie ukryte odpowiedzi</li>
              <li>Zgadujcie odpowiedzi i mówcie je na głos prowadzącemu</li>
              <li>Prowadzący będzie odkrywał poprawne odpowiedzi na tablicy</li>
              <li>Widzisz punkty w rundzie i liczbę błędów (czerwone X)</li>
              <li>Odpowiedzi odkrywają się u wszystkich w czasie rzeczywistym</li>
            </ol>

            <h3>5. Punktacja i wynik</h3>
            <ol>
              <li>Po zakończeniu rundy prowadzący przekaże punkty zwycięskiej drużynie</li>
              <li>Punkty zostaną automatycznie dodane do wyniku końcowego</li>
            </ol>

            <h3>6. Pytanie finałowe</h3>
            <ol>
              <li><strong>5. pytanie to pytanie finałowe</strong> - wszystkie punkty są podwojone!</li>
              <li>To ostatnia szansa na zdobycie dużej przewagi</li>
              <li>Grajcie strategicznie!</li>
            </ol>

            <h3>7. Podsumowanie</h3>
            <ol>
              <li>Po 5 pytaniach zobaczycie ekran podsumowania</li>
              <li>Zobaczysz wyniki obu drużyn</li>
              <li>Zwycięzca zostanie wyróżniony złotym kolorem</li>
            </ol>

            <div className="success-box">
              <PiCheckCircleFill />
              <p><strong>Wskazówka:</strong> Komunikujcie się w drużynie! Wspólna burza mózgów to klucz do zwycięstwa. Pamiętajcie, że liczy się szybkość reakcji przy buzzerze!</p>
            </div>
          </div>
        </section>

        {/* PYTANIA I ODPOWIEDZI */}
        <section className="rules-section">
          <h2 className="section-title">Najczęściej zadawane pytania</h2>
          <div className="rules-text">
            <div className="faq-item">
              <h4>Ile osób może grać?</h4>
              <p>Gra wymaga 1 prowadzącego i minimum 2 drużyn. Każda drużyna może składać się z dowolnej liczby osób.</p>
            </div>

            <div className="faq-item">
              <h4>Czy potrzebuję rejestracji?</h4>
              <p>Nie! Gra nie wymaga rejestracji. Wystarczy, że prowadzący stworzy grę i poda kod drużynom.</p>
            </div>

            <div className="faq-item">
              <h4>Jak działa synchronizacja?</h4>
              <p>Gra używa Firebase do synchronizacji w czasie rzeczywistym. Wszystkie akcje prowadzącego (odkrywanie odpowiedzi, dodawanie błędów) są natychmiast widoczne u wszystkich graczy.</p>
            </div>

            <div className="faq-item">
              <h4>Czy mogę dostosować pytania?</h4>
              <p>Obecnie gra używa predefiniowanych pytań podzielonych na kategorie. Możliwość dodawania własnych pytań może pojawić się w przyszłych wersjach.</p>
            </div>

            <div className="faq-item">
              <h4>Jak długo trwa jedna gra?</h4>
              <p>Standardowa gra (5 pytań) trwa około 15-20 minut, w zależności od szybkości odpowiedzi drużyn.</p>
            </div>
          </div>
        </section>

        <div className="rules-footer">
          <button className="btn-start-game" onClick={() => router.push('/home')}>
            <PiGameControllerFill /> Rozpocznij grę
          </button>
        </div>
      </div>
    </div>
  );
}
