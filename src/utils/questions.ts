import type { QuestionSet, CategoryInfo, Question, Answer } from '../types/game';

// Zestawy pytań podzielone na kategorie i poziomy trudności
const questionSets: QuestionSet[] = [
  // ZESTAW 1: Rodzina - Łatwy
  {
    category: "Rodzina",
    difficulty: "easy",
    questions: [
      {
        question: "Co robisz z rodziną w weekend?",
        answers: [
          "Oglądamy film",
          "Gramy w gry",
          "Idziemy na spacer",
          "Jemy obiad",
          "Odwiedzamy krewnych",
          "Jedziemy na wycieczkę",
        ],
      },
      {
        question: "Popularne imię dla dziecka",
        answers: [
          "Kasia",
          "Michał",
          "Anna",
          "Jakub",
          "Julia",
          "Adam",
          "Zosia",
        ],
      },
      {
        question: "Co kupujemy dziecku na urodziny?",
        answers: [
          "Zabawki",
          "Ubrania",
          "Książki",
          "Gry",
          "Rower",
          "Piłka",
        ],
      },
      {
        question: "Typowe danie na niedzielny obiad",
        answers: [
          "Rosół",
          "Schabowy z ziemniakami",
          "Pierogi",
          "Kotlet",
          "Golonka",
          "Bigos",
          "Gołąbki",
        ],
      },
      {
        question: "Co babcia daje wnukom?",
        answers: [
          "Słodycze",
          "Pieniądze",
          "Pierogi",
          "Ciastka",
          "Kompot",
          "Uściski",
        ],
      },
    ],
  },

  // ZESTAW 2: Filmy - Łatwy
  {
    category: "Filmy",
    difficulty: "easy",
    questions: [
      {
        question: "Popularny gatunek filmowy",
        answers: [
          "Komedia",
          "Akcja",
          "Horror",
          "Dramat",
          "Sci-Fi",
          "Romans",
          "Thriller",
        ],
      },
      {
        question: "Co jemy w kinie?",
        answers: [
          "Popcorn",
          "Nachos",
          "Lody",
          "Cukierki",
          "Hot dog",
          "Chipsy",
        ],
      },
      {
        question: "Znane postaci z bajek",
        answers: [
          "Myszka Miki",
          "Elsa",
          "Shrek",
          "Spider-Man",
          "Batman",
          "Buzz Astral",
          "Muminek",
        ],
      },
      {
        question: "Co można zobaczyć w filmie akcji?",
        answers: [
          "Wybuchy",
          "Pościgi",
          "Strzelaniny",
          "Bójki",
          "Akrobacje",
          "Szybkie samochody",
        ],
      },
      {
        question: "Popularne streaming serwisy",
        answers: [
          "Netflix",
          "HBO Max",
          "Disney+",
          "Prime Video",
          "YouTube",
          "Apple TV+",
        ],
      },
    ],
  },

  // ZESTAW 3: Zwierzęta - Łatwy
  {
    category: "Zwierzęta",
    difficulty: "easy",
    questions: [
      {
        question: "Zwierzę domowe",
        answers: [
          "Pies",
          "Kot",
          "Chomik",
          "Papuga",
          "Rybki",
          "Królik",
          "Świnka morska",
        ],
      },
      {
        question: "Zwierzę, które żyje w wodzie",
        answers: [
          "Ryba",
          "Delfin",
          "Rekin",
          "Krab",
          "Ośmiornica",
          "Foka",
          "Wieloryb",
        ],
      },
      {
        question: "Co robi pies?",
        answers: [
          "Szczeka",
          "Biega",
          "Macha ogonem",
          "Aportuje",
          "Liże",
          "Broni domu",
        ],
      },
      {
        question: "Zwierzę z Afryki",
        answers: [
          "Lew",
          "Słoń",
          "Żyrafa",
          "Zebra",
          "Hipopotam",
          "Nosorożec",
          "Gepard",
        ],
      },
      {
        question: "Ptak, który lata",
        answers: [
          "Gołąb",
          "Wróbel",
          "Wrona",
          "Jaskółka",
          "Orzeł",
          "Sowa",
          "Bocian",
        ],
      },
    ],
  },

  // ZESTAW 4: Młodzież - Średni
  {
    category: "Młodzież",
    difficulty: "medium",
    questions: [
      {
        question: "Popularna aplikacja wśród młodzieży",
        answers: [
          "TikTok",
          "Instagram",
          "Snapchat",
          "Discord",
          "YouTube",
          "Spotify",
          "Messenger",
        ],
      },
      {
        question: "Co młodzież robi w weekend?",
        answers: [
          "Spotyka się z przyjaciółmi",
          "Gra w gry",
          "Idzie do kina",
          "Siedzi na telefonie",
          "Jeździ na rowerze",
          "Słucha muzyki",
        ],
      },
      {
        question: "Popularny sport wśród młodzieży",
        answers: [
          "Piłka nożna",
          "Koszykówka",
          "Siatkówka",
          "Skateboarding",
          "Jazda na rowerze",
          "E-sport",
          "Pływanie",
        ],
      },
      {
        question: "Gdzie młodzież się spotyka?",
        answers: [
          "Park",
          "Galeria handlowa",
          "Kawiarnia",
          "Kino",
          "Plac zabaw",
          "Centrum miasta",
        ],
      },
      {
        question: "Gatunek muzyki popularny wśród młodzieży",
        answers: [
          "Pop",
          "Rap",
          "Hip-hop",
          "Rock",
          "Electronic",
          "Trap",
          "R&B",
        ],
      },
    ],
  },

  // ZESTAW 5: Historia - Trudny
  {
    category: "Historia",
    difficulty: "hard",
    questions: [
      {
        question: "Znani polscy królowie",
        answers: [
          "Kazimierz Wielki",
          "Władysław Jagiełło",
          "Bolesław Chrobry",
          "Jan III Sobieski",
          "Mieszko I",
          "Stanisław August Poniatowski",
        ],
      },
      {
        question: "Ważne wydarzenie w historii Polski",
        answers: [
          "Chrzest Polski",
          "Bitwa pod Grunwaldem",
          "Konstytucja 3 maja",
          "Odzyskanie niepodległości",
          "Powstanie warszawskie",
          "Solidarność",
        ],
      },
      {
        question: "Starożytna cywilizacja",
        answers: [
          "Egipt",
          "Grecja",
          "Rzym",
          "Mezopotamia",
          "Persja",
          "Chiny",
        ],
      },
      {
        question: "Wynalazek, który zmienił świat",
        answers: [
          "Druk",
          "Elektryczność",
          "Internet",
          "Silnik parowy",
          "Telefon",
          "Komputer",
          "Samolot",
        ],
      },
      {
        question: "Znany polski poeta",
        answers: [
          "Adam Mickiewicz",
          "Juliusz Słowacki",
          "Wisława Szymborska",
          "Czesław Miłosz",
          "Jan Kochanowski",
          "Cyprian Kamil Norwid",
        ],
      },
    ],
  },

  // ZESTAW 6: Jedzenie - Łatwy
  {
    category: "Jedzenie",
    difficulty: "easy",
    questions: [
      {
        question: "Popularne śniadanie",
        answers: [
          "Jajecznica",
          "Kanapki",
          "Płatki",
          "Jogurt",
          "Naleśniki",
          "Owsianka",
        ],
      },
      {
        question: "Co dodajemy do herbaty?",
        answers: [
          "Cukier",
          "Cytryna",
          "Miód",
          "Mleko",
          "Miętę",
        ],
      },
      {
        question: "Popularna pizza",
        answers: [
          "Margherita",
          "Pepperoni",
          "Hawajska",
          "Capriciosa",
          "Cztery sery",
          "Wegetariańska",
        ],
      },
      {
        question: "Warzywo w sałatce",
        answers: [
          "Pomidor",
          "Ogórek",
          "Sałata",
          "Papryka",
          "Cebula",
          "Marchew",
          "Rzodkiewka",
        ],
      },
      {
        question: "Deser po obiedzie",
        answers: [
          "Lody",
          "Ciasto",
          "Owoce",
          "Kompot",
          "Sernik",
          "Szarlotka",
        ],
      },
    ],
  },

  // ZESTAW 7: Technologia - Średni
  {
    category: "Technologia",
    difficulty: "medium",
    questions: [
      {
        question: "Popularna marka telefonu",
        answers: [
          "Samsung",
          "Apple",
          "Xiaomi",
          "Huawei",
          "OnePlus",
          "Motorola",
        ],
      },
      {
        question: "Co robisz na komputerze?",
        answers: [
          "Przeglądasz internet",
          "Grasz w gry",
          "Pracujesz",
          "Oglądasz filmy",
          "Słuchasz muzyki",
          "Piszesz dokumenty",
        ],
      },
      {
        question: "Część komputera",
        answers: [
          "Monitor",
          "Klawiatura",
          "Mysz",
          "Procesor",
          "Dysk twardy",
          "Karta graficzna",
          "RAM",
        ],
      },
      {
        question: "Popularna przeglądarka internetowa",
        answers: [
          "Chrome",
          "Firefox",
          "Safari",
          "Edge",
          "Opera",
          "Brave",
        ],
      },
      {
        question: "Co można robić na smartfonie?",
        answers: [
          "Dzwonić",
          "Pisać SMS",
          "Robić zdjęcia",
          "Surfować po internecie",
          "Grać w gry",
          "Słuchać muzyki",
          "Używać social media",
        ],
      },
    ],
  },

  // ZESTAW 8: Sport - Średni
  {
    category: "Sport",
    difficulty: "medium",
    questions: [
      {
        question: "Dyscyplina olimpijska",
        answers: [
          "Bieg",
          "Pływanie",
          "Skok wzwyż",
          "Pchnięcie kulą",
          "Rzut oszczepem",
          "Gimnastyka",
          "Zapasy",
        ],
      },
      {
        question: "Znany polski piłkarz",
        answers: [
          "Robert Lewandowski",
          "Wojciech Szczęsny",
          "Piotr Zieliński",
          "Grzegorz Krychowiak",
          "Arkadiusz Milik",
          "Kamil Glik",
        ],
      },
      {
        question: "Co jest potrzebne do gry w tenisa?",
        answers: [
          "Rakieta",
          "Piłka",
          "Kort",
          "Siatka",
          "Odpowiednie buty",
          "Opaska na głowę",
        ],
      },
      {
        question: "Popularny klub piłkarski",
        answers: [
          "Real Madryt",
          "Barcelona",
          "Manchester United",
          "Bayern Monachium",
          "Liverpool",
          "Juventus",
          "Paris Saint-Germain",
        ],
      },
      {
        question: "Co robi zawodnik przed meczem?",
        answers: [
          "Rozgrzewka",
          "Rozmowa z trenerem",
          "Motywacja",
          "Ubieram strój",
          "Ćwiczenia rozciągające",
          "Pije wodę",
        ],
      },
    ],
  },

  // ZESTAW 9: Podróże - Średni
  {
    category: "Podróże",
    difficulty: "medium",
    questions: [
      {
        question: "Popularna destynacja wakacyjna",
        answers: [
          "Włochy",
          "Hiszpania",
          "Grecja",
          "Chorwacja",
          "Francja",
          "Egipt",
          "Turcja",
        ],
      },
      {
        question: "Co pakujesz na wakacje?",
        answers: [
          "Ubrania",
          "Kosmetyki",
          "Ręczniki",
          "Strój kąpielowy",
          "Okulary słoneczne",
          "Dokumenty",
          "Leki",
        ],
      },
      {
        question: "Środek transportu w podróży",
        answers: [
          "Samolot",
          "Samochód",
          "Pociąg",
          "Autobus",
          "Statek",
          "Rower",
        ],
      },
      {
        question: "Znane miasto w Europie",
        answers: [
          "Paryż",
          "Londyn",
          "Rzym",
          "Barcelona",
          "Berlin",
          "Amsterdam",
          "Praga",
        ],
      },
      {
        question: "Co robisz na plaży?",
        answers: [
          "Opalasz się",
          "Pływasz",
          "Budujesz zamki z piasku",
          "Grasz w siatkówkę",
          "Czytasz książkę",
          "Pijesz koktajle",
        ],
      },
    ],
  },

  // ZESTAW 10: Szkoła - Łatwy
  {
    category: "Szkoła",
    difficulty: "easy",
    questions: [
      {
        question: "Przedmiot szkolny",
        answers: [
          "Matematyka",
          "Polski",
          "Angielski",
          "Historia",
          "Biologia",
          "Wychowanie fizyczne",
          "Informatyka",
        ],
      },
      {
        question: "Co nosisz do szkoły?",
        answers: [
          "Plecak",
          "Zeszyty",
          "Książki",
          "Piórnik",
          "Kanapki",
          "Butelka wody",
        ],
      },
      {
        question: "Kto pracuje w szkole?",
        answers: [
          "Nauczyciel",
          "Dyrektor",
          "Woźny",
          "Sekretarka",
          "Pedagog",
          "Bibliotekarka",
        ],
      },
      {
        question: "Co robisz na przerwie?",
        answers: [
          "Rozmawiasz z kolegami",
          "Jesz drugie śniadanie",
          "Biegasz",
          "Grasz w piłkę",
          "Siedzisz w ławce",
          "Odrabiasz lekcje",
        ],
      },
      {
        question: "Przybory szkolne",
        answers: [
          "Długopis",
          "Ołówek",
          "Gumka",
          "Linijka",
          "Zeszyt",
          "Kredki",
          "Nożyczki",
        ],
      },
    ],
  },

  // ZESTAW 11: Natura - Średni
  {
    category: "Natura",
    difficulty: "medium",
    questions: [
      {
        question: "Drzewo w polskim lesie",
        answers: [
          "Sosna",
          "Dąb",
          "Brzoza",
          "Świerk",
          "Buk",
          "Jesion",
          "Lipa",
        ],
      },
      {
        question: "Zjawisko pogodowe",
        answers: [
          "Deszcz",
          "Śnieg",
          "Burza",
          "Mgła",
          "Wiatr",
          "Grad",
          "Tęcza",
        ],
      },
      {
        question: "Owoc rosnący na drzewie",
        answers: [
          "Jabłko",
          "Gruszka",
          "Śliwka",
          "Czereśnia",
          "Morela",
          "Brzoskwinia",
        ],
      },
      {
        question: "Pora roku",
        answers: [
          "Lato",
          "Zima",
          "Wiosna",
          "Jesień",
        ],
      },
      {
        question: "Co widzisz w górach?",
        answers: [
          "Szczyty",
          "Drzewa",
          "Zwierzęta",
          "Szlaki",
          "Schroniska",
          "Wodospady",
          "Jeziora",
        ],
      },
    ],
  },

  // ZESTAW 12: Muzyka - Trudny
  {
    category: "Muzyka",
    difficulty: "hard",
    questions: [
      {
        question: "Znany polski zespół",
        answers: [
          "Lady Pank",
          "Bajm",
          "Czerwone Gitary",
          "Perfect",
          "Myslovitz",
          "T.Love",
          "Budka Suflera",
        ],
      },
      {
        question: "Instrument strunowy",
        answers: [
          "Gitara",
          "Skrzypce",
          "Kontrabas",
          "Harfa",
          "Mandolina",
          "Banjo",
        ],
      },
      {
        question: "Element w orkiestrze",
        answers: [
          "Dyrygent",
          "Skrzypce",
          "Trąbka",
          "Perkusja",
          "Flet",
          "Klarnet",
          "Altówka",
        ],
      },
      {
        question: "Gatunek muzyki klasycznej",
        answers: [
          "Opera",
          "Symfonia",
          "Koncert",
          "Sonata",
          "Kwartet",
          "Balet",
        ],
      },
      {
        question: "Znany kompozytor",
        answers: [
          "Mozart",
          "Beethoven",
          "Chopin",
          "Bach",
          "Vivaldi",
          "Tchaikovsky",
        ],
      },
    ],
  },

  // ZESTAW 13: Zawody - Łatwy
  {
    category: "Zawody",
    difficulty: "easy",
    questions: [
      {
        question: "Zawód związany z medycyną",
        answers: [
          "Lekarz",
          "Pielęgniarka",
          "Dentysta",
          "Ratownik medyczny",
          "Farmaceuta",
          "Fizjoterapeuta",
        ],
      },
      {
        question: "Kto pracuje w sklepie?",
        answers: [
          "Sprzedawca",
          "Kasjer",
          "Kierownik",
          "Magazynier",
          "Ochroniarz",
        ],
      },
      {
        question: "Zawód twórczy",
        answers: [
          "Artysta",
          "Muzyk",
          "Pisarz",
          "Aktor",
          "Fotograf",
          "Rzeźbiarz",
          "Projektant",
        ],
      },
      {
        question: "Kto pracuje w restauracji?",
        answers: [
          "Kucharz",
          "Kelner",
          "Barman",
          "Szef kuchni",
          "Pomoc kuchenna",
        ],
      },
      {
        question: "Zawód związany z bezpieczeństwem",
        answers: [
          "Policjant",
          "Strażak",
          "Ochroniarz",
          "Żołnierz",
          "Detektyw",
          "Ratownik",
        ],
      },
    ],
  },

  // ZESTAW 14: Święta - Łatwy
  {
    category: "Święta",
    difficulty: "easy",
    questions: [
      {
        question: "Co robisz na Boże Narodzenie?",
        answers: [
          "Ubierasz choinkę",
          "Pakujesz prezenty",
          "Jesz kolację",
          "Śpiewasz kolędy",
          "Spotykasz się z rodziną",
          "Chodzisz na pasterkę",
        ],
      },
      {
        question: "Tradycyjne danie wigilijne",
        answers: [
          "Karp",
          "Barszcz",
          "Pierogi",
          "Śledź",
          "Kompot z suszonych owoców",
          "Kutia",
          "Makaron z makiem",
        ],
      },
      {
        question: "Co robisz na Wielkanoc?",
        answers: [
          "Malujesz jajka",
          "Chodzisz do kościoła",
          "Jesz święcone",
          "Szukasz jajek",
          "Lany poniedziałek",
          "Piec babkę",
        ],
      },
      {
        question: "Dekoracja świąteczna",
        answers: [
          "Choinka",
          "Bombki",
          "Łańcuchy",
          "Gwiazdka",
          "Światełka",
          "Szopka",
        ],
      },
      {
        question: "Co dostajesz na urodziny?",
        answers: [
          "Prezenty",
          "Tort",
          "Życzenia",
          "Kwiaty",
          "Pieniądze",
          "Kartki",
        ],
      },
    ],
  },

  // ZESTAW 15: Dom - Łatwy
  {
    category: "Dom",
    difficulty: "easy",
    questions: [
      {
        question: "Pomieszczenie w domu",
        answers: [
          "Kuchnia",
          "Łazienka",
          "Sypialnia",
          "Salon",
          "Pokój",
          "Korytarz",
          "Piwnica",
        ],
      },
      {
        question: "Mebel w salonie",
        answers: [
          "Kanapa",
          "Telewizor",
          "Stolik",
          "Fotel",
          "Regał",
          "Dywan",
        ],
      },
      {
        question: "Co robisz w kuchni?",
        answers: [
          "Gotujesz",
          "Jesz",
          "Zmywasz naczynia",
          "Pijesz kawę",
          "Piecze",
          "Przygotowujesz jedzenie",
        ],
      },
      {
        question: "Urządzenie w domu",
        answers: [
          "Telewizor",
          "Lodówka",
          "Pralka",
          "Odkurzacz",
          "Mikrofala",
          "Zmywarka",
          "Czajnik",
        ],
      },
      {
        question: "Co robisz sprzątając?",
        answers: [
          "Odkurzasz",
          "Myjesz podłogi",
          "Wycierasz kurze",
          "Układasz rzeczy",
          "Wyrzucasz śmieci",
          "Myjesz okna",
        ],
      },
    ],
  },

  // ZESTAW 16: Zakupy - Średni
  {
    category: "Zakupy",
    difficulty: "medium",
    questions: [
      {
        question: "Gdzie robisz zakupy?",
        answers: [
          "Supermarket",
          "Sklep osiedlowy",
          "Galeria handlowa",
          "Targowisko",
          "Sklep internetowy",
          "Hipermarket",
        ],
      },
      {
        question: "Co kupujesz w aptece?",
        answers: [
          "Leki",
          "Witaminy",
          "Plaster",
          "Bandaż",
          "Termometr",
          "Syrop",
          "Maść",
        ],
      },
      {
        question: "Sklep odzieżowy",
        answers: [
          "H&M",
          "Reserved",
          "Zara",
          "CCC",
          "Cropp",
          "Mohito",
        ],
      },
      {
        question: "Co jest na liście zakupów?",
        answers: [
          "Mleko",
          "Chleb",
          "Jajka",
          "Warzywa",
          "Owoce",
          "Mięso",
          "Pasta do zębów",
        ],
      },
      {
        question: "Metoda płatności",
        answers: [
          "Karta",
          "Gotówka",
          "BLIK",
          "Telefon",
          "Przelew",
          "Voucher",
        ],
      },
    ],
  },

  // ZESTAW 17: Auto - Średni
  {
    category: "Auto",
    difficulty: "medium",
    questions: [
      {
        question: "Marka samochodu",
        answers: [
          "Toyota",
          "BMW",
          "Mercedes",
          "Volkswagen",
          "Ford",
          "Audi",
          "Skoda",
        ],
      },
      {
        question: "Część samochodu",
        answers: [
          "Silnik",
          "Koła",
          "Kierownica",
          "Hamulce",
          "Lusterka",
          "Światła",
          "Bagażnik",
        ],
      },
      {
        question: "Co robisz w samochodzie?",
        answers: [
          "Prowadzisz",
          "Słuchasz muzyki",
          "Rozmawiasz",
          "Jedziesz",
          "Parkujesz",
          "Patrzysz przez okno",
        ],
      },
      {
        question: "Co może się zepsuć w aucie?",
        answers: [
          "Silnik",
          "Opony",
          "Akumulator",
          "Hamulce",
          "Światła",
          "Klimatyzacja",
          "Radio",
        ],
      },
      {
        question: "Dokument potrzebny do jazdy",
        answers: [
          "Prawo jazdy",
          "Dowód rejestracyjny",
          "Ubezpieczenie",
          "Przegląd techniczny",
          "Dowód osobisty",
        ],
      },
    ],
  },

  // ZESTAW 18: Emocje - Średni
  {
    category: "Emocje",
    difficulty: "medium",
    questions: [
      {
        question: "Jak się czujesz gdy jesteś szczęśliwy?",
        answers: [
          "Uśmiechnięty",
          "Zadowolony",
          "Radosny",
          "Pełen energii",
          "Spokojny",
          "Beztroskie",
        ],
      },
      {
        question: "Co robisz gdy jesteś smutny?",
        answers: [
          "Płaczesz",
          "Rozmawiam z kimś",
          "Siedzę sam",
          "Słucham muzyki",
          "Myślę",
          "Śpię",
        ],
      },
      {
        question: "Co Cię denerwuje?",
        answers: [
          "Hałas",
          "Kłótnie",
          "Spóźnienia",
          "Nieporządek",
          "Kłamstwa",
          "Tłok",
          "Kolejki",
        ],
      },
      {
        question: "Kiedy się stresujesz?",
        answers: [
          "Przed egzaminem",
          "W pracy",
          "W korku",
          "Przed wystąpieniem",
          "U lekarza",
          "Podczas kłótni",
        ],
      },
      {
        question: "Co sprawia Ci radość?",
        answers: [
          "Rodzina",
          "Przyjaciele",
          "Wakacje",
          "Prezenty",
          "Sukces",
          "Dobra wiadomość",
          "Słońce",
        ],
      },
    ],
  },

  // ZESTAW 19: Moda - Średni
  {
    category: "Moda",
    difficulty: "medium",
    questions: [
      {
        question: "Element garderoby",
        answers: [
          "Koszula",
          "Spodnie",
          "Sukienka",
          "Kurtka",
          "Bluza",
          "Sweter",
          "T-shirt",
        ],
      },
      {
        question: "Rodzaj butów",
        answers: [
          "Adidasy",
          "Szpilki",
          "Botki",
          "Sandały",
          "Kozaki",
          "Trampki",
          "Klapki",
        ],
      },
      {
        question: "Dodatek do stroju",
        answers: [
          "Zegarek",
          "Torebka",
          "Biżuteria",
          "Pasek",
          "Szalik",
          "Czapka",
          "Okulary",
        ],
      },
      {
        question: "Materiał z którego szyje się ubrania",
        answers: [
          "Bawełna",
          "Wełna",
          "Jeans",
          "Skóra",
          "Len",
          "Jedwab",
          "Poliester",
        ],
      },
      {
        question: "Kolor ubrań",
        answers: [
          "Czarny",
          "Biały",
          "Niebieski",
          "Czerwony",
          "Szary",
          "Beżowy",
          "Zielony",
        ],
      },
    ],
  },

  // ZESTAW 20: Hobby - Trudny
  {
    category: "Hobby",
    difficulty: "hard",
    questions: [
      {
        question: "Popularne hobby",
        answers: [
          "Czytanie",
          "Sport",
          "Fotografowanie",
          "Gotowanie",
          "Malowanie",
          "Granie na instrumencie",
          "Zbieranie",
        ],
      },
      {
        question: "Sport wodny",
        answers: [
          "Pływanie",
          "Surfing",
          "Nurkowanie",
          "Kajakarstwo",
          "Żeglarstwo",
          "Windsurfing",
        ],
      },
      {
        question: "Co można zbierać?",
        answers: [
          "Znaczki",
          "Monety",
          "Pocztówki",
          "Figurki",
          "Książki",
          "Płyty",
          "Modele",
        ],
      },
      {
        question: "Zajęcie kreatywne",
        answers: [
          "Malowanie",
          "Rysowanie",
          "Rzeźbienie",
          "Pisanie",
          "Robótki ręczne",
          "Szydełkowanie",
          "Scrapbooking",
        ],
      },
      {
        question: "Sport ekstremalny",
        answers: [
          "Spadochroniarstwo",
          "Wspinaczka",
          "Rafting",
          "Bungee jumping",
          "Snowboard",
          "Motocross",
        ],
      },
    ],
  },

  // ZESTAW 21: Zdrowie - Trudny
  {
    category: "Zdrowie",
    difficulty: "hard",
    questions: [
      {
        question: "Zdrowy nawyk",
        answers: [
          "Ćwiczenia",
          "Zdrowe jedzenie",
          "Picie wody",
          "Sen",
          "Higiena",
          "Spacery",
          "Witaminy",
        ],
      },
      {
        question: "Gdzie się leczysz?",
        answers: [
          "Przychodnia",
          "Szpital",
          "Apteka",
          "Lekarz",
          "Gabinet",
          "Klinika",
        ],
      },
      {
        question: "Badanie lekarskie",
        answers: [
          "Badanie krwi",
          "RTG",
          "USG",
          "EKG",
          "Ciśnienie",
          "Tomografia",
        ],
      },
      {
        question: "Co robisz żeby być zdrowym?",
        answers: [
          "Ćwiczę",
          "Zdrowo jem",
          "Odpoczywam",
          "Nie palę",
          "Chodzę na badania",
          "Unikam stresu",
        ],
      },
      {
        question: "Objawy choroby",
        answers: [
          "Gorączka",
          "Ból głowy",
          "Kaszel",
          "Katar",
          "Osłabienie",
          "Ból brzucha",
          "Nudności",
        ],
      },
    ],
  },

  // ZESTAW 22: Praca - Trudny
  {
    category: "Praca",
    difficulty: "hard",
    questions: [
      {
        question: "Co robisz w pracy?",
        answers: [
          "Pracujesz przy komputerze",
          "Spotkania",
          "Odbierasz telefony",
          "Piszesz maile",
          "Realizujesz projekty",
          "Rozwiązujesz problemy",
        ],
      },
      {
        question: "Miejsce pracy",
        answers: [
          "Biuro",
          "Fabryka",
          "Sklep",
          "Szkoła",
          "Szpital",
          "Budowa",
          "Restauracja",
        ],
      },
      {
        question: "Co potrzebujesz do pracy?",
        answers: [
          "Komputer",
          "Telefon",
          "Dokumenty",
          "Narzędzia",
          "Umiejętności",
          "Doświadczenie",
        ],
      },
      {
        question: "Korzyść z pracy",
        answers: [
          "Pensja",
          "Doświadczenie",
          "Ubezpieczenie",
          "Rozwój",
          "Kontakty",
          "Stabilność",
          "Urlop",
        ],
      },
      {
        question: "Co stresuje w pracy?",
        answers: [
          "Deadline",
          "Szef",
          "Nadgodziny",
          "Odpowiedzialność",
          "Presja",
          "Konflikty",
          "Monotonia",
        ],
      },
    ],
  },

  // ZESTAW 23: Internet - Łatwy
  {
    category: "Internet",
    difficulty: "easy",
    questions: [
      {
        question: "Co robisz w internecie?",
        answers: [
          "Przeglądasz strony",
          "Social media",
          "Oglądasz filmy",
          "Słuchasz muzyki",
          "Robisz zakupy",
          "Czytasz wiadomości",
          "Grasz",
        ],
      },
      {
        question: "Portal społecznościowy",
        answers: [
          "Facebook",
          "Instagram",
          "TikTok",
          "Twitter",
          "LinkedIn",
          "Snapchat",
        ],
      },
      {
        question: "Co możesz znaleźć w Google?",
        answers: [
          "Informacje",
          "Zdjęcia",
          "Mapy",
          "Filmy",
          "Przepisy",
          "Wiadomości",
          "Tłumaczenia",
        ],
      },
      {
        question: "Serwis do oglądania filmów",
        answers: [
          "YouTube",
          "Netflix",
          "HBO Max",
          "Disney+",
          "Prime Video",
          "Twitch",
        ],
      },
      {
        question: "Co robisz na social media?",
        answers: [
          "Wrzucasz zdjęcia",
          "Lajkujesz",
          "Komentuj",
          "Udostępniasz",
          "Obserwujesz",
          "Czatuje",
        ],
      },
    ],
  },

  // ZESTAW 24: Gry - Średni
  {
    category: "Gry",
    difficulty: "medium",
    questions: [
      {
        question: "Platforma do gier",
        answers: [
          "PlayStation",
          "Xbox",
          "Nintendo",
          "PC",
          "Steam",
          "Mobile",
        ],
      },
      {
        question: "Gatunek gier",
        answers: [
          "Akcja",
          "RPG",
          "Wyścigi",
          "Sport",
          "Strategie",
          "Przygodowe",
          "Logiczne",
        ],
      },
      {
        question: "Popularna gra",
        answers: [
          "Minecraft",
          "Fortnite",
          "FIFA",
          "GTA",
          "League of Legends",
          "Call of Duty",
          "Among Us",
        ],
      },
      {
        question: "Akcesoria do gier",
        answers: [
          "Kontroler",
          "Mysz",
          "Klawiatura",
          "Słuchawki",
          "Mikrofon",
          "Kamerka",
        ],
      },
      {
        question: "Co robisz grając?",
        answers: [
          "Wykonujesz misje",
          "Walczysz",
          "Zdobywasz punkty",
          "Budujesz",
          "Eksploruj",
          "Współpracujesz",
        ],
      },
    ],
  },
];

// Funkcja zwracająca listę dostępnych kategorii (dla UI wyboru)
export const getAvailableCategories = (): CategoryInfo[] => {
  return questionSets.map((set) => ({
    category: set.category,
    difficulty: set.difficulty,
  }));
};

// Funkcja zwracająca pytania dla wybranej kategorii
export const getQuestionsByCategory = (category: string): Question[] => {
  const set = questionSets.find((s) => s.category === category);
  if (!set) return [];
  
  // Przekonwertuj odpowiedzi na obiekty z punktacją
  return set.questions.map((q) => ({
    question: q.question,
    answers: q.answers.map((answer, index): Answer => ({
      answer: answer,
      points: 100 - (index * 10), // 100, 90, 80, 70, 60, 50, 40, 30, 20
    })),
  }));
};

// Export domyślny dla kompatybilności wstecznej
const questions: Question[] = questionSets[0].questions.map((q) => ({
  question: q.question,
  answers: q.answers.map((answer, index): Answer => ({
    answer: answer,
    points: 100 - (index * 10),
  })),
}));

export { questionSets };
export default questions;
