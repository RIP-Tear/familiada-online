"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/redux/hooks";
import {
  getAvailableCategories,
  getQuestionsByCategory,
} from "@/utils/questions";
import {
  selectCategory,
  subscribeToGame,
  resetBuzz,
  startGameBoard,
  revealAnswer,
  addWrongAnswer,
  resetWrongAnswers,
  toggleWarning,
  updateWarningCountdown,
  showWrongAnswerAlert,
  showNextQuestionAlert,
  showGameResultAlert,
  transferPointsToTeam,
  nextQuestion,
  endGame,
  restartGame,
} from "@/utils/firebaseUtils";
import {
  PiGameControllerFill,
  PiSpeakerHighFill,
  PiClockCountdownFill,
  PiLightningFill,
  PiArrowRightBold,
  PiArrowClockwiseBold,
  PiXBold,
  PiWarningFill,
  PiTrophyFill,
  PiFlagCheckeredFill,
  PiHandshakeFill,
  PiXCircleFill,
  PiStarFill,
  PiCheckBold,
  PiNumberCircleOneFill,
  PiNumberCircleTwoFill,
  PiChartBarFill,
  PiQuestionFill,
  PiUsersFill,
} from "react-icons/pi";
import { Navbar, Modal } from "@/components";
import "@/styles/game.scss";
import "@/styles/board.scss";

export default function HostGamePage() {
  const router = useRouter();
  const { gameCode, teams } = useAppSelector((state) => state.game);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [buzzedTeam, setBuzzedTeam] = useState(null);
  const [gamePhase, setGamePhase] = useState("category-selection"); // "category-selection" | "buzz" | "playing" | "finished"
  const [gameData, setGameData] = useState(null);
  const [warningInterval, setWarningInterval] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedTeamForTransfer, setSelectedTeamForTransfer] = useState(null);
  const [buzzProcessing, setBuzzProcessing] = useState(false);
  const buzzDelayTimeoutRef = useRef(null);
  const [showCategoryConfirmModal, setShowCategoryConfirmModal] =
    useState(false);
  const [pendingCategory, setPendingCategory] = useState(null);

  useEffect(() => {
    if (!gameCode) {
      router.push("/home");
      return;
    }

    // Załaduj dostępne kategorie
    const availableCategories = getAvailableCategories();
    setCategories(availableCategories);

    // Nasłuchuj zmian w grze
    const unsubscribe = subscribeToGame(gameCode, (data) => {
      setGameData(data);

      if (data.selectedCategory && !selectedCategory) {
        setSelectedCategory(data.selectedCategory);

        // Załaduj pytania dla wybranej kategorii
        const categoryQuestions = getQuestionsByCategory(data.selectedCategory);
        setQuestions(categoryQuestions);

        if (categoryQuestions.length > 0) {
          const questionIndex = data.currentQuestionIndex || 0;
          setCurrentQuestion(categoryQuestions[questionIndex]);
        }
      }

      // Aktualizuj fazę gry
      if (data.gamePhase) {
        setGamePhase(data.gamePhase);
      }

      // Aktualizuj obecne pytanie przy zmianie indeksu
      if (data.currentQuestionIndex !== undefined && questions.length > 0) {
        setCurrentQuestion(questions[data.currentQuestionIndex]);
      }

      // Aktualizuj stan przycisku buzz z krótkim opóźnieniem dla stabilności wizualnej
      if (data.buzzedTeamName) {
        if (!buzzedTeam) {
          // Nowy buzz - pokaż "przetwarzanie" przez krótką chwilę
          setBuzzProcessing(true);

          // Wyczyść poprzedni timeout jeśli istnieje
          if (buzzDelayTimeoutRef.current) {
            clearTimeout(buzzDelayTimeoutRef.current);
          }

          buzzDelayTimeoutRef.current = setTimeout(() => {
            setBuzzedTeam(data.buzzedTeamName);
            setBuzzProcessing(false);
            buzzDelayTimeoutRef.current = null;
          }, 300);
        }
      } else {
        // Reset wszystkiego
        if (buzzDelayTimeoutRef.current) {
          clearTimeout(buzzDelayTimeoutRef.current);
          buzzDelayTimeoutRef.current = null;
        }
        setBuzzedTeam(null);
        setBuzzProcessing(false);
      }

      // Obsługa ostrzeżenia
      if (data.warningActive && !warningInterval) {
        handleWarningCountdown(data.warningCountdown || 3);
      } else if (!data.warningActive && warningInterval) {
        clearInterval(warningInterval);
        setWarningInterval(null);
      }
    });

    return () => {
      unsubscribe && unsubscribe();
      if (warningInterval) {
        clearInterval(warningInterval);
      }
      if (buzzDelayTimeoutRef.current) {
        clearTimeout(buzzDelayTimeoutRef.current);
      }
    };
  }, [
    gameCode,
    router,
    selectedCategory,
    questions,
    warningInterval,
    buzzedTeam,
  ]);

  // Cleanup przy unmount
  useEffect(() => {
    return () => {
      if (buzzDelayTimeoutRef.current) {
        clearTimeout(buzzDelayTimeoutRef.current);
      }
    };
  }, []);

  const handleSelectCategory = async (category) => {
    if (isSelecting) return;

    setPendingCategory(category);
    setShowCategoryConfirmModal(true);
  };

  const confirmCategorySelection = async () => {
    setIsSelecting(true);

    try {
      await selectCategory(gameCode, pendingCategory);
      console.log(`[HOST] Selected category: ${pendingCategory}`);
      setShowCategoryConfirmModal(false);
      setPendingCategory(null);
    } catch (error) {
      console.error("[HOST] Error selecting category:", error);
      setIsSelecting(false);
    }
  };

  const cancelCategorySelection = () => {
    setShowCategoryConfirmModal(false);
    setPendingCategory(null);
  };

  const handleResetBuzz = async () => {
    try {
      await resetBuzz(gameCode);
      console.log("[HOST] Buzz reset");
    } catch (error) {
      console.error("[HOST] Error resetting buzz:", error);
    }
  };

  const handleStartGameBoard = async () => {
    try {
      await startGameBoard(gameCode);
      console.log("[HOST] Game board started");
    } catch (error) {
      console.error("[HOST] Error starting game board:", error);
    }
  };

  const handleRevealAnswer = async (answer, points) => {
    try {
      const questionIndex = gameData?.currentQuestionIndex || 0;
      await revealAnswer(gameCode, answer, points, questionIndex);
      console.log(`[HOST] Revealed answer: ${answer} (${points} pts)`);
    } catch (error) {
      console.error("[HOST] Error revealing answer:", error);
    }
  };

  const handleWrongAnswer = async () => {
    try {
      await addWrongAnswer(gameCode);
      const newCount = (gameData?.wrongAnswersCount || 0) + 1;
      await showWrongAnswerAlert(gameCode, newCount);
      console.log("[HOST] Wrong answer added and alert shown");
    } catch (error) {
      console.error("[HOST] Error adding wrong answer:", error);
    }
  };

  const handleResetWrong = async () => {
    try {
      await resetWrongAnswers(gameCode);
      console.log("[HOST] Wrong answers reset");
    } catch (error) {
      console.error("[HOST] Error resetting wrong answers:", error);
    }
  };

  const handleToggleWarning = async () => {
    try {
      const isActive = gameData?.warningActive || false;
      
      if (isActive) {
        // Zatrzymaj ostrzeżenie natychmiast
        if (warningInterval) {
          clearInterval(warningInterval);
          setWarningInterval(null);
        }
        await toggleWarning(gameCode, false);
        console.log("[HOST] Warning stopped");
      } else {
        // Uruchom ostrzeżenie z progress barem
        await toggleWarning(gameCode, true);
        handleWarningCountdown(3);
        console.log("[HOST] Warning activated with countdown");
      }
    } catch (error) {
      console.error("[HOST] Error toggling warning:", error);
    }
  };

  const handleWarningCountdown = async (startValue) => {
    let countdown = startValue;
    let progress = 100;

    const interval = setInterval(async () => {
      countdown -= 0.1;
      progress = (countdown / startValue) * 100;

      if (countdown <= 0) {
        clearInterval(interval);
        setWarningInterval(null);
        await toggleWarning(gameCode, false);
        return;
      }

      await updateWarningCountdown(gameCode, countdown);
    }, 100);

    setWarningInterval(interval);
  };

  const handleTransferPoints = async (teamIndex) => {
    setSelectedTeamForTransfer(teamIndex);
    setShowConfirmModal(true);
  };

  const confirmTransferPoints = async () => {
    try {
      await transferPointsToTeam(gameCode, selectedTeamForTransfer);
      console.log(
        `[HOST] Points transferred to team ${selectedTeamForTransfer}`
      );
      setShowConfirmModal(false);
      // Opóźnij reset selectedTeamForTransfer, aby animacja zamykania mogła się zakończyć
      setTimeout(() => {
        setSelectedTeamForTransfer(null);
      }, 300);
    } catch (error) {
      console.error("[HOST] Error transferring points:", error);
    }
  };

  const cancelTransferPoints = () => {
    setShowConfirmModal(false);
    // Opóźnij reset selectedTeamForTransfer, aby animacja zamykania mogła się zakończyć
    setTimeout(() => {
      setSelectedTeamForTransfer(null);
    }, 300);
  };

  const handleNextQuestion = async () => {
    try {
      const isLastQuestion = (gameData?.currentQuestionIndex || 0) === 4;

      if (isLastQuestion) {
        // Jeśli to ostatnie pytanie, pokaż alert przed przejściem do podsumowania
        await showGameResultAlert(gameCode);
        // Poczekaj 3.5s na wyświetlenie alertu, potem przejdź do podsumowania
        setTimeout(async () => {
          await nextQuestion(gameCode);
          console.log("[HOST] Moved to summary");
        }, 3500);
      } else {
        // Dla pozostałych pytań pokaż normalny alert "Następne pytanie"
        await showNextQuestionAlert(gameCode);
        // Poczekaj 2.5s na wyświetlenie alertu, potem przejdź do następnego pytania
        setTimeout(async () => {
          await nextQuestion(gameCode);
          console.log("[HOST] Moved to next question");
        }, 2500);
      }
    } catch (error) {
      console.error("[HOST] Error moving to next question:", error);
    }
  };

  const handleEndGame = async () => {
    try {
      await endGame(gameCode);
      console.log("[HOST] Game ended");
      router.push("/home");
    } catch (error) {
      console.error("[HOST] Error ending game:", error);
    }
  };

  const handleRestartGame = async () => {
    try {
      await restartGame(gameCode);
      console.log("[HOST] Game restarted");
      // Reset local state
      setSelectedCategory(null);
      setIsSelecting(false);
      setCurrentQuestion(null);
      setBuzzedTeam(null);
      setGamePhase("category-selection");
    } catch (error) {
      console.error("[HOST] Error restarting game:", error);
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
      <Navbar />
      <div className="game-container">
        {/* Modal potwierdzenia wyboru kategorii */}
        <Modal isOpen={showCategoryConfirmModal} onClose={cancelCategorySelection}>
          <div className="modal-icon">
            <PiQuestionFill />
          </div>
          <h2 className="modal-title">
            Potwierdzenie wyboru kategorii
          </h2>
          <p className="modal-description">
            Czy na pewno chcesz wybrać kategorię:
          </p>
          <div className="modal-category">
            {(() => {
              const selectedCat = categories.find(
                (c) => c.category === pendingCategory
              );
              return (
                <>
                  <div className="modal-category-stars">
                    {getDifficultyStars(selectedCat?.difficulty)}
                  </div>
                  <div className="modal-category-name">
                    {pendingCategory}
                  </div>
                </>
              );
            })()}
          </div>
          <p className="modal-warning">
            <PiWarningFill /> Będzie można zmienić kategorię dopiero po
            zakończeniu gry.
          </p>
          <div className="modal-buttons">
            <button
              className="modal-btn confirm-no"
              onClick={cancelCategorySelection}
            >
              <PiXBold /> Nie, anuluj
            </button>
            <button
              className="modal-btn confirm-yes"
              onClick={confirmCategorySelection}
            >
              <PiCheckBold /> Tak, wybierz kategorię
            </button>
          </div>
        </Modal>

        {/* Modal potwierdzenia przekazania punktów */}
        <Modal isOpen={showConfirmModal} onClose={cancelTransferPoints}>
          <div className="modal-icon">
            <PiQuestionFill />
          </div>
          <h2 className="modal-title">
            Potwierdzenie przekazania punktów
          </h2>
          <p className="modal-message">
            Czy na pewno chcesz przekazać{" "}
            <strong>{gameData?.totalPoints || 0} punktów</strong> drużynie
          </p>
          <p className="modal-team">
            <PiTrophyFill />{" "}
            {selectedTeamForTransfer === 1
              ? gameData?.team1Name
              : gameData?.team2Name}
          </p>
          <p className="modal-warning">
            <PiWarningFill /> Później nie będzie można tego zmienić podczas
            gry
          </p>
          <div className="modal-buttons">
            <button
              className="modal-btn confirm-no"
              onClick={cancelTransferPoints}
            >
              <PiXBold /> Nie, anuluj
            </button>
            <button
              className="modal-btn confirm-yes"
              onClick={confirmTransferPoints}
            >
              <PiCheckBold /> Tak, przekaż punkty
            </button>
          </div>
        </Modal>

        {/* Overlay błędnej odpowiedzi */}
        {gameData?.wrongAnswerAlert && (
          <div className="wrong-answer-overlay">
            <div className="wrong-answer-content">
              <PiXCircleFill className="wrong-answer-icon" />
              <h2 className="wrong-answer-text">Błędna odpowiedź!</h2>
              {gameData?.wrongAnswerCount < 4 && (
                <p className="wrong-answer-count">{gameData?.wrongAnswerCount} {gameData?.wrongAnswerCount === 1 ? 'błąd' : 'błędy'}</p>
              )}
            </div>
          </div>
        )}

        {/* Overlay narady drużyny przeciwnej (po 2 błędzie) */}
        {gameData?.opponentConsultationAlert && (
          <div className="wrong-answer-overlay consultation-warning">
            <div className="wrong-answer-content">
              <PiUsersFill className="wrong-answer-icon" />
              <h2 className="wrong-answer-text">Drużyna przeciwna się naradza...</h2>
            </div>
          </div>
        )}

        {/* Overlay przejścia pytania do przeciwnej drużyny (po 3 błędzie) */}
        {gameData?.transferQuestionAlert && (
          <div className="wrong-answer-overlay transfer-warning">
            <div className="wrong-answer-content">
              <PiLightningFill className="wrong-answer-icon" />
              <h2 className="wrong-answer-text">Pytanie przechodzi do przeciwnej drużyny!</h2>
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

        {/* Overlay wyniku końcowego gry dla prowadzącego */}
        {gameData?.gameResultAlert && (
          <div className="wrong-answer-overlay next-question">
            <div className="wrong-answer-content">
              <PiFlagCheckeredFill className="wrong-answer-icon" />
              <h2 className="wrong-answer-text">Przejście do podsumowania!</h2>
            </div>
          </div>
        )}

        <div className="game-header">
          <h1 className="header-title">
            {gamePhase === "category-selection"
              ? "Wybierz zestaw pytań"
              : gamePhase === "buzz"
              ? (gameData?.currentQuestionIndex || 0) === 4
                ? "Ostatnie pytanie"
                : `Pytanie ${(gameData?.currentQuestionIndex || 0) + 1}`
              : gamePhase === "playing"
              ? (gameData?.currentQuestionIndex || 0) === 4
                ? "Ostatnie pytanie"
                : `Pytanie ${(gameData?.currentQuestionIndex || 0) + 1}`
              : "Podsumowanie"}
          </h1>
          <div className="header-team">Prowadzący</div>
        </div>

        {gamePhase === "category-selection" ? (
          // FAZA 1: Wybór kategorii
          <div className="category-selection">
            <p className="instruction">
              Jako prowadzący, wybierz kategorię pytań dla tej gry:
            </p>

            <div className="categories-grid">
              {categories.map((cat, index) => {
                // Znajdź drużyny, które zagłosowały na tę kategorię
                const votedTeams = [];
                if (gameData?.categoryVotes) {
                  Object.entries(gameData.categoryVotes).forEach(
                    ([teamId, votedCategory]) => {
                      if (votedCategory === cat.category) {
                        // Znajdź nazwę drużyny
                        const teamName =
                          gameData.teams?.find((t) => t.id === teamId)?.name ||
                          "Drużyna";
                        votedTeams.push(teamName);
                      }
                    }
                  );
                }

                return (
                  <div
                    key={index}
                    className={`category-card ${
                      selectedCategory === cat.category ? "selected" : ""
                    } ${votedTeams.length > 0 ? "has-votes" : ""}`}
                    onClick={() => handleSelectCategory(cat.category)}
                  >
                    <div className="category-icon">
                      {getDifficultyStars(cat.difficulty)}
                    </div>
                    <h3 className="category-name">{cat.category}</h3>
                    <p className="category-difficulty">
                      {getDifficultyLabel(cat.difficulty)}
                    </p>
                    {votedTeams.length > 0 && (
                      <div className="vote-teams-badge">
                        <PiCheckBold /> {votedTeams.join(", ")}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {selectedCategory && (
              <div className="selection-info">
                <p>
                  <PiCheckBold className="check-icon" /> Wybrano:{" "}
                  <strong>{selectedCategory}</strong>
                </p>
                <p className="waiting-text">Ładowanie gry...</p>
              </div>
            )}
          </div>
        ) : gamePhase === "buzz" ? (
          // FAZA 2: Pytanie buzz
          <div className="buzz-round">
            {/* Informacja o podwojonych punktach - tylko dla ostatniego pytania */}
            {(gameData?.currentQuestionIndex || 0) === 4 && (
              <div className="doubled-points-card">
                <div className="doubled-points-icon">⚡</div>
                <div className="doubled-points-content">
                  <h3 className="doubled-points-title">PODWOJONE PUNKTY!</h3>
                  <p className="doubled-points-text">
                    Punkty w tej rundzie są liczone x2
                  </p>
                </div>
              </div>
            )}

            <div className="host-question-card">
              <h2 className="question-text">{currentQuestion?.question}</h2>
              <p className="host-instruction">
                <PiSpeakerHighFill className="instruction-icon" /> Przeczytaj
                pytanie na głos drużynom
              </p>
            </div>

            <div className="buzz-status">
              {buzzProcessing ? (
                <div className="waiting-buzz processing">
                  <div className="pulse-animation">
                    <PiClockCountdownFill />
                  </div>
                  <p>Przetwarzanie...</p>
                </div>
              ) : buzzedTeam ? (
                <div className="buzzed-info">
                  <div className="buzzed-info-content">
                    <div className="buzzed-label">
                      <PiLightningFill className="buzzed-icon" />
                      <span>Drużyna która wcisnęła pierwsza:</span>
                    </div>
                    <div className="team-name-display">{buzzedTeam}</div>
                  </div>
                </div>
              ) : (
                <div className="waiting-buzz">
                  <div className="pulse-animation">
                    <PiClockCountdownFill />
                  </div>
                  <p>Czekam na naciśnięcie przycisku przez drużyny...</p>
                </div>
              )}
            </div>

            <div className="buzz-controls">
              <button className="btn-reset" onClick={handleResetBuzz}>
                <PiArrowClockwiseBold /> Reset przycisku
              </button>
              <button
                className="btn-start-board"
                onClick={handleStartGameBoard}
                disabled={!buzzedTeam}
              >
                <PiArrowRightBold /> Przejdź do tablicy
              </button>
            </div>
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
                  const isActive = i < Math.min(gameData?.wrongAnswersCount || 0, 3);
                  return (
                    <div key={i} className={`wrong-x-box ${isActive ? 'active' : ''}`}>
                      {isActive && (
                        <span className="wrong-x-large">
                          <PiXBold />
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Siatka odpowiedzi */}
              <div className="answers-grid">
                {currentQuestion?.answers.map((answer, index) => {
                  const isRevealed = gameData?.revealedAnswers?.some(
                    (revealed) => revealed.answer === answer.answer
                  );

                  // Pokaż prawidłowe punkty (podwojone dla pytania 5)
                  const questionIndex = gameData?.currentQuestionIndex || 0;
                  const multiplier = questionIndex === 4 ? 2 : 1;
                  const displayPoints = answer.points * multiplier;

                  return (
                    <div
                      key={index}
                      className={`answer-card ${isRevealed ? "revealed" : ""} ${
                        gameData?.pointsTransferred ? "disabled" : ""
                      }`}
                      onClick={() =>
                        !isRevealed &&
                        !gameData?.pointsTransferred &&
                        handleRevealAnswer(answer.answer, answer.points)
                      }
                    >
                      <div className="answer-content">
                        <span className="answer-number">{index + 1}.</span>
                        <span className="answer-text">{answer.answer}</span>
                      </div>
                      <span className="answer-points">{displayPoints}</span>
                    </div>
                  );
                })}
              </div>

              {/* 4-ty błąd po prawej (druga drużyna) */}
              <div className="wrong-answers-right">
                <div className={`wrong-x-box ${(gameData?.wrongAnswersCount || 0) >= 4 ? 'active' : ''}`}>
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
                  const isActive = i < Math.min(gameData?.wrongAnswersCount || 0, 3);
                  return (
                    <div key={i} className={`wrong-x-box-mobile ${isActive ? 'active' : ''}`}>
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
                <div className={`wrong-x-box-mobile ${(gameData?.wrongAnswersCount || 0) >= 4 ? 'active' : ''}`}>
                  {(gameData?.wrongAnswersCount || 0) >= 4 && (
                    <span className="wrong-x-small">
                      <PiXBold />
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Panel kontrolny */}
            <div className="host-controls">
              <div className="status-bar">
                <div className="status-item">
                  <span className="status-label">Punkty w rundzie:</span>
                  <span className="status-value points">
                    {gameData?.totalPoints || 0}
                  </span>
                </div>
              </div>

              <div className="controls-section">
                <button
                  className="control-btn btn-wrong"
                  onClick={handleWrongAnswer}
                  disabled={gameData?.pointsTransferred}
                >
                  <PiXCircleFill /> Błędna odpowiedź
                </button>
                {gameData?.warningActive ? (
                  <div className="warning-progress-container">
                    <button
                      className="control-btn btn-warning warning-active"
                      onClick={handleToggleWarning}
                    >
                      <PiWarningFill /> Zatrzymaj ostrzeżenie
                    </button>
                    <div className="warning-progress-bar">
                      <div 
                        className="warning-progress-fill"
                        style={{
                          width: `${((gameData?.warningCountdown || 0) / 3) * 100}%`,
                          transition: 'width 0.1s linear'
                        }}
                      />
                    </div>
                  </div>
                ) : (
                  <button
                    className="control-btn btn-warning"
                    onClick={handleToggleWarning}
                    disabled={gameData?.pointsTransferred}
                  >
                    <PiWarningFill /> Ostrzeżenie
                  </button>
                )}
                <button
                  className="control-btn btn-reset-wrong"
                  onClick={handleResetWrong}
                  disabled={gameData?.pointsTransferred}
                >
                  <PiArrowClockwiseBold /> Reset błędnych
                </button>
              </div>

              <div className="controls-section">
                <button
                  className="control-btn btn-transfer"
                  onClick={() => handleTransferPoints(1)}
                  disabled={gameData?.pointsTransferred}
                >
                  <PiTrophyFill /> Przekaż punkty -{" "}
                  {gameData?.team1Name || "Drużyna 1"}
                </button>
                <button
                  className="control-btn btn-transfer"
                  onClick={() => handleTransferPoints(2)}
                  disabled={gameData?.pointsTransferred}
                >
                  <PiTrophyFill /> Przekaż punkty -{" "}
                  {gameData?.team2Name || "Drużyna 2"}
                </button>
              </div>

              <div className="controls-section">
                {(gameData?.currentQuestionIndex || 0) < 4 ? (
                  <button
                    className="control-btn btn-next-question"
                    onClick={handleNextQuestion}
                    disabled={!gameData?.pointsTransferred}
                  >
                    <PiArrowRightBold /> Następne pytanie
                  </button>
                ) : (
                  <button
                    className="control-btn btn-summary"
                    onClick={handleNextQuestion}
                    disabled={!gameData?.pointsTransferred}
                  >
                    <PiFlagCheckeredFill /> Przejdź do podsumowania
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : gamePhase === "finished" ? (
          // FAZA 4: Podsumowanie
          <div className="game-summary">
            {(() => {
              const team1Score = gameData?.team1Score || 0;
              const team2Score = gameData?.team2Score || 0;
              console.log(`[SUMMARY HOST] ====== GAME SUMMARY ======`);
              console.log(`[SUMMARY HOST] Full gameData:`, gameData);
              console.log(
                `[SUMMARY HOST] Final Scores - Team 1: ${team1Score}, Team 2: ${team2Score}`
              );
              console.log(
                `[SUMMARY HOST] Current question index: ${gameData?.currentQuestionIndex}`
              );
              console.log(
                `[SUMMARY HOST] Total points in round: ${
                  gameData?.totalPoints || 0
                }`
              );
              console.log(`[SUMMARY HOST] ========================`);

              if (team1Score === team2Score) {
                return (
                  <h2 className="summary-title">
                    <PiHandshakeFill className="summary-icon" /> Remis!
                  </h2>
                );
              } else {
                return (
                  <h2 className="summary-title">
                    <PiFlagCheckeredFill className="summary-icon" /> Koniec Gry!
                  </h2>
                );
              }
            })()}

            <div className="summary-scores">
              <div
                className={`team-score-card ${
                  (gameData?.team1Score || 0) > (gameData?.team2Score || 0)
                    ? "winner-team"
                    : ""
                }`}
              >
                <span className="team-score-name">
                  {gameData?.team1Name || "Drużyna 1"}
                </span>
                <span className="team-score-points">
                  {gameData?.team1Score || 0}
                </span>
              </div>
              <div
                className={`team-score-card ${
                  (gameData?.team2Score || 0) > (gameData?.team1Score || 0)
                    ? "winner-team"
                    : ""
                }`}
              >
                <span className="team-score-name">
                  {gameData?.team2Name || "Drużyna 2"}
                </span>
                <span className="team-score-points">
                  {gameData?.team2Score || 0}
                </span>
              </div>
            </div>

            <div className="summary-actions">
              <button
                className="control-btn btn-next-question"
                onClick={handleRestartGame}
              >
                <PiArrowClockwiseBold /> Nowa gra
              </button>
              <button className="control-btn btn-wrong" onClick={handleEndGame}>
                <PiXCircleFill /> Zakończ prowadzenie
              </button>
            </div>
          </div>
        ) : null}

        {/* Overlaye usunięte dla hosta - tylko drużyny widzą */}
      </div>
    </>
  );
}
