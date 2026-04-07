"use client";
import { useState, useEffect, Fragment } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/redux/hooks";
import {
  getAvailableCategories,
  getQuestionsByCategory,
} from "@/utils/questions";
import {
  subscribeToGame,
  buzzIn,
  voteForCategory,
  voteForCategoryAsParticipant,
  teamLeftGame,
  assignBuzzer,
} from "@/utils/firebaseUtils";
import { gameHistoryStorage } from "@/utils/gameHistoryStorage";
import {
  PiGameControllerFill,
  PiLightningFill,
  PiClockCountdownFill,
  PiCheckBold,
  PiLockKeyFill,
  PiTargetFill,
  PiXBold,
  PiTrophyFill,
  PiHandshakeFill,
  PiConfettiFill,
  PiStarFill,
  PiWarningFill,
  PiXCircleFill,
  PiArrowRightBold,
  PiCheckCircleFill,
  PiUsersFill,
  PiChartBarFill,
  PiNumberCircleOneFill,
  PiFlagCheckeredFill,
  PiArrowClockwiseBold,
  PiQuestionFill,
} from "react-icons/pi";
import { Navbar } from "@/components";
import "@/styles/game.scss";
import "@/styles/board.scss";

export default function PlayerGamePage() {
  const router = useRouter();
  const { gameCode, userName, userId, isParticipant, userTeam } =
    useAppSelector((state) => state.game);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [buzzedTeam, setBuzzedTeam] = useState(null);
  const [myTeamBuzzed, setMyTeamBuzzed] = useState(false);
  const [isFirst, setIsFirst] = useState(null); // true = first, false = second, null = not buzzed
  const [gamePhase, setGamePhase] = useState("category-selection"); // "category-selection" | "buzz" | "playing" | "finished"
  const [gameData, setGameData] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [myTeamNumber, setMyTeamNumber] = useState(null); // 1 lub 2
  const [myVote, setMyVote] = useState(null); // Głos gracza na kategorię
  const [usedCategories, setUsedCategories] = useState<string[]>([]); // Kategorie już użyte w tej grze
  const [participantVotes, setParticipantVotes] = useState<
    Record<string, string>
  >({}); // Głosy uczestników na kategorie (dla kapitana)
  const [mounted, setMounted] = useState(false); // Fix dla hydratacji

  // Fix dla hydratacji - montuj komponent
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!gameCode) {
      router.push("/gra/");
      return;
    }

    // Załaduj dostępne kategorie
    const availableCategories = getAvailableCategories();
    setCategories(availableCategories);

    // Załaduj użyte kategorie dla tej gry
    const used = gameHistoryStorage.getUsedCategories(gameCode);
    setUsedCategories(used);
    console.log("[PLAYER] Loaded used categories:", used);

    // Nasłuchuj na wybór kategorii przez hosta
    const unsubscribe = subscribeToGame(gameCode, (data) => {
      console.log("[PLAYER] Game data updated:", {
        hostLeftAlert: data.hostLeftAlert,
        teamLeftAlert: data.teamLeftAlert,
        teamLeftName: data.teamLeftName,
        gamePhase: data.gamePhase,
      });
      setGameData(data);

      // Zawsze sprawdzaj i aktualizuj listę kategorii
      const availableCategories = getAvailableCategories();

      // Dodaj własne kategorie prowadzącego do listy (tylko uzupełnione)
      if (data.hostCustomCategories && data.hostCustomCategories.length > 0) {
        console.log(
          "[PLAYER] 🎯 Custom categories present:",
          data.hostCustomCategories.length,
        );

        // Filtruj tylko uzupełnione kategorie
        const completeCategories = data.hostCustomCategories.filter(
          (cat: any) => {
            // Sprawdź czy kategoria ma nazwę i 5 pytań z co najmniej 3 odpowiedziami każde
            if (!cat.name || !cat.name.trim()) return false;
            if (!cat.questions || cat.questions.length !== 5) return false;

            return cat.questions.every((q: any) => {
              if (!q.question || !q.question.trim()) return false;
              const validAnswers =
                q.answers?.filter((a: string) => a && a.trim()) || [];
              return validAnswers.length >= 3;
            });
          },
        );

        const customCats = completeCategories.map((cat: any) => ({
          category: cat.name,
          difficulty: cat.difficulty,
        }));

        // Dodaj custom kategorie na początek
        const filteredCategories = availableCategories.filter(
          (c) => !customCats.some((cc: any) => cc.category === c.category),
        );
        const newCategories = [...customCats, ...filteredCategories];
        console.log(
          "[PLAYER] 📋 Adding custom categories to list (complete:",
          completeCategories.length,
          "total:",
          newCategories.length,
          ")",
        );
        setCategories(newCategories);
      } else if (categories.length === 0) {
        // Jeśli brak kategorii, załaduj domyślne
        console.log("[PLAYER] 📋 Loading default categories");
        setCategories(availableCategories);
      }

      // Jeśli gra została zakończona, przekieruj do gra
      if (data.status === "ended") {
        router.push("/gra/");
        return;
      }

      // Określ numer zespołu gracza
      if (data.teams && !myTeamNumber) {
        let teamIndex = -1;

        if (isParticipant) {
          // Dla uczestnika znajdź drużynę na podstawie userTeam (ID drużyny)
          teamIndex = data.teams.findIndex((team) => team.id === userTeam);
        } else {
          // Dla kapitana znajdź drużynę na podstawie userId
          teamIndex = data.teams.findIndex((team) => team.id === userId);
        }

        if (teamIndex !== -1) {
          setMyTeamNumber(teamIndex + 1); // 1 lub 2
        }
      }

      // Jeśli kapitan - zbieraj głosy uczestników z jego drużyny
      if (
        !isParticipant &&
        data.participants &&
        data.participantCategoryVotes
      ) {
        // Znajdź ID mojej drużyny - kapitan ma team.id === userId
        const myTeam = data.teams?.find((t) => t.id === userId);
        const myTeamId = myTeam?.id;

        // Filtruj uczestników z mojej drużyny
        const myTeamParticipants = data.participants.filter(
          (p) => p.teamId === myTeamId,
        );

        const votes: Record<string, string> = {};
        myTeamParticipants.forEach((p) => {
          if (data.participantCategoryVotes[p.id]) {
            votes[p.id] = data.participantCategoryVotes[p.id];
          }
        });

        console.log("[PLAYER] Participant votes:", {
          myTeamId,
          myTeamParticipants: myTeamParticipants.length,
          votes,
          allParticipantVotes: data.participantCategoryVotes,
        });

        setParticipantVotes(votes);
      }

      if (data.selectedCategory) {
        if (data.selectedCategory !== selectedCategory) {
          setSelectedCategory(data.selectedCategory);
          console.log(
            `[PLAYER] Host selected category: ${data.selectedCategory}`,
          );

          // Zapisz kategorię w localStorage
          if (!usedCategories.includes(data.selectedCategory)) {
            gameHistoryStorage.addUsedCategory(gameCode, data.selectedCategory);
            setUsedCategories((prev) => [...prev, data.selectedCategory]);
          }

          // Sprawdź czy to custom category
          const customCat = data.hostCustomCategories?.find(
            (cat: any) => cat.name === data.selectedCategory,
          );
          if (customCat) {
            // Użyj pytań z custom category
            const customQuestions = customCat.questions.map(
              (q: any, idx: number) => ({
                question: q.question,
                answers: q.answers.map((a: string, aIdx: number) => ({
                  answer: a,
                  points: (q.answers.length - aIdx) * 10, // Punkty od najwyższych do najniższych
                })),
              }),
            );
            setQuestions(customQuestions);

            if (customQuestions.length > 0) {
              setCurrentQuestion(customQuestions[0]);
            }
          } else {
            // Załaduj pytania z normalnej kategorii
            const categoryQuestions = getQuestionsByCategory(
              data.selectedCategory,
            );
            setQuestions(categoryQuestions);

            if (categoryQuestions.length > 0) {
              const questionIndex = data.currentQuestionIndex || 0;
              setCurrentQuestion(categoryQuestions[questionIndex]);
            }
          }
        }
      } else {
        // Jeśli nie ma wybranej kategorii (nowa gra), wyczyść stan
        if (selectedCategory) {
          setSelectedCategory(null);
          setQuestions([]);
          setCurrentQuestion(null);
        }
      }

      // Aktualizuj fazę gry
      if (data.gamePhase) {
        const previousPhase = gamePhase;
        setGamePhase(data.gamePhase);

        // Gdy wracamy do wyboru kategorii, odśwież listę kategorii
        if (
          data.gamePhase === "category-selection" &&
          previousPhase !== "category-selection"
        ) {
          console.log(
            "[PLAYER] 🔄 Returning to category selection - refreshing categories",
          );
          if (
            data.hostCustomCategories &&
            data.hostCustomCategories.length > 0
          ) {
            const availableCategories = getAvailableCategories();

            // Filtruj tylko uzupełnione kategorie
            const completeCategories = data.hostCustomCategories.filter(
              (cat: any) => {
                if (!cat.name || !cat.name.trim()) return false;
                if (!cat.questions || cat.questions.length !== 5) return false;
                return cat.questions.every((q: any) => {
                  if (!q.question || !q.question.trim()) return false;
                  const validAnswers =
                    q.answers?.filter((a: string) => a && a.trim()) || [];
                  return validAnswers.length >= 3;
                });
              },
            );

            const customCats = completeCategories.map((cat: any) => ({
              category: cat.name,
              difficulty: cat.difficulty,
            }));
            const filteredCategories = availableCategories.filter(
              (c) => !customCats.some((cc: any) => cc.category === c.category),
            );
            setCategories([...customCats, ...filteredCategories]);
            console.log(
              "[PLAYER] ✅ Custom categories added to list (complete):",
              customCats.length,
            );
          }
        }
      }

      // Aktualizuj obecne pytanie przy zmianie indeksu
      if (data.currentQuestionIndex !== undefined && questions.length > 0) {
        setCurrentQuestion(questions[data.currentQuestionIndex]);
      }

      // Aktualizuj stan przycisku buzz
      if (data.buzzedTeamName) {
        setBuzzedTeam(data.buzzedTeamName);

        // Sprawdź czy to moja drużyna wcisnęła
        if (data.buzzedTeam === userId) {
          setMyTeamBuzzed(true);
          setIsFirst(true);
        } else if (myTeamBuzzed && data.buzzedTeam !== userId) {
          setIsFirst(false);
        }
      } else {
        // Reset
        setBuzzedTeam(null);
        setMyTeamBuzzed(false);
        setIsFirst(null);
      }

      // Aktualizuj mój głos na podstawie danych z serwera
      if (isParticipant) {
        // Uczestnik czyta z participantCategoryVotes
        if (
          data.participantCategoryVotes &&
          data.participantCategoryVotes[userId]
        ) {
          setMyVote(data.participantCategoryVotes[userId]);
        } else if (
          data.participantCategoryVotes &&
          !data.participantCategoryVotes[userId]
        ) {
          setMyVote(null);
        }
      } else {
        // Kapitan czyta z categoryVotes
        if (data.categoryVotes && data.categoryVotes[userId]) {
          setMyVote(data.categoryVotes[userId]);
        } else if (data.categoryVotes && !data.categoryVotes[userId]) {
          setMyVote(null);
        }
      }
    });

    return () => unsubscribe && unsubscribe();
  }, [
    gameCode,
    router,
    selectedCategory,
    userId,
    myTeamBuzzed,
    questions,
    isParticipant,
  ]);

  // Osobny useEffect dla przekierowania gdy prowadzący lub drużyna opuściła grę
  useEffect(() => {
    if (gameData?.hostLeftAlert) {
      console.log("[PLAYER] Host left alert detected, redirecting in 2s...");
      const redirectTimer = setTimeout(() => {
        console.log("[PLAYER] Redirecting to /gra");
        router.push("/gra/");
      }, 2000);
      return () => clearTimeout(redirectTimer);
    }
    if (gameData?.teamLeftAlert) {
      console.log("[PLAYER] Team left alert detected, redirecting in 2s...");
      const redirectTimer = setTimeout(() => {
        console.log("[PLAYER] Redirecting to /gra");
        router.push("/gra/");
      }, 2000);
      return () => clearTimeout(redirectTimer);
    }
  }, [gameData?.hostLeftAlert, gameData?.teamLeftAlert, router]);

  const handleVoteCategory = async (categoryName) => {
    try {
      if (isParticipant) {
        // Uczestnik głosuje, ale głos nie idzie do prowadzącego
        await voteForCategoryAsParticipant(gameCode, userId, categoryName);
        setMyVote(categoryName);
        console.log(
          `[PARTICIPANT] Voted for category (suggestion only): ${categoryName}`,
        );
      } else {
        // Kapitan głosuje normalnie
        await voteForCategory(gameCode, userId, categoryName);
        setMyVote(categoryName);
        console.log(`[PLAYER] Voted for category: ${categoryName}`);
      }
    } catch (error) {
      console.error("[PLAYER] Error voting for category:", error);
    }
  };

  const handleTeamLeaveGame = async () => {
    try {
      const myTeam = gameData?.teams?.find((team) => team.id === userId);
      const teamName = myTeam?.name || userName;
      await teamLeftGame(gameCode, teamName);
      console.log("[PLAYER] Team left the game");
      await new Promise((resolve) => setTimeout(resolve, 500)); // Poczekaj na zapisanie danych
    } catch (error) {
      console.error("[PLAYER] Error leaving game:", error);
    }
  };

  const handleBuzz = async () => {
    if (myTeamBuzzed || buzzedTeam) return; // Już wciśnięty

    setMyTeamBuzzed(true);

    try {
      // Znajdź nazwę drużyny gracza
      let teamName = userName; // Domyślnie imię gracza (dla kapitana bez drużyny)

      if (gameData?.teams) {
        let myTeam;

        if (isParticipant) {
          // Dla uczestnika znajdź drużynę na podstawie userTeam (ID drużyny)
          myTeam = gameData.teams.find((team) => team.id === userTeam);
        } else {
          // Dla kapitana znajdź drużynę na podstawie userId
          myTeam = gameData.teams.find((team) => team.id === userId);
        }

        if (myTeam) {
          teamName = myTeam.name; // Użyj nazwy drużyny
        }
      }

      const result = await buzzIn(gameCode, userId, teamName);
      if (result.first) {
        setIsFirst(true);
        console.log(`[PLAYER] We buzzed first!`);
      } else {
        setIsFirst(false);
        console.log(`[PLAYER] We were too slow`);
      }
    } catch (error) {
      console.error("[PLAYER] Error buzzing:", error);
      setMyTeamBuzzed(false);
    }
  };

  const getDifficultyStars = (difficulty) => {
    switch (difficulty) {
      case "easy":
        return (
          <span className="difficulty-stars easy">
            <PiStarFill />
          </span>
        );
      case "medium":
        return (
          <span className="difficulty-stars medium">
            <PiStarFill />
            <PiStarFill />
          </span>
        );
      case "hard":
        return (
          <span className="difficulty-stars hard">
            <PiStarFill />
            <PiStarFill />
            <PiStarFill />
          </span>
        );
      default:
        return (
          <span className="difficulty-stars easy">
            <PiStarFill />
          </span>
        );
    }
  };

  const getDifficultyLabel = (difficulty) => {
    switch (difficulty) {
      case "easy":
        return "Łatwy";
      case "medium":
        return "Średni";
      case "hard":
        return "Trudny";
      default:
        return difficulty;
    }
  };

  return (
    <>
      <Navbar onLeaveGame={handleTeamLeaveGame} />
      <div className="game-container">
        {/* Overlay ostrzeżenia */}
        {gameData?.warningActive && (
          <div className="warning-overlay">
            <div className="warning-content">
              <PiWarningFill className="warning-icon" />
              <h2 className="warning-text">Podaj szybko odpowiedź!</h2>
              <div className="progress-bar-container">
                <div className="progress-bar-fill"></div>
              </div>
            </div>
          </div>
        )}

        {/* Overlay błędnej odpowiedzi */}
        {gameData?.wrongAnswerAlert && (
          <div className="wrong-answer-overlay">
            <div className="wrong-answer-content">
              <PiXCircleFill className="wrong-answer-icon" />
              <h2 className="wrong-answer-text">Błędna odpowiedź!</h2>
              {gameData?.wrongAnswerCount < 4 && (
                <p className="wrong-answer-count">
                  {gameData?.wrongAnswerCount}{" "}
                  {gameData?.wrongAnswerCount === 1 ? "błąd" : "błędy"}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Overlay narady drużyny przeciwnej (po 2 błędzie) */}
        {gameData?.opponentConsultationAlert && (
          <div className="wrong-answer-overlay consultation-warning">
            <div className="wrong-answer-content">
              <PiUsersFill className="wrong-answer-icon" />
              <h2 className="wrong-answer-text">
                Drużyna przeciwna się naradza...
              </h2>
            </div>
          </div>
        )}

        {/* Overlay przejścia pytania do przeciwnej drużyny (po 3 błędzie) */}
        {gameData?.transferQuestionAlert && (
          <div className="wrong-answer-overlay transfer-warning">
            <div className="wrong-answer-content">
              <PiArrowRightBold className="wrong-answer-icon" />
              <h2 className="wrong-answer-text">Odpowiada drużyna przeciwna</h2>
            </div>
          </div>
        )}

        {/* Overlay następnego pytania */}
        {gameData?.nextQuestionAlert && (
          <div className="wrong-answer-overlay next-question">
            <div className="wrong-answer-content">
              <PiArrowRightBold className="wrong-answer-icon" />
              <h2 className="wrong-answer-text">Następne pytanie!</h2>
            </div>
          </div>
        )}

        {/* Overlay wygranej rundy */}
        {gameData?.roundWinnerAlert && (
          <div className="wrong-answer-overlay round-winner">
            <div className="wrong-answer-content">
              <PiTrophyFill className="wrong-answer-icon" />
              <h2 className="wrong-answer-text">Rundę wygrywa drużyna</h2>
              <p className="round-winner-name">{gameData?.roundWinnerName}</p>
            </div>
          </div>
        )}

        {/* Overlay losowania kategorii */}
        {gameData?.categoryDrawingAlert && (
          <div className="wrong-answer-overlay category-drawing">
            <div className="wrong-answer-content">
              <div className="category-drawing-spinner"></div>
              <h2 className="wrong-answer-text">Losowanie kategorii...</h2>
            </div>
          </div>
        )}

        {/* Overlay wybranej kategorii */}
        {gameData?.categorySelectedAlert && (
          <div className="wrong-answer-overlay category-selected">
            <div className="wrong-answer-content">
              <PiCheckCircleFill className="wrong-answer-icon" />
              <h2 className="wrong-answer-text">
                {gameData?.isCategoryRandomlySelected
                  ? "Wylosowano"
                  : "Wybrano"}{" "}
                kategorię
              </h2>
              <p className="round-winner-name">
                {gameData?.selectedCategoryName}
              </p>
            </div>
          </div>
        )}

        {/* Overlay Team VS Team */}
        {gameData?.teamVsAlert && (
          <div className="wrong-answer-overlay team-vs">
            <div className="wrong-answer-content">
              <h2 className="team-vs-name">
                {gameData?.team1Name || "Drużyna 1"}
              </h2>
              <h1 className="team-vs-text">VS</h1>
              <h2 className="team-vs-name">
                {gameData?.team2Name || "Drużyna 2"}
              </h2>
            </div>
          </div>
        )}

        {/* Overlay opuszczenia gry przez prowadzącego */}
        {gameData?.hostLeftAlert && (
          <div className="wrong-answer-overlay host-left">
            <div className="wrong-answer-content">
              <PiWarningFill className="wrong-answer-icon" />
              <h2 className="wrong-answer-text">Prowadzący opuścił grę</h2>
            </div>
          </div>
        )}

        {/* Overlay opuszczenia gry przez drużynę */}
        {gameData?.teamLeftAlert && (
          <div className="wrong-answer-overlay team-left">
            <div className="wrong-answer-content">
              <PiWarningFill className="wrong-answer-icon" />
              <h2 className="wrong-answer-text">
                {gameData?.teamLeftName}
                <br />
                opuścili grę
              </h2>
            </div>
          </div>
        )}

        {/* Overlay wyniku końcowego gry */}
        {gameData?.gameResultAlert &&
          (() => {
            const team1Score = gameData?.team1Score || 0;
            const team2Score = gameData?.team2Score || 0;
            const myScore = myTeamNumber === 1 ? team1Score : team2Score;
            const opponentScore = myTeamNumber === 1 ? team2Score : team1Score;
            const isWinner = myScore > opponentScore;
            const isDraw = myScore === opponentScore;

            return (
              <div
                className={`wrong-answer-overlay ${isWinner ? "game-winner" : "game-loser"}`}
              >
                <div className="wrong-answer-content">
                  {isDraw ? (
                    <>
                      <PiHandshakeFill className="wrong-answer-icon" />
                      <h2 className="wrong-answer-text">Remis!</h2>
                    </>
                  ) : isWinner ? (
                    <>
                      <PiConfettiFill className="wrong-answer-icon" />
                      <h2 className="wrong-answer-text">Gratulacje!</h2>
                    </>
                  ) : (
                    <>
                      <PiXCircleFill className="wrong-answer-icon" />
                      <h2 className="wrong-answer-text">Przegrana</h2>
                    </>
                  )}
                </div>
              </div>
            );
          })()}

        {/* Overlay najwyżej punktowanej odpowiedzi */}
        {gameData?.topAnswerAlert && (
          <div className="wrong-answer-overlay top-answer">
            <div className="wrong-answer-content">
              <PiNumberCircleOneFill className="wrong-answer-icon" />
              <h2 className="wrong-answer-text">
                Najwyżej punktowana odpowiedź!
              </h2>
            </div>
          </div>
        )}

        {/* Overlay końca rundy */}
        {gameData?.roundEndAlert && (
          <div className="wrong-answer-overlay round-end">
            <div className="wrong-answer-content">
              <PiFlagCheckeredFill className="wrong-answer-icon" />
              <h2 className="wrong-answer-text">Koniec rundy</h2>
            </div>
          </div>
        )}

        {/* Overlay nowej gry */}
        {gameData?.newGameAlert && (
          <div className="wrong-answer-overlay new-game">
            <div className="wrong-answer-content">
              <PiArrowClockwiseBold className="wrong-answer-icon" />
              <h2 className="wrong-answer-text">Nowa gra</h2>
            </div>
          </div>
        )}

        <div className="game-header">
          <h1 className="header-title">
            {gamePhase === "creating-custom-category"
              ? "Tworzenie kategorii"
              : gamePhase === "category-selection"
                ? "Wybieranie kategorii"
                : gamePhase === "buzz" ||
                    gameData?.gamePhase === "buzzer-selection"
                  ? (gameData?.currentQuestionIndex || 0) === 4
                    ? "Ostatnie pytanie"
                    : `Pytanie ${(gameData?.currentQuestionIndex || 0) + 1}`
                  : gamePhase === "playing"
                    ? (gameData?.currentQuestionIndex || 0) === 4
                      ? "Ostatnie pytanie"
                      : `Pytanie ${(gameData?.currentQuestionIndex || 0) + 1}`
                    : "Podsumowanie"}
          </h1>
          <div className="header-team">{mounted ? userName : ""}</div>
        </div>

        {gamePhase === "creating-custom-category" ? (
          // FAZA: Prowadzący tworzy własną kategorię
          <div className="custom-category-waiting">
            <div className="waiting-content-horizontal">
              <div className="loading-spinner"></div>
              <div className="waiting-text-content">
                <h2 className="waiting-title">
                  Prowadzący tworzy własną kategorię
                </h2>
                <p className="waiting-subtitle">
                  Czekaj, aż prowadzący przygotuje pytania...
                </p>
              </div>
            </div>
          </div>
        ) : gamePhase === "category-selection" ? (
          // FAZA 1: Wybór kategorii
          <div className="category-selection">
            <p className="instruction">Głosuj na kategorię pytań!</p>

            <div className="categories-grid">
              {categories.map((cat, index) => {
                // Sprawdź czy jakaś drużyna zagłosowała na tę kategorię
                const votedTeams = [];
                if (gameData?.categoryVotes) {
                  Object.entries(gameData.categoryVotes).forEach(
                    ([teamId, votedCategory]) => {
                      if (votedCategory === cat.category) {
                        const teamName =
                          gameData.teams?.find((t) => t.id === teamId)?.name ||
                          "Drużyna";
                        votedTeams.push({ teamId, teamName });
                      }
                    },
                  );
                }

                const isUsed = usedCategories.includes(cat.category);
                const isCustom = gameData?.hostCustomCategories?.some(
                  (c: any) => c.name === cat.category,
                );

                // Sprawdź czy to pierwsza własna kategoria w całej liście
                const isFirstCustom =
                  isCustom &&
                  !categories
                    .slice(0, index)
                    .some((c) =>
                      gameData?.hostCustomCategories?.some(
                        (custom: any) => custom.name === c.category,
                      ),
                    );

                // Sprawdź czy to ostatnia własna kategoria (następna nie jest custom)
                const isLastCustom =
                  isCustom &&
                  (index === categories.length - 1 ||
                    !gameData?.hostCustomCategories?.some(
                      (c: any) => c.name === categories[index + 1]?.category,
                    ));

                return (
                  <Fragment key={`${cat.category}-${index}`}>
                    {isFirstCustom && (
                      <div className="category-separator">
                        <div className="separator-line"></div>
                        <span className="separator-text">Własne kategorie</span>
                        <div className="separator-line"></div>
                      </div>
                    )}
                    <div
                      className={`category-card ${myVote === cat.category ? "voted" : ""} ${votedTeams.length > 0 ? "has-votes" : ""} ${isUsed ? "used" : ""} ${isCustom ? "custom" : ""} votable`}
                      onClick={() => handleVoteCategory(cat.category)}
                    >
                      <div className="category-icon">
                        {getDifficultyStars(cat.difficulty)}
                      </div>
                      <h3 className="category-name">{cat.category}</h3>
                      <p className="category-difficulty">
                        {getDifficultyLabel(cat.difficulty)}
                      </p>
                      {isUsed && (
                        <div className="used-badge">
                          <PiCheckCircleFill /> Użyta
                        </div>
                      )}
                      {myVote === cat.category && (
                        <div className="vote-badge">
                          <PiCheckBold /> Twój głos
                        </div>
                      )}
                      {votedTeams.length > 0 &&
                        votedTeams.some((vt) => vt.teamId !== userId) && (
                          <div className="vote-teams-badge opponent">
                            <PiCheckBold />{" "}
                            {votedTeams
                              .filter((vt) => vt.teamId !== userId)
                              .map((vt) => vt.teamName)
                              .join(", ")}
                          </div>
                        )}

                      {/* Sugestie od uczestników - tylko dla kapitana */}
                      {!isParticipant &&
                        (() => {
                          const participantCount = Object.values(
                            participantVotes,
                          ).filter((v) => v === cat.category).length;
                          if (participantCount > 0) {
                            console.log(
                              `[PLAYER] Category "${cat.category}" has ${participantCount} participant votes`,
                            );
                          }
                          return participantCount > 0;
                        })() && (
                          <div className="vote-teams-badge participant-suggestion">
                            <PiUsersFill />{" "}
                            {
                              Object.values(participantVotes).filter(
                                (v) => v === cat.category,
                              ).length
                            }
                          </div>
                        )}
                    </div>
                    {isLastCustom && (
                      <div className="category-separator">
                        <div className="separator-line"></div>
                        <span className="separator-text">
                          Standardowe kategorie
                        </span>
                        <div className="separator-line"></div>
                      </div>
                    )}
                  </Fragment>
                );
              })}
            </div>

            {/* {selectedCategory ? (
            <div className="selection-info">
              <p><PiCheckBold className="check-icon" /> Prowadzący wybrał: <strong>{selectedCategory}</strong></p>
              <p className="waiting-text">Gra zaraz się rozpocznie...</p>
            </div>
          ) : (
            <div className="waiting-message">
              <p>Prowadzący wybiera zestaw pytań...</p>
            </div>
          )} */}
          </div>
        ) : gamePhase === "buzzer-selection" ? (
          // FAZA 1.5: Wybór gracza do buzzera
          <div>
            {!isParticipant ? (
              // KAPITAN - wybiera kto naciska buzzer
              (() => {
                const myTeam = gameData?.teams?.find((t) => t.id === userId);
                const myTeamId = myTeam?.id;
                const teamParticipants =
                  gameData?.participants?.filter(
                    (p) => p.teamId === myTeamId,
                  ) || [];
                const hasAssigned = gameData?.buzzerAssignments?.[myTeamId];

                const handleAssignBuzzer = async (playerId: string) => {
                  try {
                    await assignBuzzer(gameCode, myTeamId, playerId);
                    console.log(
                      `[BUZZER_SELECT] Assigned buzzer to player ${playerId}`,
                    );
                  } catch (error) {
                    console.error(
                      "[BUZZER_SELECT] Error assigning buzzer:",
                      error,
                    );
                  }
                };

                return (
                  <>
                    {(gameData?.currentQuestionIndex || 0) === 4 && (
                      <div className="doubled-points-card" style={{marginBottom: "20px"}}>
                        <div className="doubled-points-icon">⚡</div>
                        <div className="doubled-points-content">
                          <h3 className="doubled-points-title">
                            PODWOJONE PUNKTY!
                          </h3>
                          <p className="doubled-points-text">
                            Punkty w tej rundzie są liczone x2
                          </p>
                        </div>
                      </div>
                    )}
                    <div className="buzzer-selection">
                      <div className="buzzer-selection-content">
                        <h2 className="buzzer-selection-title">
                          Kto naciska buzzer?
                        </h2>
                        <p className="buzzer-selection-subtitle">
                          Wybierz gracza z twojej drużyny, który będzie naciskał
                          buzzer w tej rundzie
                        </p>

                        <div className="buzzer-players-grid">
                          {/* Opcja: Kapitan sam naciska */}
                          <div
                            className={`buzzer-player-card ${hasAssigned === userId ? "selected" : ""}`}
                            onClick={() => handleAssignBuzzer(userId)}
                          >
                            <div className="buzzer-player-icon captain">
                              <PiGameControllerFill />
                            </div>
                            <div className="buzzer-player-info">
                              <div className="buzzer-player-name">
                                {userName}
                              </div>
                              <div className="buzzer-player-role">
                                Kapitan (Ty)
                              </div>
                            </div>
                            {hasAssigned === userId && (
                              <div className="buzzer-player-selected">
                                <PiCheckCircleFill />
                              </div>
                            )}
                          </div>

                          {/* Opcje: Uczestnicy z drużyny */}
                          {teamParticipants.map((participant) => (
                            <div
                              key={participant.id}
                              className={`buzzer-player-card ${hasAssigned === participant.id ? "selected" : ""}`}
                              onClick={() => handleAssignBuzzer(participant.id)}
                            >
                              <div className="buzzer-player-icon participant">
                                <PiUsersFill />
                              </div>
                              <div className="buzzer-player-info">
                                <div className="buzzer-player-name">
                                  {participant.name}
                                </div>
                                <div className="buzzer-player-role">
                                  Uczestnik
                                </div>
                              </div>
                              {hasAssigned === participant.id && (
                                <div className="buzzer-player-selected">
                                  <PiCheckCircleFill />
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </>
                );
              })()
            ) : (
              // UCZESTNIK - czeka na decyzję kapitana
              <>
                {(gameData?.currentQuestionIndex || 0) === 4 && (
                  <div className="doubled-points-card" style={{marginBottom: "20px"}}>
                    <div className="doubled-points-icon">⚡</div>
                    <div className="doubled-points-content">
                      <h3 className="doubled-points-title">
                        PODWOJONE PUNKTY!
                      </h3>
                      <p className="doubled-points-text">
                        Punkty w tej rundzie są liczone x2
                      </p>
                    </div>
                  </div>
                )}
                <div className="buzz-waiting-participant">
                  <h2 className="waiting-title">Kapitan wybiera gracza</h2>
                  <div className="loading-spinner"></div>
                  <p className="waiting-subtitle">
                    Czekaj, aż kapitan zdecyduje, kto naciska buzzer w tej
                    rundzie...
                  </p>
                </div>
              </>
            )}
          </div>
        ) : gamePhase === "buzz" ? (
          // FAZA 2: Pytanie buzz
          <div className="buzz-round-player">
            {/* Informacja o podwojonych punktach - tylko dla ostatniego pytania */}
            {(gameData?.currentQuestionIndex || 0) === 4 && (
              <div className="doubled-points-card" style={{marginBottom: "20px"}}>
                <div className="doubled-points-icon">⚡</div>
                <div className="doubled-points-content">
                  <h3 className="doubled-points-title">PODWOJONE PUNKTY!</h3>
                  <p className="doubled-points-text">
                    Punkty w tej rundzie są liczone x2
                  </p>
                </div>
              </div>
            )}

            {(() => {
              // Sprawdź czy ten user jest wybranym graczem do buzzera
              const myTeamId = isParticipant ? userTeam : userId;
              const assignedPlayerId = gameData?.buzzerAssignments?.[myTeamId];
              const isAssignedToBuzz = assignedPlayerId === userId;

              if (!isAssignedToBuzz) {
                // NIE JEST WYBRANYM GRACZEM - czeka na wynik
                return (
                  <>
                    <div className="buzz-waiting-participant">
                      <h2 className="waiting-title">
                        Czekaj na wynik buzzerów
                      </h2>
                      <div className="loading-spinner"></div>
                      <p className="waiting-subtitle">
                        {(() => {
                          const assignedPlayer = gameData?.participants?.find(
                            (p) => p.id === assignedPlayerId,
                          );
                          const assignedTeam = gameData?.teams?.find(
                            (t) => t.id === assignedPlayerId,
                          );
                          const assignedName =
                            assignedPlayer?.name ||
                            assignedTeam?.name ||
                            "Wybrany gracz";
                          return `${assignedName} naciska buzzer za twoją drużynę...`;
                        })()}
                      </p>
                    </div>
                    {buzzedTeam && (
                      <div className="buzz-result">
                        <p>
                          {isFirst === true ? (
                            <>
                              <PiTargetFill className="result-icon" /> Twoja
                              drużyna była pierwsza!
                            </>
                          ) : (
                            <>
                              <PiClockCountdownFill className="result-icon" />{" "}
                              Drużyna "{buzzedTeam}" była szybsza
                            </>
                          )}
                        </p>
                      </div>
                    )}
                  </>
                );
              }

              // JEST WYBRANYM GRACZEM - ma dostęp do buzzera
              return (
                <>
                  <div className="buzz-instruction">
                    <p>Prowadzący odczyta pytanie na głos</p>
                    <p className="buzz-hint">
                      Naciśnij przycisk jak najszybciej!{" "}
                      <PiLightningFill className="hint-icon" />
                    </p>
                  </div>

                  <button
                    className={`buzz-button ${
                      !gameData?.questionRevealed
                        ? "question-locked"
                        : isFirst === true
                          ? "buzz-first"
                          : buzzedTeam
                            ? "buzz-disabled"
                            : ""
                    }`}
                    onClick={handleBuzz}
                    disabled={
                      !gameData?.questionRevealed ||
                      myTeamBuzzed ||
                      buzzedTeam !== null
                    }
                  >
                    {!gameData?.questionRevealed ? (
                      <>CZEKAJ...</>
                    ) : isFirst === true ? (
                      <>PIERWSZY!</>
                    ) : buzzedTeam ? (
                      <>ZABLOKOWANY</>
                    ) : myTeamBuzzed ? (
                      <>CZEKAJ NA WERDYKT...</>
                    ) : (
                      "NACIŚNIJ!"
                    )}
                  </button>

                  {buzzedTeam && (
                    <div className="buzz-result">
                      <p>
                        {isFirst === true ? (
                          <>
                            <PiTargetFill className="result-icon" /> Twoja
                            drużyna była pierwsza!
                          </>
                        ) : (
                          <>
                            <PiClockCountdownFill className="result-icon" />{" "}
                            Drużyna "{buzzedTeam}" była szybsza
                          </>
                        )}
                      </p>
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        ) : gamePhase === "playing" ? (
          // FAZA 3: Tablica z grą
          <div className="game-board">
            {/* Pytanie */}
            <div className="main-question-card">
              <h2 className="main-question-text">
                {currentQuestion?.question}
              </h2>
            </div>

            {/* Tablica z odpowiedziami i błędnymi po bokach */}
            <div className="board-with-wrong-answers">
              {/* 3 błędne po lewej (pierwsza drużyna) */}
              <div className="wrong-answers-left">
                {Array.from({ length: 3 }).map((_, i) => {
                  const isActive =
                    i < Math.min(gameData?.wrongAnswersCount || 0, 3);
                  return (
                    <div
                      key={i}
                      className={`wrong-x-box ${isActive ? "active" : ""}`}
                    >
                      {isActive && (
                        <span className="wrong-x-large">
                          <PiXBold />
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Siatka odpowiedzi - tylko cyfry, odpowiedzi ujawniają się */}
              <div className="answers-grid">
                {currentQuestion?.answers.map((answer, index) => {
                  const revealed = gameData?.revealedAnswers?.find(
                    (r) => r.answer === answer.answer,
                  );

                  // Pokaż wszystkie odpowiedzi jeśli punkty zostały przekazane
                  const showAll = gameData?.pointsTransferred;

                  return (
                    <div
                      key={index}
                      className={`answer-card ${revealed || showAll ? "revealed" : "hidden"}`}
                    >
                      {revealed || showAll ? (
                        <>
                          <div className="answer-content">
                            <span className="answer-number">{index + 1}.</span>
                            <span className="answer-text">{answer.answer}</span>
                          </div>
                          <span className="answer-points">
                            {revealed ? revealed.points : answer.points}
                          </span>
                        </>
                      ) : (
                        <div className="answer-placeholder">{index + 1}.</div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* 4-ty błąd po prawej (druga drużyna) */}
              <div className="wrong-answers-right">
                <div
                  className={`wrong-x-box ${(gameData?.wrongAnswersCount || 0) >= 4 ? "active" : ""}`}
                >
                  {(gameData?.wrongAnswersCount || 0) >= 4 && (
                    <span className="wrong-x-large">
                      <PiXBold />
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Małe X-y pod odpowiedziami (tylko mobile) */}
            <div className="wrong-answers-mobile">
              <div className="wrong-answers-mobile-left">
                {Array.from({ length: 3 }).map((_, i) => {
                  const isActive =
                    i < Math.min(gameData?.wrongAnswersCount || 0, 3);
                  return (
                    <div
                      key={i}
                      className={`wrong-x-box-mobile ${isActive ? "active" : ""}`}
                    >
                      {isActive && (
                        <span className="wrong-x-small">
                          <PiXBold />
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="wrong-answers-mobile-right">
                <div
                  className={`wrong-x-box-mobile ${(gameData?.wrongAnswersCount || 0) >= 4 ? "active" : ""}`}
                >
                  {(gameData?.wrongAnswersCount || 0) >= 4 && (
                    <span className="wrong-x-small">
                      <PiXBold />
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Informacja o przekazanych punktach */}
            {/* {gameData?.pointsTransferred && gameData?.lastPointsRecipient && (
            <div className="points-transfer-info">
              <div className="transfer-card">
                <h3><PiTrophyFill className="trophy-icon" /> Punkty przekazane!</h3>
                <p><strong>{gameData.lastPointsRecipient}</strong> otrzymują <strong>{gameData.lastPointsAmount}</strong> punktów</p>
              </div>
            </div>
          )} */}

            {/* Pasek statusu */}
            <div className="status-bar">
              <div className="status-item">
                <span className="status-label">Punkty w rundzie:</span>
                <span className="status-value points">
                  {gameData?.totalPoints || 0}
                </span>
              </div>
            </div>
          </div>
        ) : gamePhase === "finished" ? (
          // FAZA 4: Podsumowanie
          <div className="game-summary">
            {(() => {
              const team1Score = gameData?.team1Score || 0;
              const team2Score = gameData?.team2Score || 0;
              const myScore = myTeamNumber === 1 ? team1Score : team2Score;
              const opponentScore =
                myTeamNumber === 1 ? team2Score : team1Score;

              console.log(
                `[PLAYER SUMMARY] Team 1: ${team1Score}, Team 2: ${team2Score}`,
              );
              console.log(
                `[PLAYER SUMMARY] My team: ${myTeamNumber}, My score: ${myScore}, Opponent: ${opponentScore}`,
              );

              if (team1Score === team2Score) {
                return (
                  <h2 className="summary-title">
                    <PiHandshakeFill className="summary-icon" /> Remis!
                  </h2>
                );
              } else if (myScore > opponentScore) {
                return (
                  <h2 className="summary-title winner">
                    <PiConfettiFill className="summary-icon" /> Gratulacje!
                    Wygraliście!
                  </h2>
                );
              } else {
                return (
                  <h2 className="summary-title loser">
                    <PiXCircleFill className="summary-icon" /> Niestety
                    przegraliście
                  </h2>
                );
              }
            })()}

            <div className="summary-scores">
              <div
                className={`team-score-card ${(gameData?.team1Score || 0) > (gameData?.team2Score || 0) ? "winner-team" : ""}`}
              >
                <span className="team-score-name">
                  {gameData?.team1Name || "Drużyna 1"}
                </span>
                <span className="team-score-points">
                  {gameData?.team1Score || 0}
                </span>
              </div>
              <div
                className={`team-score-card ${(gameData?.team2Score || 0) > (gameData?.team1Score || 0) ? "winner-team" : ""}`}
              >
                <span className="team-score-name">
                  {gameData?.team2Name || "Drużyna 2"}
                </span>
                <span className="team-score-points">
                  {gameData?.team2Score || 0}
                </span>
              </div>
            </div>

            <p style={{ marginTop: "2rem", color: "rgba(233, 196, 106, 0.8)" }}>
              Czekaj na decyzję prowadzącego...
            </p>
          </div>
        ) : null}
      </div>
    </>
  );
}
