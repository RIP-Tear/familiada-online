import type { Metadata } from "next";
import { LandingContent } from "./LandingContent";

export const metadata: Metadata = {
  title: "Familiada Online - Gra Familijna Za Darmo | Multiplayer Po Polsku",
  description:
    "Familiada gra online za darmo! Multiplayer po polsku z własnymi pytaniami. Graj na telefon lub komputer. Tablica online jak w teleturnieju!",
  alternates: {
    canonical: "https://www.familiada-online.pl/",
  },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Jak grać w Familiadę online?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Wybierz tryb gry: stwórz grę jako prowadzący lub dołącz do istniejącej rozgrywki. Dwie drużyny rywalizują odpowiadając na pytania ankietowe. Celem jest zgadnięcie najpopularniejszych odpowiedzi.",
      },
    },
    {
      "@type": "Question",
      name: "Czy Familiada online jest darmowa?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Tak, Familiada online jest całkowicie darmowa. Możesz grać bez żadnych opłat z przyjaciółmi w trybie multiplayer. Nie musisz niczego pobierać - graj bezpośrednio w przeglądarce!",
      },
    },
    {
      "@type": "Question",
      name: "Czy mogę grać w Familiadę na telefonie?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Tak! Familiada online działa na telefonie, tablecie i komputerze. Gra jest w pełni responsywna i dostosowana do urządzeń mobilnych. Wystarczy przeglądarka - bez pobierania aplikacji.",
      },
    },
    {
      "@type": "Question",
      name: "Czy mogę dodać własne pytania do Familiady?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Tak! Jako prowadzący możesz tworzyć własne kategorie i pytania. To pozwala dostosować grę do Twojej grupy, imprezy lub wydarzenia. Możesz też używać gotowych zestawów pytań.",
      },
    },
    {
      "@type": "Question",
      name: "Ile osób może grać w Familiadę online?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "W Familiadzie online grają dwie drużyny. Każda drużyna może składać się z dowolnej liczby graczy. Dodatkowo potrzebny jest jeden prowadzący. To idealna gra familijna!",
      },
    },
    {
      "@type": "Question",
      name: "Czy Familiada online ma tryb multiplayer?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Tak! Familiada online jest grą multiplayer. Grasz online z przyjaciółmi w czasie rzeczywistym. Prowadzący tworzy pokój, a gracze dołączają przez kod gry.",
      },
    },
    {
      "@type": "Question",
      name: "Czy Familiada online jest po polsku?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Tak, Familiada online jest w 100% po polsku. Interfejs, pytania i cała gra są w języku polskim. To polska gra stworzona dla polskich graczy!",
      },
    },
    {
      "@type": "Question",
      name: "Czy potrzebuję rejestracji aby grać?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Nie, nie potrzebujesz rejestracji. Wystarczy że prowadzący stworzy grę i poda kod innym graczom, którzy mogą od razu dołączyć. Szybki start bez zbędnych formularzy!",
      },
    },
    {
      "@type": "Question",
      name: "Czy muszę coś pobierać aby grać w Familiadę?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Nie! Familiada online działa bezpośrednio w przeglądarce. Nie musisz nic pobierać ani instalować. Wystarczy wejść na stronę i rozpocząć grę.",
      },
    },
  ],
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <LandingContent />
    </>
  );
}
