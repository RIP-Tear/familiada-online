import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocFromServer,
  updateDoc, 
  onSnapshot,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
  increment,
  runTransaction,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import questions from './questions';
import { localGameStorage } from './localGameStorage';

// Sprawdź czy Firebase jest dostępny (true = Firebase, false = demo mode)
const useFirebase = db && process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID !== 'demo-project';

if (!useFirebase) {
  console.warn('🔶 DEMO MODE: Firebase nie jest skonfigurowany. Używam lokalnego storage.');
  console.log('📝 Aby skonfigurować Firebase, przejdź do FIREBASE_SETUP.md');
}

// Generowanie unikalnego 4-cyfrowego kodu
export const generateGameCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// Generowanie unikalnego ID użytkownika
export const generateUserId = () => {
  return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Tworzenie nowej gry
export const createGame = async (hostId) => {
  try {
    const gameCode = generateGameCode();
    console.log(`[CREATE] Creating game with code: ${gameCode}`);
    
    const gameData = {
      code: gameCode,
      hostId: hostId,
      status: 'waiting',
      createdAt: new Date().toISOString(),
      
      // Stan gry
      team1Score: 0,
      team2Score: 0,
      currentQuestionIndex: 0,
      currentRound: questions[0],
      totalPoints: 0,
      correctAnswers: [],
      wrongAnswers: [],
      selectedTeam: null,
      
      // Głosowanie na kategorie
      categoryVotes: {}, // { teamId: categoryName }
      
      // Gracze
      players: [],
      rounds: questions,
    };

    if (useFirebase) {
      console.log(`[CREATE] Saving to Firestore...`);
      const gameRef = doc(db, 'games', gameCode);
      await setDoc(gameRef, gameData);
      console.log(`[CREATE] Game ${gameCode} created in Firestore successfully!`);
    } else {
      // Demo mode - użyj lokalnego storage
      await localGameStorage.createGame(gameCode, gameData);
      console.log(`[CREATE] Game ${gameCode} created in local storage`);
    }
    
    return { gameCode, gameId: gameCode };
  } catch (error) {
    console.error('[CREATE] Error creating game:', error);
    console.error('[CREATE] Error details:', error.message);
    throw error;
  }
};

// Dołączanie do gry jako drużyna
export const joinGame = async (gameCode, teamName) => {
  try {
    // Wyczyść i normalizuj kod gry
    const cleanGameCode = gameCode.toUpperCase().trim();
    console.log(`[JOIN] Attempting to join game: ${cleanGameCode} as team "${teamName}"`);
    
    let gameData;
    
    if (useFirebase) {
      const gameRef = doc(db, 'games', cleanGameCode);
      console.log(`[JOIN] Checking Firestore for game: ${cleanGameCode}`);
      const gameSnap = await getDoc(gameRef);
      
      if (!gameSnap.exists()) {
        console.error(`[JOIN] Game ${cleanGameCode} not found in Firestore`);
        throw new Error('Gra nie istnieje');
      }
      
      gameData = gameSnap.data();
      console.log(`[JOIN] Game found:`, gameData);
    } else {
      // Demo mode
      gameData = await localGameStorage.getGame(cleanGameCode);
      if (!gameData) {
        throw new Error('Gra nie istnieje');
      }
    }
    
    if (gameData.status !== 'waiting') {
      throw new Error('Nie można dołączyć - gra już się rozpoczęła');
    }
    
    const teamId = `team-${Date.now()}`;
    const team = {
      id: teamId,
      name: teamName,
      joinedAt: new Date().toISOString(),
    };
    
    if (useFirebase) {
      const gameRef = doc(db, 'games', cleanGameCode);
      const currentTeams = gameData.teams || [];
      const teamNumber = currentTeams.length + 1;
      const teamNameField = `team${teamNumber}Name`;
      
      await updateDoc(gameRef, {
        teams: arrayUnion(team),
        [teamNameField]: teamName,
      });
    } else {
      // Demo mode
      const updatedTeams = [...(gameData.teams || []), team];
      const teamNumber = updatedTeams.length;
      const teamNameField = `team${teamNumber}Name`;
      
      await localGameStorage.updateGame(cleanGameCode, {
        teams: updatedTeams,
        [teamNameField]: teamName,
      });
    }
    
    console.log(`[JOIN] Successfully joined game ${cleanGameCode} as team "${teamName}"`);
    return { gameCode: cleanGameCode, gameId: cleanGameCode, teamId };
  } catch (error) {
    console.error('Error joining game:', error);
    throw error;
  }
};

// Rozpoczęcie gry (tylko host)
export const startGame = async (gameCode) => {
  if (useFirebase) {
    const gameRef = doc(db, 'games', gameCode);
    await updateDoc(gameRef, {
      status: 'playing',
    });
  } else {
    // Demo mode
    await localGameStorage.updateGame(gameCode, {
      status: 'playing',
    });
  }
};

// Głosowanie na kategorię przez drużynę
export const voteForCategory = async (gameCode, teamId, categoryName) => {
  console.log(`[VOTE] Team ${teamId} voting for category: ${categoryName}`);
  
  if (useFirebase) {
    const gameRef = doc(db, 'games', gameCode);
    await updateDoc(gameRef, {
      [`categoryVotes.${teamId}`]: categoryName,
    });
    console.log(`[VOTE] Vote saved to Firestore`);
  } else {
    // Demo mode
    const game = await localGameStorage.getGame(gameCode);
    if (game) {
      const categoryVotes = game.categoryVotes || {};
      categoryVotes[teamId] = categoryName;
      await localGameStorage.updateGame(gameCode, {
        categoryVotes,
      });
    }
    console.log(`[VOTE] Vote saved to local storage`);
  }
};

// Wyczyść wszystkie głosy na kategorie
export const clearCategoryVotes = async (gameCode) => {
  console.log(`[VOTE] Clearing all category votes for game ${gameCode}`);
  
  if (useFirebase) {
    const gameRef = doc(db, 'games', gameCode);
    await updateDoc(gameRef, {
      categoryVotes: {},
    });
    console.log(`[VOTE] Votes cleared in Firestore`);
  } else {
    // Demo mode
    await localGameStorage.updateGame(gameCode, {
      categoryVotes: {},
    });
    console.log(`[VOTE] Votes cleared in local storage`);
  }
};

// Wybór kategorii pytań (tylko host)
export const selectCategory = async (gameCode, category) => {
  console.log(`[SELECT] Setting category for game ${gameCode}: ${category}`);
  
  if (useFirebase) {
    const gameRef = doc(db, 'games', gameCode);
    await updateDoc(gameRef, {
      selectedCategory: category,
      categorySelectedAt: new Date().toISOString(),
      currentQuestionIndex: 0,
      buzzedTeam: null,
      buzzTimestamp: null,
      gamePhase: 'buzz', // Rozpoczyna fazę buzz
      categoryVotes: {}, // Wyczyść głosy po wyborze
    });
    console.log(`[SELECT] Category ${category} saved to Firestore`);
    
    // Pokaż alert o wybranej kategorii
    await showCategorySelectedAlert(gameCode, category);
  } else {
    // Demo mode
    await localGameStorage.updateGame(gameCode, {
      selectedCategory: category,
      categorySelectedAt: new Date().toISOString(),
      currentQuestionIndex: 0,
      buzzedTeam: null,
      buzzTimestamp: null,
      gamePhase: 'buzz',
      categoryVotes: {}, // Wyczyść głosy po wyborze
    });
    console.log(`[SELECT] Category ${category} saved to local storage`);
    
    // Pokaż alert o wybranej kategorii
    await showCategorySelectedAlert(gameCode, category);
  }
};

// Wciśnięcie przycisku przez drużynę (buzz)
export const buzzIn = async (gameCode, teamId, teamName) => {
  const timestamp = Date.now();
  console.log(`[BUZZ] Team ${teamName} (${teamId}) buzzed at ${timestamp}`);
  
  if (useFirebase) {
    const gameRef = doc(db, 'games', gameCode);
    
    try {
      // Użyj transakcji dla atomowej operacji - zapobiega race condition
      const result = await runTransaction(db, async (transaction) => {
        const gameSnap = await transaction.get(gameRef);
        
        if (!gameSnap.exists()) {
          throw new Error('Gra nie istnieje');
        }
        
        const gameData = gameSnap.data();
        
        // Tylko jeśli nikt jeszcze nie wcisnął
        if (!gameData.buzzedTeam) {
          // Atomowa aktualizacja - gwarantuje że tylko jedna drużyna zdoła to wykonać
          transaction.update(gameRef, {
            buzzedTeam: teamId,
            buzzedTeamName: teamName,
            buzzTimestamp: timestamp,
          });
          return { success: true, first: true };
        } else {
          return { success: true, first: false };
        }
      });
      
      if (result.first) {
        console.log(`[BUZZ] ${teamName} buzzed first!`);
      } else {
        console.log(`[BUZZ] ${teamName} was too slow`);
      }
      
      return result;
    } catch (error) {
      console.error(`[BUZZ] Error during buzz transaction:`, error);
      return { success: false, first: false };
    }
  } else {
    // Demo mode
    const gameData = await localGameStorage.getGame(gameCode);
    if (gameData && !gameData.buzzedTeam) {
      await localGameStorage.updateGame(gameCode, {
        buzzedTeam: teamId,
        buzzedTeamName: teamName,
        buzzTimestamp: timestamp,
      });
      return { success: true, first: true };
    }
    return { success: true, first: false };
  }
};

// Reset przycisku buzz (tylko host)
export const resetBuzz = async (gameCode) => {
  console.log(`[BUZZ] Resetting buzz for game ${gameCode}`);
  
  if (useFirebase) {
    const gameRef = doc(db, 'games', gameCode);
    await updateDoc(gameRef, {
      buzzedTeam: null,
      buzzedTeamName: null,
      buzzTimestamp: null,
    });
  } else {
    await localGameStorage.updateGame(gameCode, {
      buzzedTeam: null,
      buzzedTeamName: null,
      buzzTimestamp: null,
    });
  }
  console.log(`[BUZZ] Reset complete`);
};

// Przejście do tablicy (start gry)
export const startGameBoard = async (gameCode) => {
  console.log(`[GAME] Starting game board for ${gameCode}`);
  
  if (useFirebase) {
    const gameRef = doc(db, 'games', gameCode);
    await updateDoc(gameRef, {
      gamePhase: 'playing', // 'buzz' -> 'playing'
      revealedAnswers: [],
      wrongAnswersCount: 0,
      totalPoints: 0,
      // NOTE: team1Score and team2Score are NOT reset here - they accumulate across all questions!
      warningActive: false,
      warningCountdown: null,
    });
  } else {
    await localGameStorage.updateGame(gameCode, {
      gamePhase: 'playing',
      revealedAnswers: [],
      wrongAnswersCount: 0,
      totalPoints: 0,
      // NOTE: team1Score and team2Score are NOT reset here - they accumulate across all questions!
      warningActive: false,
      warningCountdown: null,
    });
  }
  console.log(`[GAME] Game board started - cumulative scores preserved`);
};

// Odkrycie odpowiedzi
export const revealAnswer = async (gameCode, answer, points, currentQuestionIndex) => {
  console.log(`[GAME] Revealing answer: ${answer} (${points} pts)`);
  
  // Podwojenie punktów dla ostatniego pytania (index 4)
  const multiplier = currentQuestionIndex === 4 ? 2 : 1;
  const finalPoints = points * multiplier;
  
  if (useFirebase) {
    const gameRef = doc(db, 'games', gameCode);
    const gameSnap = await getDoc(gameRef);
    const gameData = gameSnap.data();
    
    await updateDoc(gameRef, {
      revealedAnswers: arrayUnion({ answer, points: finalPoints }),
      totalPoints: (gameData.totalPoints || 0) + finalPoints,
    });
  } else {
    const gameData = await localGameStorage.getGame(gameCode);
    const currentTotal = gameData.totalPoints || 0;
    const currentRevealed = gameData.revealedAnswers || [];
    
    await localGameStorage.updateGame(gameCode, {
      revealedAnswers: [...currentRevealed, { answer, points: finalPoints }],
      totalPoints: currentTotal + finalPoints,
    });
  }
};

// Błędna odpowiedź
export const addWrongAnswer = async (gameCode) => {
  console.log(`[GAME] Adding wrong answer`);
  
  if (useFirebase) {
    const gameRef = doc(db, 'games', gameCode);
    const gameSnap = await getDoc(gameRef);
    const gameData = gameSnap.data();
    const currentCount = gameData.wrongAnswersCount || 0;
    
    await updateDoc(gameRef, {
      wrongAnswersCount: currentCount + 1,
    });
  } else {
    const gameData = await localGameStorage.getGame(gameCode);
    const currentCount = gameData.wrongAnswersCount || 0;
    
    await localGameStorage.updateGame(gameCode, {
      wrongAnswersCount: currentCount + 1,
    });
  }
};

// Reset błędnych odpowiedzi
export const resetWrongAnswers = async (gameCode) => {
  console.log(`[GAME] Resetting wrong answers`);
  
  if (useFirebase) {
    const gameRef = doc(db, 'games', gameCode);
    await updateDoc(gameRef, {
      wrongAnswersCount: 0,
    });
  } else {
    await localGameStorage.updateGame(gameCode, {
      wrongAnswersCount: 0,
    });
  }
};

// Ostrzeżenie czasowe
export const toggleWarning = async (gameCode, active) => {
  console.log(`[GAME] Warning ${active ? 'activated' : 'deactivated'}`);
  
  if (useFirebase) {
    const gameRef = doc(db, 'games', gameCode);
    await updateDoc(gameRef, {
      warningActive: active,
      warningCountdown: active ? 3 : null,
    });
  } else {
    await localGameStorage.updateGame(gameCode, {
      warningActive: active,
      warningCountdown: active ? 3 : null,
    });
  }
};

// Aktualizacja licznika ostrzeżenia
export const updateWarningCountdown = async (gameCode, countdown) => {
  if (useFirebase) {
    const gameRef = doc(db, 'games', gameCode);
    await updateDoc(gameRef, {
      warningCountdown: countdown,
      ...(countdown === 0 && { warningActive: false }),
    });
  } else {
    await localGameStorage.updateGame(gameCode, {
      warningCountdown: countdown,
      ...(countdown === 0 && { warningActive: false }),
    });
  }
};

// Alert błędnej odpowiedzi (pokazywany drużynom na 2 sekundy)
export const showWrongAnswerAlert = async (gameCode, wrongCount) => {
  console.log(`[GAME] Showing wrong answer alert (count: ${wrongCount})`);
  
  if (useFirebase) {
    const gameRef = doc(db, 'games', gameCode);
    await updateDoc(gameRef, {
      wrongAnswerAlert: true,
      wrongAnswerCount: wrongCount,
    });
    
    // Automatycznie wyłącz po 2 sekundach
    setTimeout(async () => {
      await updateDoc(gameRef, {
        wrongAnswerAlert: false,
      });
      
      // Jeśli to był 2 błąd, pokaż alert o naradzie drużyny przeciwnej
      if (wrongCount === 2) {
        setTimeout(async () => {
          await showOpponentConsultationAlert(gameCode);
        }, 200);
      }
      
      // Jeśli to był 3 błąd, pokaż alert o przejściu pytania
      if (wrongCount === 3) {
        setTimeout(async () => {
          await showTransferQuestionAlert(gameCode);
        }, 200);
      }
    }, 2000);
  } else {
    await localGameStorage.updateGame(gameCode, {
      wrongAnswerAlert: true,
      wrongAnswerCount: wrongCount,
    });
    
    // Automatycznie wyłącz po 2 sekundach
    setTimeout(async () => {
      await localGameStorage.updateGame(gameCode, {
        wrongAnswerAlert: false,
      });
      
      // Jeśli to był 2 błąd, pokaż alert o naradzie drużyny przeciwnej
      if (wrongCount === 2) {
        setTimeout(async () => {
          await showOpponentConsultationAlert(gameCode);
        }, 200);
      }
      
      // Jeśli to był 3 błąd, pokaż alert o przejściu pytania
      if (wrongCount === 3) {
        setTimeout(async () => {
          await showTransferQuestionAlert(gameCode);
        }, 200);
      }
    }, 2000);
  }
};

// Alert o naradzie drużyny przeciwnej (po 2 błędzie)
export const showOpponentConsultationAlert = async (gameCode) => {
  console.log(`[GAME] Showing opponent consultation alert`);
  
  if (useFirebase) {
    const gameRef = doc(db, 'games', gameCode);
    await updateDoc(gameRef, {
      opponentConsultationAlert: true,
    });
    
    // Automatycznie wyłącz po 2 sekundach
    setTimeout(async () => {
      await updateDoc(gameRef, {
        opponentConsultationAlert: false,
      });
    }, 2000);
  } else {
    await localGameStorage.updateGame(gameCode, {
      opponentConsultationAlert: true,
    });
    
    // Automatycznie wyłącz po 2 sekundach
    setTimeout(async () => {
      await localGameStorage.updateGame(gameCode, {
        opponentConsultationAlert: false,
      });
    }, 2000);
  }
};

// Alert o przejściu pytania do przeciwnej drużyny (po 3 błędzie)
export const showTransferQuestionAlert = async (gameCode) => {
  console.log(`[GAME] Showing transfer question alert`);
  
  if (useFirebase) {
    const gameRef = doc(db, 'games', gameCode);
    await updateDoc(gameRef, {
      transferQuestionAlert: true,
    });
    
    // Automatycznie wyłącz po 2 sekundach
    setTimeout(async () => {
      await updateDoc(gameRef, {
        transferQuestionAlert: false,
      });
    }, 2000);
  } else {
    await localGameStorage.updateGame(gameCode, {
      transferQuestionAlert: true,
    });
    
    // Automatycznie wyłącz po 2 sekundach
    setTimeout(async () => {
      await localGameStorage.updateGame(gameCode, {
        transferQuestionAlert: false,
      });
    }, 2000);
  }
};

// Alert o następnym pytaniu
export const showNextQuestionAlert = async (gameCode) => {
  console.log(`[GAME] Showing next question alert`);
  
  if (useFirebase) {
    const gameRef = doc(db, 'games', gameCode);
    await updateDoc(gameRef, {
      nextQuestionAlert: true,
    });
    
    // Automatycznie wyłącz po 2 sekundach
    setTimeout(async () => {
      await updateDoc(gameRef, {
        nextQuestionAlert: false,
      });
    }, 2000);
  } else {
    await localGameStorage.updateGame(gameCode, {
      nextQuestionAlert: true,
    });
    
    // Automatycznie wyłącz po 2 sekundach
    setTimeout(async () => {
      await localGameStorage.updateGame(gameCode, {
        nextQuestionAlert: false,
      });
    }, 2000);
  }
};

// Alert o wygranej rundy
export const showRoundWinnerAlert = async (gameCode, winnerTeamName) => {
  console.log(`[GAME] Showing round winner alert for: ${winnerTeamName}`);
  
  if (useFirebase) {
    const gameRef = doc(db, 'games', gameCode);
    await updateDoc(gameRef, {
      roundWinnerAlert: true,
      roundWinnerName: winnerTeamName,
    });
    
    // Automatycznie wyłącz po 3 sekundach
    setTimeout(async () => {
      await updateDoc(gameRef, {
        roundWinnerAlert: false,
        roundWinnerName: null,
      });
    }, 3000);
  } else {
    await localGameStorage.updateGame(gameCode, {
      roundWinnerAlert: true,
      roundWinnerName: winnerTeamName,
    });
    
    // Automatycznie wyłącz po 3 sekundach
    setTimeout(async () => {
      await localGameStorage.updateGame(gameCode, {
        roundWinnerAlert: false,
        roundWinnerName: null,
      });
    }, 3000);
  }
};

// Alert końcowy gry (wygrana/przegrana)
export const showGameResultAlert = async (gameCode) => {
  console.log(`[GAME] Showing game result alert`);
  
  if (useFirebase) {
    const gameRef = doc(db, 'games', gameCode);
    await updateDoc(gameRef, {
      gameResultAlert: true,
    });
    
    // Automatycznie wyłącz po 3 sekundach
    setTimeout(async () => {
      await updateDoc(gameRef, {
        gameResultAlert: false,
      });
    }, 3000);
  } else {
    await localGameStorage.updateGame(gameCode, {
      gameResultAlert: true,
    });
    
    // Automatycznie wyłącz po 3 sekundach
    setTimeout(async () => {
      await localGameStorage.updateGame(gameCode, {
        gameResultAlert: false,
      });
    }, 3000);
  }
};

// Alert o wybranej kategorii
export const showCategorySelectedAlert = async (gameCode, categoryName) => {
  console.log(`[GAME] Showing category selected alert: ${categoryName}`);
  
  if (useFirebase) {
    const gameRef = doc(db, 'games', gameCode);
    await updateDoc(gameRef, {
      categorySelectedAlert: true,
      selectedCategoryName: categoryName,
    });
    
    // Automatycznie wyłącz po 3 sekundach
    setTimeout(async () => {
      await updateDoc(gameRef, {
        categorySelectedAlert: false,
      });
    }, 3000);
  } else {
    await localGameStorage.updateGame(gameCode, {
      categorySelectedAlert: true,
      selectedCategoryName: categoryName,
    });
    
    // Automatycznie wyłącz po 3 sekundach
    setTimeout(async () => {
      await localGameStorage.updateGame(gameCode, {
        categorySelectedAlert: false,
      });
    }, 3000);
  }
};

// Przekazanie punktów drużynie
export const transferPointsToTeam = async (gameCode, teamIndex) => {
  console.log(`[GAME] Transferring points to team ${teamIndex}`);
  
  if (useFirebase) {
    const gameRef = doc(db, 'games', gameCode);
    
    // Pobierz najświeższe dane BEZPOŚREDNIO z serwera (omijając cache)
    const gameSnap = await getDocFromServer(gameRef);
    const gameData = gameSnap.data();
    
    const pointsToTransfer = gameData.totalPoints || 0;
    const fieldName = teamIndex === 1 ? 'team1Score' : 'team2Score';
    const teamNameField = teamIndex === 1 ? 'team1Name' : 'team2Name';
    const teamName = gameData[teamNameField] || `Drużyna ${teamIndex}`;
    const currentScore = gameData[fieldName] || 0;
    
    console.log(`[TRANSFER] 📡 Fresh data from server - Team 1: ${gameData.team1Score || 0}, Team 2: ${gameData.team2Score || 0}`);
    console.log(`[TRANSFER] Team ${teamIndex} (${teamName}): ${currentScore} + ${pointsToTransfer} = ${currentScore + pointsToTransfer}`);
    console.log(`[TRANSFER] 🔧 Using Firebase increment() to atomically add ${pointsToTransfer} to ${fieldName}`);
    
    // Używamy increment() aby atomicznie dodać punkty - unikamy race conditions
    await updateDoc(gameRef, {
      [fieldName]: increment(pointsToTransfer),
      pointsTransferred: true,
      lastPointsRecipient: teamName,
      lastPointsAmount: pointsToTransfer,
    });
    
    // Pokaż alert o wygranej rundy
    await showRoundWinnerAlert(gameCode, teamName);
    
    // Weryfikacja po zapisie - również z serwera
    const verifySnap = await getDocFromServer(gameRef);
    const verifyData = verifySnap.data();
    console.log(`[TRANSFER] ✅ Points transferred successfully!`);
    console.log(`[TRANSFER] After transfer (from server) - Team 1: ${verifyData.team1Score || 0}, Team 2: ${verifyData.team2Score || 0}`);
    console.log(`[TRANSFER] ${fieldName} is now: ${verifyData[fieldName]}`);
  } else {
    const gameData = await localGameStorage.getGame(gameCode);
    const pointsToTransfer = gameData.totalPoints || 0;
    const fieldName = teamIndex === 1 ? 'team1Score' : 'team2Score';
    const teamNameField = teamIndex === 1 ? 'team1Name' : 'team2Name';
    const currentScore = gameData[fieldName] || 0;
    const teamName = gameData[teamNameField] || `Drużyna ${teamIndex}`;
    const newScore = currentScore + pointsToTransfer;
    
    console.log(`[TRANSFER] Team ${teamIndex} (${teamName}): ${currentScore} + ${pointsToTransfer} = ${newScore}`);
    console.log(`[TRANSFER] Current scores before transfer - Team 1: ${gameData.team1Score || 0}, Team 2: ${gameData.team2Score || 0}`);
    
    await localGameStorage.updateGame(gameCode, {
      [fieldName]: newScore,
      pointsTransferred: true,
      lastPointsRecipient: teamName,
      lastPointsAmount: pointsToTransfer,
    });
    
    // Pokaż alert o wygranej rundy
    await showRoundWinnerAlert(gameCode, teamName);
    
    console.log(`[TRANSFER] Points transferred successfully. New ${fieldName}: ${newScore}`);
  }
};

// Przejście do następnego pytania
export const nextQuestion = async (gameCode) => {
  console.log(`[GAME] Moving to next question`);
  
  if (useFirebase) {
    const gameRef = doc(db, 'games', gameCode);
    
    // Pobierz świeże dane z serwera
    const gameSnap = await getDocFromServer(gameRef);
    const gameData = gameSnap.data();
    
    const nextIndex = (gameData.currentQuestionIndex || 0) + 1;
    
    console.log(`[NEXT] Current question: ${gameData.currentQuestionIndex}, Next: ${nextIndex}`);
    console.log(`[NEXT] 📡 Fresh scores from server - Team 1: ${gameData.team1Score || 0}, Team 2: ${gameData.team2Score || 0}`);
    console.log(`[NEXT] Resetting totalPoints from ${gameData.totalPoints || 0} to 0`);
    console.log(`[NEXT] ⚠️ IMPORTANT: team1Score and team2Score are NOT in the update object - they should be preserved!`);
    
    await updateDoc(gameRef, {
      currentQuestionIndex: nextIndex,
      gamePhase: nextIndex >= 5 ? 'finished' : 'buzz', // Powrót do buzz dla kolejnego pytania
      buzzedTeam: null,
      buzzedTeamName: null,
      buzzTimestamp: null,
      revealedAnswers: [],
      wrongAnswersCount: 0,
      totalPoints: 0,
      pointsTransferred: false,
      lastPointsRecipient: null,
      lastPointsAmount: 0,
    });
    
    // Weryfikacja po zapisie - czy wyniki się nie zmieniły
    const verifySnap = await getDocFromServer(gameRef);
    const verifyData = verifySnap.data();
    console.log(`[NEXT] ✅ After update verification (from server):`);
    console.log(`[NEXT]    Team 1: ${verifyData.team1Score || 0} (was ${gameData.team1Score || 0})`);
    console.log(`[NEXT]    Team 2: ${verifyData.team2Score || 0} (was ${gameData.team2Score || 0})`);
    
    if ((verifyData.team1Score || 0) !== (gameData.team1Score || 0) || (verifyData.team2Score || 0) !== (gameData.team2Score || 0)) {
      console.error(`[NEXT] 🚨 ERROR! Team scores were changed during nextQuestion!`);
      console.error(`[NEXT]    This should NEVER happen - scores should be preserved`);
    } else {
      console.log(`[NEXT] ✅ Team scores correctly preserved`);
    }
  } else {
    const gameData = await localGameStorage.getGame(gameCode);
    const nextIndex = (gameData.currentQuestionIndex || 0) + 1;
    
    console.log(`[NEXT] Current question: ${gameData.currentQuestionIndex}, Next: ${nextIndex}`);
    console.log(`[NEXT] Current scores - Team 1: ${gameData.team1Score || 0}, Team 2: ${gameData.team2Score || 0}`);
    console.log(`[NEXT] Resetting totalPoints from ${gameData.totalPoints || 0} to 0`);
    console.log(`[NEXT] ⚠️ IMPORTANT: team1Score and team2Score are NOT in the update object - they should be preserved!`);
    
    await localGameStorage.updateGame(gameCode, {
      currentQuestionIndex: nextIndex,
      gamePhase: nextIndex >= 5 ? 'finished' : 'buzz',
      buzzedTeam: null,
      buzzedTeamName: null,
      buzzTimestamp: null,
      revealedAnswers: [],
      wrongAnswersCount: 0,
      totalPoints: 0,
      pointsTransferred: false,
      lastPointsRecipient: null,
      lastPointsAmount: 0,
    });
    
    // Weryfikacja po zapisie
    const verifyData = await localGameStorage.getGame(gameCode);
    console.log(`[NEXT] ✅ After update verification:`);
    console.log(`[NEXT]    Team 1: ${verifyData.team1Score || 0} (was ${gameData.team1Score || 0})`);
    console.log(`[NEXT]    Team 2: ${verifyData.team2Score || 0} (was ${gameData.team2Score || 0})`);
    
    if ((verifyData.team1Score || 0) !== (gameData.team1Score || 0) || (verifyData.team2Score || 0) !== (gameData.team2Score || 0)) {
      console.error(`[NEXT] 🚨 ERROR! Team scores were changed during nextQuestion!`);
      console.error(`[NEXT]    This should NEVER happen - scores should be preserved`);
    } else {
      console.log(`[NEXT] ✅ Team scores correctly preserved`);
    }
  }
};

// Zakończenie gry i powrót do home
export const endGame = async (gameCode) => {
  console.log(`[GAME] Ending game ${gameCode}`);
  
  if (useFirebase) {
    const gameRef = doc(db, 'games', gameCode);
    await updateDoc(gameRef, {
      status: 'ended',
    });
  } else {
    await localGameStorage.updateGame(gameCode, {
      status: 'ended',
    });
  }
};

// Restart gry - zachowuje drużyny, resetuje wszystko inne do wyboru kategorii
export const restartGame = async (gameCode) => {
  console.log(`[GAME] Restarting game ${gameCode}`);
  
  if (useFirebase) {
    const gameRef = doc(db, 'games', gameCode);
    
    // Pobierz obecne dane aby zachować team1Name i team2Name
    const gameSnap = await getDocFromServer(gameRef);
    const gameData = gameSnap.data();
    
    await updateDoc(gameRef, {
      status: 'waiting',
      gamePhase: 'category-selection',
      selectedCategory: null,
      categorySelectedAt: null,
      currentQuestionIndex: 0,
      
      // Resetuj wyniki
      team1Score: 0,
      team2Score: 0,
      totalPoints: 0,
      
      // Resetuj głosowanie
      categoryVotes: {},
      
      // Resetuj stan rundy
      buzzedTeam: null,
      buzzedTeamName: null,
      buzzTimestamp: null,
      revealedAnswers: [],
      wrongAnswersCount: 0,
      pointsTransferred: false,
      lastPointsRecipient: null,
      lastPointsAmount: 0,
      
      // Resetuj ostrzeżenia
      warningActive: false,
      warningCountdown: null,
      
      // Drużyny pozostają niezmienione (team1Name, team2Name, teams)
    });
    
    console.log(`[GAME] Game restarted - teams preserved: ${gameData.team1Name}, ${gameData.team2Name}`);
  } else {
    const gameData = await localGameStorage.getGame(gameCode);
    
    await localGameStorage.updateGame(gameCode, {
      status: 'waiting',
      gamePhase: 'category-selection',
      selectedCategory: null,
      categorySelectedAt: null,
      currentQuestionIndex: 0,
      
      team1Score: 0,
      team2Score: 0,
      totalPoints: 0,
      
      // Resetuj głosowanie
      categoryVotes: {},
      
      buzzedTeam: null,
      buzzedTeamName: null,
      buzzTimestamp: null,
      revealedAnswers: [],
      wrongAnswersCount: 0,
      pointsTransferred: false,
      lastPointsRecipient: null,
      lastPointsAmount: 0,
      
      warningActive: false,
      warningCountdown: null,
    });
    
    console.log(`[GAME] Game restarted - teams preserved: ${gameData.team1Name}, ${gameData.team2Name}`);
  }
};

// Nasłuchiwanie zmian w grze
export const subscribeToGame = (gameCode, callback) => {
  if (useFirebase) {
    const gameRef = doc(db, 'games', gameCode);
    return onSnapshot(gameRef, (doc) => {
      if (doc.exists()) {
        callback(doc.data());
      }
    });
  } else {
    // Demo mode - użyj lokalnego storage
    // Wywołaj callback natychmiast z aktualnymi danymi (jeśli gra istnieje)
    localGameStorage.getGame(gameCode)
      .then(gameData => {
        if (gameData) {
          callback(gameData);
        }
      })
      .catch(err => {
        // Gra jeszcze nie istnieje - to normalne przy pierwszym renderze
        console.log(`[DEMO MODE] Waiting for game ${gameCode} to be created...`);
      });
    
    // Zwróć listener który będzie nasłuchiwał przyszłych zmian
    return localGameStorage.onGameChange(gameCode, callback);
  }
};

// Opuszczenie gry
export const leaveGame = async (gameCode, teamId) => {
  const gameRef = doc(db, 'games', gameCode);
  const gameSnap = await getDoc(gameRef);
  
  if (gameSnap.exists()) {
    const teams = gameSnap.data().teams || [];
    const updatedTeams = teams.filter(t => t.id !== teamId);
    
    await updateDoc(gameRef, {
      teams: updatedTeams,
    });
  }
};
