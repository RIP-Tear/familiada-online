"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/redux/hooks";
import {
  getAvailableCategories,
  getQuestionsByCategory,
} from "@/utils/questions";
import { gameHistoryStorage } from "@/utils/gameHistoryStorage";
import {
  selectCategory,
  subscribeToGame,
  resetBuzz,
  revealQuestion,
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
  hostLeftGame,
  showNewGameAlert,
  setCreatingCustomCategory,
  saveCustomCategory,
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
  PiCheckCircleFill,
  PiShuffleFill,
  PiPlusCircleFill,
} from "react-icons/pi";
import { Navbar, Modal, Button } from "@/components";
import "@/styles/game.scss";
import "@/styles/board.scss";

export default function HostGamePage() {
  const router = useRouter();
  const { gameCode, teams } = useAppSelector((state) => state.game);
  const [categories, setCategories] = useState([]);
  const [usedCategories, setUsedCategories] = useState<string[]>([]);
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
  
  // Stan dla tworzenia własnej kategorii
  const [isCreatingCustom, setIsCreatingCustom] = useState(false);
  const [customCategoryName, setCustomCategoryName] = useState('');
  const [customDifficulty, setCustomDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [customQuestions, setCustomQuestions] = useState(Array.from({ length: 5 }, () => ({
    question: '',
    answers: ['', '', '']
  })));

  useEffect(() => {
    if (!gameCode) {
      router.push("/gra/");
      return;
    }

    // Załaduj dostępne kategorie
    const availableCategories = getAvailableCategories();
    setCategories(availableCategories);
    
    // Załaduj użyte kategorie z localStorage
    const used = gameHistoryStorage.getUsedCategories(gameCode);
    setUsedCategories(used);
    console.log(`[HOST] Loaded ${used.length} used categories for game ${gameCode}:`, used);

    // Nasłuchuj zmian w grze
    const unsubscribe = subscribeToGame(gameCode, (data) => {
      setGameData(data);
      
      // Zawsze aktualizuj listę kategorii jeśli jest custom category
      if (data.customCategory) {
        console.log('[HOST] 🎯 Custom category detected:', data.customCategory.category);
        const availableCategories = getAvailableCategories();
        const customCat = {
          category: data.customCategory.category,
          difficulty: data.customCategory.difficulty
        };
        
        // Usuń duplikat jeśli istnieje i dodaj na początek
        const filteredCategories = availableCategories.filter(c => c.category !== customCat.category);
        const newCategories = [customCat, ...filteredCategories];
        console.log('[HOST] 📋 Categories updated - custom at top, total:', newCategories.length);
        setCategories(newCategories);
      } else {
        // Jeśli nie ma custom category, resetuj do normalnych kategorii
        const availableCategories = getAvailableCategories();
        setCategories(availableCategories);
      }

      if (data.selectedCategory && !selectedCategory) {
        setSelectedCategory(data.selectedCategory);

        // Sprawdź czy to custom category
        if (data.customCategory && data.selectedCategory === data.customCategory.category) {
          // Użyj pytań z custom category
          const customQuestions = data.customCategory.questions.map((q: any, idx: number) => ({
            question: q.question,
            answers: q.answers.map((a: string, aIdx: number) => ({
              answer: a,
              points: (q.answers.length - aIdx) * 10 // Punkty od najwyższych do najniższych
            }))
          }));
          setQuestions(customQuestions);
          
          if (customQuestions.length > 0) {
            setCurrentQuestion(customQuestions[0]);
          }
        } else {
          // Załaduj pytania z normalnej kategorii
          const categoryQuestions = getQuestionsByCategory(data.selectedCategory);
          setQuestions(categoryQuestions);

          if (categoryQuestions.length > 0) {
            const questionIndex = data.currentQuestionIndex || 0;
            setCurrentQuestion(categoryQuestions[questionIndex]);
          }
        }
      }

      // Aktualizuj fazę gry
      if (data.gamePhase) {
        setGamePhase(data.gamePhase);
        
        // Jeśli wróciliśmy do wyboru kategorii, resetuj stan tworzenia
        if (data.gamePhase === 'category-selection') {
          setIsCreatingCustom(false);
        }
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

  // Osobny useEffect dla przekierowania gdy drużyna opuściła grę
  useEffect(() => {
    if (gameData?.teamLeftAlert) {
      const redirectTimer = setTimeout(() => {
        router.push('/gra/');
      }, 3000);
      return () => clearTimeout(redirectTimer);
    }
  }, [gameData?.teamLeftAlert, router]);

  const handleSelectCategory = async (category, isRandomlySelected = false) => {
    if (isSelecting) return;
    setIsSelecting(true);

    try {
      await selectCategory(gameCode, category, isRandomlySelected);
      
      // Zapisz wybraną kategorię lokalnie
      gameHistoryStorage.addUsedCategory(gameCode, category);
      
      // Aktualizuj stan używanych kategorii
      setUsedCategories(prev => [...prev, category]);
      
      console.log(`[HOST] Selected category: ${category}`);
    } catch (error) {
      console.error("[HOST] Error selecting category:", error);
      setIsSelecting(false);
    }
  };

  const handleCreateCustomCategory = async () => {
    try {
      // Ustaw status tworzenia własnej kategorii
      await setCreatingCustomCategory(gameCode);
      setIsCreatingCustom(true);
      console.log("[HOST] Starting custom category creation");
    } catch (error) {
      console.error("[HOST] Error starting custom category:", error);
    }
  };

  const handleSaveCustomCategory = async () => {
    // Walidacja - nazwa kategorii
    if (!customCategoryName.trim()) {
      alert('Wprowadź nazwę kategorii');
      return;
    }
    
    // Walidacja - wszystkie pytania i odpowiedzi
    for (let i = 0; i < customQuestions.length; i++) {
      const q = customQuestions[i];
      
      // Sprawdź czy pytanie jest wypełnione
      if (!q.question.trim()) {
        alert(`Pytanie ${i + 1}: Wprowadź treść pytania`);
        return;
      }
      
      // Sprawdź ilość wypełnionych odpowiedzi
      const validAnswers = q.answers.filter(a => a.trim() !== '');
      if (validAnswers.length < 3) {
        alert(`Pytanie ${i + 1}: Minimum 3 wypełnione odpowiedzi (obecnie: ${validAnswers.length})`);
        return;
      }
    }
    
    try {
      // Przygotuj kategorię - tylko wypełnione odpowiedzi
      const customCategory = {
        category: customCategoryName.trim(),
        difficulty: customDifficulty,
        questions: customQuestions.map(q => ({
          question: q.question.trim(),
          answers: q.answers.filter(a => a.trim() !== '').map(a => a.trim())
        }))
      };
      
      console.log("[HOST] Saving custom category:", customCategory);
      
      // Zapisz kategorię
      await saveCustomCategory(gameCode, customCategory);
      setIsCreatingCustom(false);
      
      console.log("[HOST] ✅ Custom category saved successfully");
    } catch (error) {
      console.error("[HOST] ❌ Error saving custom category:", error);
      alert('Błąd podczas zapisywania kategorii');
    }
  };

  const handleCancelCustomCategory = async () => {
    setIsCreatingCustom(false);
    // Powrót do wyboru kategorii
    await saveCustomCategory(gameCode, null);
  };

  const handleAddAnswer = (questionIndex: number) => {
    if (customQuestions[questionIndex].answers.length >= 10) {
      alert('Maksymalnie 10 odpowiedzi na pytanie');
      return;
    }
    
    const newQuestions = [...customQuestions];
    newQuestions[questionIndex].answers.push('');
    setCustomQuestions(newQuestions);
  };

  const handleRemoveAnswer = (questionIndex: number, answerIndex: number) => {
    if (customQuestions[questionIndex].answers.length <= 3) {
      alert('Minimum 3 odpowiedzi na pytanie');
      return;
    }
    
    const newQuestions = [...customQuestions];
    newQuestions[questionIndex].answers.splice(answerIndex, 1);
    setCustomQuestions(newQuestions);
  };

  const handleMoveAnswer = (questionIndex: number, answerIndex: number, direction: 'up' | 'down') => {
    const newQuestions = [...customQuestions];
    const answers = newQuestions[questionIndex].answers;
    
    if (direction === 'up' && answerIndex > 0) {
      [answers[answerIndex], answers[answerIndex - 1]] = [answers[answerIndex - 1], answers[answerIndex]];
    } else if (direction === 'down' && answerIndex < answers.length - 1) {
      [answers[answerIndex], answers[answerIndex + 1]] = [answers[answerIndex + 1], answers[answerIndex]];
    }
    
    setCustomQuestions(newQuestions);
  };

  const handleCategoryAction = async () => {
    // Zbierz kategorie zagłosowane przez drużyny
    const votedCategories = [];
    const categoryVotesMap = new Map();
    
    if (gameData?.categoryVotes) {
      Object.entries(gameData.categoryVotes).forEach(([teamId, category]) => {
        votedCategories.push(category);
        if (!categoryVotesMap.has(category)) {
          categoryVotesMap.set(category, []);
        }
        categoryVotesMap.get(category).push(teamId);
      });
    }
    
    const uniqueCategories = Array.from(new Set(votedCategories));
    
    if (uniqueCategories.length === 0) return;
    
    // Jeśli obie drużyny wybrały tę samą kategorię
    if (uniqueCategories.length === 1) {
      await handleSelectCategory(uniqueCategories[0], false);
    } else {
      // Losuj kategorię
      const randomCategory = uniqueCategories[
        Math.floor(Math.random() * uniqueCategories.length)
      ];
      await handleSelectCategory(randomCategory, true);
    }
  };

  const handleResetBuzz = async () => {
    try {
      await resetBuzz(gameCode);
      console.log("[HOST] Buzz reset");
    } catch (error) {
      console.error("[HOST] Error resetting buzz:", error);
    }
  };

  const handleRevealQuestion = async () => {
    try {
      await revealQuestion(gameCode);
      console.log("[HOST] Question revealed");
    } catch (error) {
      console.error("[HOST] Error revealing question:", error);
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

  const handleHostLeaveGame = async () => {
    try {
      await hostLeftGame(gameCode);
      console.log("[HOST] Host left the game");
      await new Promise(resolve => setTimeout(resolve, 500)); // Poczekaj na zapisanie danych
    } catch (error) {
      console.error("[HOST] Error leaving game:", error);
    }
  };

  const handleRestartGame = async () => {
    try {
      // Pokaż overlay "Nowa gra" przed restartem
      await showNewGameAlert(gameCode);
      
      // Poczekaj 2s na wyświetlenie alertu
      setTimeout(async () => {
        await restartGame(gameCode);
        console.log("[HOST] Game restarted");
        // Reset local state
        setSelectedCategory(null);
        setIsSelecting(false);
        setCurrentQuestion(null);
        setBuzzedTeam(null);
        setGamePhase("category-selection");
      }, 2000);
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
      <Navbar onLeaveGame={handleHostLeaveGame} />
      <div className="game-container">
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

        {/* Overlay wyniku końcowego gry dla prowadzącego */}
        {gameData?.gameResultAlert && (
          <div className="wrong-answer-overlay next-question">
            <div className="wrong-answer-content">
              <PiFlagCheckeredFill className="wrong-answer-icon" />
              <h2 className="wrong-answer-text">Przejście do podsumowania!</h2>
            </div>
          </div>
        )}

        {/* Overlay najwyżej punktowanej odpowiedzi */}
        {gameData?.topAnswerAlert && (
          <div className="wrong-answer-overlay top-answer">
            <div className="wrong-answer-content">
              <PiNumberCircleOneFill className="wrong-answer-icon" />
              <h2 className="wrong-answer-text">Najwyżej punktowana odpowiedź!</h2>
            </div>
          </div>
        )}

        {/* Overlay informacji o buzzowaniu - tylko dla prowadzącego */}
        {gameData?.buzzAlert && (
          <div className="wrong-answer-overlay buzz-alert">
            <div className="wrong-answer-content">
              <PiHandshakeFill className="wrong-answer-icon" />
              <p className="round-winner-name">{gameData?.buzzAlertTeamName}</p>
              <h2 className="wrong-answer-text">byli pierwsi!</h2>
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

        {/* Overlay wybranej kategorii */}
        {gameData?.categorySelectedAlert && (
          <div className="wrong-answer-overlay category-selected">
            <div className="wrong-answer-content">
              <PiCheckCircleFill className="wrong-answer-icon" />
              <h2 className="wrong-answer-text">{gameData?.isCategoryRandomlySelected ? 'Wylosowano' : 'Wybrano'} kategorię</h2>
              <p className="round-winner-name">{gameData?.selectedCategoryName}</p>
            </div>
          </div>
        )}

        {/* Overlay Team VS Team */}
        {gameData?.teamVsAlert && (
          <div className="wrong-answer-overlay team-vs">
            <div className="wrong-answer-content">
              <h2 className="team-vs-name">{gameData?.team1Name || 'Drużyna 1'}</h2>
              <h1 className="team-vs-text">VS</h1>
              <h2 className="team-vs-name">{gameData?.team2Name || 'Drużyna 2'}</h2>
            </div>
          </div>
        )}

        {/* Overlay opuszczenia gry przez drużynę */}
        {gameData?.teamLeftAlert && (
          <div className="wrong-answer-overlay team-left">
            <div className="wrong-answer-content">
              <PiWarningFill className="wrong-answer-icon" />
              <h2 className="wrong-answer-text">{gameData?.teamLeftName}<br />opuścili grę</h2>
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
            {gamePhase === "category-selection"
              ? "Wybieranie kategorii"
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

        {isCreatingCustom ? (
          // FAZA: Tworzenie własnej kategorii
          <div className="custom-category-creator">
            <h2 className="creator-title">Stwórz własną kategorię</h2>
            
            <div className="creator-form">
              <div className="form-group">
                <label>Nazwa kategorii:</label>
                <input
                  type="text"
                  className="form-input"
                  value={customCategoryName}
                  onChange={(e) => setCustomCategoryName(e.target.value)}
                  placeholder="np. Zwierzęta domowe"
                  maxLength={50}
                />
              </div>
              
              <div className="form-group">
                <label>Trudność:</label>
                <div className="difficulty-buttons">
                  <button
                    className={`btn-difficulty ${customDifficulty === 'easy' ? 'active' : ''}`}
                    onClick={() => setCustomDifficulty('easy')}
                  >
                    ⭐ Łatwa
                  </button>
                  <button
                    className={`btn-difficulty ${customDifficulty === 'medium' ? 'active' : ''}`}
                    onClick={() => setCustomDifficulty('medium')}
                  >
                    ⭐⭐ Średnia
                  </button>
                  <button
                    className={`btn-difficulty ${customDifficulty === 'hard' ? 'active' : ''}`}
                    onClick={() => setCustomDifficulty('hard')}
                  >
                    ⭐⭐⭐ Trudna
                  </button>
                </div>
              </div>
              
              <div className="questions-list">
                {customQuestions.map((q, qIdx) => (
                  <div key={qIdx} className="question-block">
                    <h3 className="question-number">Pytanie {qIdx + 1}</h3>
                    <input
                      type="text"
                      className="form-input question-input"
                      value={q.question}
                      onChange={(e) => {
                        const newQuestions = [...customQuestions];
                        newQuestions[qIdx].question = e.target.value;
                        setCustomQuestions(newQuestions);
                      }}
                      placeholder="Wpisz pytanie..."
                      maxLength={200}
                    />
                    
                    <div className="answers-list">
                      <label className="answers-label">Odpowiedzi (kolejność ważna - od najczęstszej do najrzadszej):</label>
                      {q.answers.map((ans, aIdx) => (
                        <div key={aIdx} className="answer-item">
                          <span className="answer-number">{aIdx + 1}.</span>
                          <input
                            type="text"
                            className="form-input answer-input"
                            value={ans}
                            onChange={(e) => {
                              const newQuestions = [...customQuestions];
                              newQuestions[qIdx].answers[aIdx] = e.target.value;
                              setCustomQuestions(newQuestions);
                            }}
                            placeholder="Wpisz odpowiedź..."
                            maxLength={100}
                          />
                          <div className="answer-controls">
                            <button
                              className="btn-answer-control"
                              onClick={() => handleMoveAnswer(qIdx, aIdx, 'up')}
                              disabled={aIdx === 0}
                              title="Przesuń w górę"
                            >
                              ↑
                            </button>
                            <button
                              className="btn-answer-control"
                              onClick={() => handleMoveAnswer(qIdx, aIdx, 'down')}
                              disabled={aIdx === q.answers.length - 1}
                              title="Przesuń w dół"
                            >
                              ↓
                            </button>
                            {q.answers.length > 3 && (
                              <button
                                className="btn-answer-control btn-remove"
                                onClick={() => handleRemoveAnswer(qIdx, aIdx)}
                                title="Usuń odpowiedź"
                              >
                                ✕
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                      {q.answers.length < 10 && (
                        <button
                          className="btn-add-answer"
                          onClick={() => handleAddAnswer(qIdx)}
                        >
                          + Dodaj odpowiedź
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="creator-actions">
                <button className="btn-cancel" onClick={handleCancelCustomCategory}>
                  Anuluj
                </button>
                <button className="btn-save" onClick={handleSaveCustomCategory}>
                  <PiCheckBold className="btn-icon" />
                  Zapisz i użyj kategorii
                </button>
              </div>
            </div>
          </div>
        ) : gamePhase === "category-selection" ? (
          // FAZA 1: Wybór kategorii
          <>
          <div className="category-selection">
            {(() => {
              // Zbierz kategorie od każdej drużyny
              const team1Vote = gameData?.teams?.[0] && gameData?.categoryVotes?.[gameData.teams[0].id];
              const team2Vote = gameData?.teams?.[1] && gameData?.categoryVotes?.[gameData.teams[1].id];
              
              const team1Name = gameData?.team1Name || "Drużyna 1";
              const team2Name = gameData?.team2Name || "Drużyna 2";
              
              const bothVoted = team1Vote && team2Vote;
              const sameCategoryVoted = team1Vote && team2Vote && team1Vote === team2Vote;

              return (
                <>
                  <p className="instruction">
                    {!bothVoted 
                      ? "Poczekaj, aż drużyny zagłosują na kategorie..."
                      : sameCategoryVoted
                      ? "Obie drużyny wybrały tę samą kategorię!"
                      : "Drużyny zagłosowały! Wylosuj kategorię:"
                    }
                  </p>

                  <div className="categories-grid host-categories">
                    {/* Box dla drużyny 1 */}
                    <div className={`team-category-box ${team1Vote ? 'filled' : ''} ${team1Vote && usedCategories.includes(team1Vote) ? 'used' : ''}`}>
                      {team1Vote ? (
                        <>
                          {(() => {
                            const cat = categories.find(c => c.category === team1Vote);
                            const isUsed = usedCategories.includes(team1Vote);
                            return (
                              <>
                                <div className="category-icon">
                                  {getDifficultyStars(cat?.difficulty)}
                                </div>
                                <h3 className="category-name">{team1Vote}</h3>
                                <p className="category-difficulty">
                                  {getDifficultyLabel(cat?.difficulty)}
                                </p>
                                {isUsed && (
                                  <div className="used-badge">
                                    <PiCheckCircleFill /> Użyta
                                  </div>
                                )}
                              </>
                            );
                          })()}
                        </>
                      ) : (
                        <div className="waiting-content">
                          <PiClockCountdownFill className="waiting-category-icon" />
                          <p className="waiting-category-text">Oczekiwanie na wybór...</p>
                        </div>
                      )}
                      <div className="team-label">{team1Name}</div>
                    </div>

                    {/* Box dla drużyny 2 */}
                    <div className={`team-category-box ${team2Vote ? 'filled' : ''} ${team2Vote && usedCategories.includes(team2Vote) ? 'used' : ''}`}>
                      {team2Vote ? (
                        <>
                          {(() => {
                            const cat = categories.find(c => c.category === team2Vote);
                            const isUsed = usedCategories.includes(team2Vote);
                            return (
                              <>
                                <div className="category-icon">
                                  {getDifficultyStars(cat?.difficulty)}
                                </div>
                                <h3 className="category-name">{team2Vote}</h3>
                                <p className="category-difficulty">
                                  {getDifficultyLabel(cat?.difficulty)}
                                </p>
                                {isUsed && (
                                  <div className="used-badge">
                                    <PiCheckCircleFill /> Użyta
                                  </div>
                                )}
                              </>
                            );
                          })()}
                        </>
                      ) : (
                        <div className="waiting-content">
                          <PiClockCountdownFill className="waiting-category-icon" />
                          <p className="waiting-category-text">Oczekiwanie na wybór...</p>
                        </div>
                      )}
                      <div className="team-label">{team2Name}</div>
                    </div>
                  </div>

                  <button
                    className={`btn-random-category ${sameCategoryVoted ? 'btn-start-game' : ''}`}
                    onClick={handleCategoryAction}
                    disabled={!bothVoted}
                  >
                    {sameCategoryVoted ? (
                      <>
                        <PiArrowRightBold className="btn-icon" />
                        Przejdź do gry
                      </>
                    ) : (
                      <>
                        <PiShuffleFill className="btn-icon" />
                        Losowanie kategorii
                      </>
                    )}
                  </button>
                </>
              );
            })()}

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
          
          <button
            className="btn-create-custom-outside"
            onClick={handleCreateCustomCategory}
          >
            <PiPlusCircleFill className="btn-icon" />
            Stwórz własną kategorię pytań
          </button>
          </>
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
              {gameData?.questionRevealed ? (
                <div className="revealed-question">
                  <h2 className="question-text">{currentQuestion?.question}</h2>
                  <p className="host-instruction">
                    <PiSpeakerHighFill className="instruction-icon" /> Przeczytaj
                    pytanie na głos drużynom
                  </p>
                </div>
              ) : (
                <div className="hidden-question">
                  <PiQuestionFill className="hidden-question-icon" />
                  <p className="hidden-question-text">
                    Pytanie ukryte - kliknij "Odkryj pytanie" aby je zobaczyć
                  </p>
                </div>
              )}
            </div>

            <div className="buzz-status">
              {buzzProcessing ? (
                <div className="buzzed-info">
                  <div className="buzzed-info-content">
                    <div className="buzzed-label">
                      <PiClockCountdownFill className="buzzed-icon pulse-animation" />
                      <span>Przetwarzanie...</span>
                    </div>
                    <div className="team-name-display empty"></div>
                  </div>
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
                <div className="buzzed-info">
                  <div className="buzzed-info-content">
                    <div className="buzzed-label">
                      <PiClockCountdownFill className="buzzed-icon pulse-animation" />
                      <span>Czekam na naciśnięcie przycisku przez drużyny...</span>
                    </div>
                    <div className="team-name-display empty"></div>
                  </div>
                </div>
              )}
            </div>

            <div className="buzz-controls">
              <button 
                className="btn-reveal-question" 
                onClick={handleRevealQuestion}
                disabled={gameData?.questionRevealed}
              >
                <PiQuestionFill /> {gameData?.questionRevealed ? 'Pytanie odkryte' : 'Odkryj pytanie'}
              </button>
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

            {/* Pasek statusu */}
            <div className="status-bar">
              <div className="status-item">
                <span className="status-label">Punkty w rundzie:</span>
                <span className="status-value points">
                  {gameData?.totalPoints || 0}
                </span>
              </div>
            </div>

            {/* Panel kontrolny */}
            <div className="host-controls">
              <div className="controls-section">
                <button
                  className="control-btn btn-wrong"
                  onClick={handleWrongAnswer}
                  disabled={gameData?.pointsTransferred}
                >
                  <PiXCircleFill /> Błędna odpowiedź
                </button>
                <div className="warning-progress-container">
                  <button
                    className={`control-btn btn-warning ${gameData?.warningActive ? 'warning-active' : ''}`}
                    onClick={handleToggleWarning}
                    disabled={gameData?.pointsTransferred}
                  >
                    <PiWarningFill /> {gameData?.warningActive ? 'Zatrzymaj ostrzeżenie' : 'Ostrzeżenie'}
                  </button>
                  <div className="warning-progress-bar">
                    <div 
                      className="warning-progress-fill"
                      style={{
                        width: gameData?.warningActive ? `${((gameData?.warningCountdown || 0) / 3) * 100}%` : '0%',
                        transition: 'width 0.1s linear'
                      }}
                    />
                  </div>
                </div>
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
            </div>
          </div>
        ) : null}

        {/* Overlaye usunięte dla hosta - tylko drużyny widzą */}
      </div>
    </>
  );
}
