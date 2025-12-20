"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { PiArrowLeftBold, PiGameControllerFill, PiUsersFill, PiLightningFill, PiTrophyFill, PiXCircleFill, PiCheckCircleFill } from "react-icons/pi";
import "./rules.scss";

export default function RulesPage() {
  const router = useRouter();

  // Set dynamic meta tags
  useEffect(() => {
    document.title = "Zasady gry | Familiada - Jak grać w Familiadę online";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Poznaj zasady gry w Familiadę online. Dowiedz się jak działa buzzer, punktacja, błędne odpowiedzi i pytania finałowe. Szczegółowa instrukcja dla graczy i prowadzących.');
    }
  }, []);

  return (
    <div className="rules-container">
      <div className="rules-content">
        <button className="btn-back" onClick={() => router.back()}>
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
                  <li>Grająca drużyna może udzielić maksymalnie <strong>3 błędne odpowiedzi</strong> (wyświetlane jako czerwone X)</li>
                  <li>Po 3 błędach pytanie automatycznie przechodzi do drugiej drużyny</li>
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
          </div>
        </section>

        {/* WYMAGANIA TECHNICZNE */}
        <section className="rules-section">
          <h2 className="section-title"><PiUsersFill /> Wymagania do gry</h2>
          <div className="rules-text">
            <div className="requirements-box">
              <h3>Minimalne wymagania:</h3>
              <ul>
                <li><strong>Liczba graczy:</strong> Minimum 3 osoby (1 prowadzący + 2 drużyny)</li>
                <li><strong>Drużyny:</strong> Każda drużyna może składać się z nieograniczonej liczby graczy</li>
                <li><strong>Urządzenia:</strong> Minimum 3 urządzenia (telefony, tablety lub komputery) - jedno dla prowadzącego i po jednym dla każdej drużyny</li>
                <li><strong>Internet:</strong> Stałe połączenie z internetem dla wszystkich uczestników</li>
                <li><strong>Przeglądarka:</strong> Aktualna wersja przeglądarki internetowej (Chrome, Firefox, Safari, Edge)</li>
              </ul>

              <div className="info-box">
                <PiCheckCircleFill />
                <p><strong>Gra działa w czasie rzeczywistym!</strong> Wszystkie akcje prowadzącego (odkrywanie odpowiedzi, przyznawanie punktów, przechodzenie do kolejnych pytań) są automatycznie synchronizowane i widoczne natychmiast dla wszystkich graczy bez potrzeby odświeżania strony.</p>
              </div>
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
              <li>Po rozpoczęciu gry drużyny zobaczą listę dostępnych kategorii pytań</li>
              <li><strong>Poczekaj, aż obie drużyny zagłosują na kategorię</strong></li>
              <li>Zobaczysz, na którą kategorię zagłosowała każda drużyna</li>
              <li><strong>Jeśli obie drużyny wybrały tę samą kategorię:</strong> możecie przejść do gry</li>
              <li><strong>Jeśli drużyny wybrały różne kategorie:</strong> kliknij przycisk <strong>"Losowanie kategorii"</strong>, aby system wylosował jedną z dwóch wybranych kategorii i przejść do gry</li>
            </ol>

            <h3>3. Faza buzzera</h3>
            <ol>
              <li>Po wyborze kategorii możesz odkryć pytanie w rudzie przyciskiem <strong>"Odkryj pytanie"</strong></li>
              <li>Przeczytaj pytanie na głos dla drużyn</li>
              <li>Drużyny wciskają swoje buzzery na swoich urządzeniach</li>
              <li>System automatycznie wykryje, która drużyna była pierwsza</li>
              <li>Zobaczysz komunikat: <strong>"Drużyna która wcisneła pierwsza: [Nazwa drużyny]"</strong></li>
              <li>Kliknij <strong>"Przejdź do tablicy"</strong>, aby przejść do fazy odpowiedzi</li>
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
              <li><strong>Błędna odpowiedź:</strong> Kliknij ten przycisk, gdy drużyna udzieli złej odpowiedzi.</li>
              <li><strong>Ostrzeżenie:</strong> Włącz 3-sekundowe ostrzeżenie, gdy drużyna zbyt długo zastanawia się nad odpowiedzią. Drużyna ma tylko 3 sekundy na udzielenie odpowiedzi - jeśli czas minie, kliknij przycisk <strong>"Błędna odpowiedź"</strong>.</li>
              <li><strong>Reset błędnych:</strong> Opcja dostępna w nagłych przypadkach, jeśli chcesz cofnąć pomyłkowo dodany błąd.</li>
            </ol>

            <h3>6. Przekazywanie punktów</h3>
            <ol>
              <li>Kliknij przycisk <strong>"Przekaż punkty - [Nazwa drużyny]"</strong>, aby przyznać punkty zwycięskiej drużynie</li>
              <li>Po przekazaniu punktów wszystkie przyciski kontrolne zostają zablokowane</li>
              <li>Kliknij <strong>"Przejdź do następnego pytania"</strong>, aby kontynuować grę</li>
            </ol>

            <h3>7. Zakończenie gry</h3>
            <ol>
              <li>Po 5 pytaniach gra automatycznie przechodzi do podsumowania</li>
              <li>Zobaczysz wyniki obu drużyn i zwycięzcę</li>
              <li>Możesz rozpocząć nową grę klikając <strong>"Nowa gra"</strong></li>
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

            <h3>2. Głosowanie na kategorię</h3>
            <ol>
              <li>Po rozpoczęciu gry przez prowadzącego zobaczysz listę dostępnych kategorii pytań</li>
              <li>Każda kategoria ma oznaczony poziom trudności (gwiazdki)</li>
              <li><strong>Kliknij na kategorię, aby zagłosować</strong></li>
              <li>Możesz zmienić swój wybór w dowolnym momencie - po prostu kliknij inną kategorię</li>
              <li>Zobaczysz, na którą kategorię zagłosowała druga drużyna (możecie zagłosować na tę samą)</li>
              <li><strong>Jeśli obie drużyny wybiorą tę samą kategorię:</strong> gra rozpocznie się automatycznie</li>
              <li><strong>Jeśli wybierzecie różne kategorie:</strong> prowadzący wylosuje jedną z dwóch wybranych kategorii</li>
              <li>Po wyborze kategorii przechodzicie do fazy buzzera</li>
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

            <h3>6. Podsumowanie</h3>
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

        {/* INSTRUKCJA TWORZENIA KATEGORII */}
        <section className="rules-section">
          <h2 className="section-title"><PiGameControllerFill /> Tworzenie własnych kategorii</h2>
          <div className="rules-text">
            <div className="info-box">
              <PiCheckCircleFill />
              <p><strong>Tylko prowadzący może tworzyć własne kategorie pytań!</strong> Stworzone kategorie będą dostępne do głosowania dla drużyn podczas wyboru kategorii.</p>
            </div>

            <h3>Kiedy można stworzyć kategorię?</h3>
            <p>Kategorię możesz stworzyć w dwóch momentach:</p>
            <ul>
              <li><strong>W poczekalni</strong> - przed dołączeniem drużyn do gry</li>
              <li><strong>Podczas głosowania</strong> - gdy drużyny wybierają kategorię (przed rozpoczęciem rundy)</li>
            </ul>

            <h3>Przechowywanie kategorii</h3>
            <div className="warning-box">
              <PiXCircleFill />
              <div>
                <p><strong>Ważne informacje o zapisywaniu:</strong></p>
                <ul>
                  <li>Stworzone kategorie są <strong>przechowywane lokalnie</strong> w pamięci przeglądarki</li>
                  <li>Kategorie utworzone w trybie incognito, innej przeglądarce lub na innym urządzeniu <strong>nie będą dostępne</strong></li>
                  <li>Nie można przenosić stworzonych kategorii między różnymi grami lokalnymi</li>
                  <li>Kategorie są dostępne <strong>tylko w tej konkretnej grze</strong>, w której zostały stworzone</li>
                  <li>Stworzone kategorie <strong>nie są dostępne publicznie</strong> - widzą je tylko uczestnicy Twojej gry</li>
                </ul>
              </div>
            </div>

            <h3>Zasady tworzenia kategorii</h3>
            <ol>
              <li><strong>Nazwa i trudność:</strong>
                <ul>
                  <li>Podaj nazwę kategorii</li>
                  <li>Wybierz poziom trudności: łatwy (⭐), średni (⭐⭐) lub trudny (⭐⭐⭐)</li>
                </ul>
              </li>
              <li><strong>Tworzenie pytań:</strong>
                <ul>
                  <li>Musisz stworzyć <strong>dokładnie 5 pytań</strong></li>
                  <li>Każde pytanie wymaga treści pytania oraz odpowiedzi</li>
                </ul>
              </li>
              <li><strong>Odpowiedzi:</strong>
                <ul>
                  <li>Każde pytanie musi mieć <strong>minimum 3 odpowiedzi</strong></li>
                  <li>Możesz dodać <strong>maksymalnie 10 odpowiedzi</strong> na pytanie</li>
                  <li>Możesz usuwać odpowiedzi podczas tworzenia (minimalnie 3 muszą pozostać)</li>
                  <li>Możesz zmieniać kolejność odpowiedzi - <strong>przytrzymaj i przeciągnij</strong> odpowiedź</li>
                  <li><strong>Ważne:</strong> Kolejność odpowiedzi określa ich punktację (pierwsza = 100 pkt, druga = 90 pkt, itd.)</li>
                </ul>
              </li>
              <li><strong>Nawigacja:</strong>
                <ul>
                  <li>Możesz cofać się do poprzednich pytań lub do ustawień nazwy kategorii</li>
                  <li>Zmiany są zapisywane tylko po kliknięciu <strong>"Zapisz kategorię"</strong> przy ostatnim pytaniu</li>
                  <li>Jeśli anulujesz tworzenie lub nie zapiszesz kategorii - zmiany nie zostaną zachowane</li>
                </ul>
              </li>
            </ol>

            <h3>Zarządzanie kategoriami</h3>
            <ul>
              <li>Po zapisaniu kategoria pojawi się na liście pod przyciskiem "Stwórz kategorię"</li>
              <li>Możesz <strong>edytować kategorię</strong> klikając na nią - obowiązują te same zasady co przy tworzeniu</li>
              <li>Kategorie stworzone w poczekalni pojawią się w głosowaniu gdy drużyny dołączą</li>
              <li>Możesz edytować kategorię nawet gdy drużyny już są w grze (przed rozpoczęciem rundy)</li>
              <li><strong>Nie można usunąć</strong> stworzonych kategorii - upewnij się przed zapisaniem!</li>
            </ul>

            <div className="success-box">
              <PiCheckCircleFill />
              <p><strong>Wskazówka:</strong> Twórz kategorie dopasowane do zainteresowań Twoich graczy! Im bardziej spersonalizowane pytania, tym więcej zabawy. Pamiętaj o ustawieniu odpowiedzi w kolejności od najbardziej do najmniej oczywistej.</p>
            </div>
          </div>
        </section>


        <div className="rules-footer">
          <button className="btn-start-game" onClick={() => router.push('/gra/')}>
            <PiGameControllerFill /> Rozpocznij grę
          </button>
        </div>
      </div>
    </div>
  );
}
