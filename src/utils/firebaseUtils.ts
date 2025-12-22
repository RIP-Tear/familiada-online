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
  Unsubscribe,
  DocumentData,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import questions from './questions';
import { localGameStorage } from './localGameStorage';
import type { GameData, Team, JoinGameResult, CreateGameResult } from '../types/game';

// Sprawdź czy Firebase jest dostępny (true = Firebase, false = demo mode)
const useFirebase = db && process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID !== 'demo-project';

if (!useFirebase) {
  console.warn('🔶 DEMO MODE: Firebase nie jest skonfigurowany. Używam lokalnego storage.');
  console.log('📝 Aby skonfigurować Firebase, przejdź do FIREBASE_SETUP.md');
}

// Generowanie unikalnego 4-cyfrowego kodu
export const generateGameCode = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// Generowanie unikalnego ID użytkownika
export const generateUserId = (): string => {
  return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Tworzenie nowej gry
export const createGame = async (hostId: string): Promise<CreateGameResult> => {
  try {
    const gameCode = generateGameCode();
    console.log(`[CREATE] Creating game with code: ${gameCode}`);
    
    const gameData: GameData = {
      code: gameCode,
      hostId: hostId,
      status: 'waiting',
      createdAt: new Date().toISOString(),
      
      // Stan gry
      team1Score: 0,
      team2Score: 0,
      currentQuestionIndex: 0,
      currentRound: questions,
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
    console.error('[CREATE] Error details:', (error as Error).message);
    throw error;
  }
};

// Dołączanie do gry jako drużyna
export const joinGame = async (gameCode: string, teamName: string): Promise<JoinGameResult> => {
  try {
    // Wyczyść i normalizuj kod gry
    const cleanGameCode = gameCode.toUpperCase().trim();
    console.log(`[JOIN] Attempting to join game: ${cleanGameCode} as team "${teamName}"`);
    
    let gameData: GameData | null;
    
    if (useFirebase) {
      const gameRef = doc(db, 'games', cleanGameCode);
      console.log(`[JOIN] Checking Firestore for game: ${cleanGameCode}`);
      const gameSnap = await getDoc(gameRef);
      
      if (!gameSnap.exists()) {
        return { success: false, error: 'Gra nie istnieje' } as any;
      }
      
      gameData = gameSnap.data() as GameData;
      console.log(`[JOIN] Game found:`, gameData);
    } else {
      // Demo mode
      gameData = await localGameStorage.getGame(cleanGameCode);
      if (!gameData) {
        return { success: false, error: 'Gra nie istnieje' } as any;
      }
    }
    
    if (gameData.status !== 'waiting') {
      throw new Error('Nie można dołączyć - gra już się rozpoczęła');
    }
    
    const teamId = `team-${Date.now()}`;
    const team: Team = {
      id: teamId,
      name: teamName,
      joinedAt: new Date().toISOString(),
    };
    
    if (useFirebase) {
      const gameRef = doc(db, 'games', cleanGameCode);
      const currentTeams = gameData.teams || [];
      const teamNumber = currentTeams.length + 1;
      const teamNameField = `team${teamNumber}Name` as 'team1Name' | 'team2Name';
      
      await updateDoc(gameRef, {
        teams: arrayUnion(team),
        [teamNameField]: teamName,
      });
    } else {
      // Demo mode
      const updatedTeams = [...(gameData.teams || []), team];
      const teamNumber = updatedTeams.length;
      const teamNameField = `team${teamNumber}Name` as 'team1Name' | 'team2Name';
      
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

// Opuszczenie gry przez drużynę
export const leaveGame = async (gameCode: string, teamId: string): Promise<void> => {
  try {
    const cleanGameCode = gameCode.toUpperCase().trim();
    console.log(`[LEAVE] Team ${teamId} leaving game: ${cleanGameCode}`);
    
    if (useFirebase) {
      const gameRef = doc(db, 'games', cleanGameCode);
      const gameSnap = await getDoc(gameRef);
      
      if (!gameSnap.exists()) {
        console.error(`[LEAVE] Game ${cleanGameCode} not found`);
        return;
      }
      
      const gameData = gameSnap.data() as GameData;
      const updatedTeams = (gameData.teams || []).filter(team => team.id !== teamId);
      
      // Aktualizuj nazwy drużyn
      const updates: any = {
        teams: updatedTeams,
      };
      
      if (updatedTeams.length === 0) {
        updates.team1Name = null;
        updates.team2Name = null;
      } else if (updatedTeams.length === 1) {
        updates.team1Name = updatedTeams[0].name;
        updates.team2Name = null;
      }
      
      await updateDoc(gameRef, updates);
    } else {
      // Demo mode
      const gameData = await localGameStorage.getGame(cleanGameCode);
      if (!gameData) return;
      
      const updatedTeams = (gameData.teams || []).filter(team => team.id !== teamId);
      
      const updates: any = {
        teams: updatedTeams,
      };
      
      if (updatedTeams.length === 0) {
        updates.team1Name = null;
        updates.team2Name = null;
      } else if (updatedTeams.length === 1) {
        updates.team1Name = updatedTeams[0].name;
        updates.team2Name = null;
      }
      
      await localGameStorage.updateGame(cleanGameCode, updates);
    }
    
    console.log(`[LEAVE] Team ${teamId} successfully left game ${cleanGameCode}`);
  } catch (error) {
    console.error('Error leaving game:', error);
    throw error;
  }
};

// Pobranie gry z Firebase/localStorage
export const getGame = async (gameCode: string): Promise<GameData | null> => {
  try {
    const cleanGameCode = gameCode.toUpperCase().trim();
    console.log(`[GET] Fetching game: ${cleanGameCode}`);
    
    if (useFirebase) {
      const gameRef = doc(db, 'games', cleanGameCode);
      const gameSnap = await getDoc(gameRef);
      
      if (!gameSnap.exists()) {
        console.log(`[GET] Game ${cleanGameCode} not found in Firestore`);
        return null;
      }
      
      const gameData = gameSnap.data() as GameData;
      console.log(`[GET] Game found in Firestore`);
      return gameData;
    } else {
      // Demo mode
      const gameData = await localGameStorage.getGame(cleanGameCode);
      console.log(`[GET] Game ${gameData ? 'found' : 'not found'} in local storage`);
      return gameData;
    }
  } catch (error) {
    console.error('[GET] Error fetching game:', error);
    return null;
  }
};

// Resetowanie tylko statusu gry (bez usuwania drużyn)
export const resetGameStatus = async (gameCode: string): Promise<void> => {
  try {
    const cleanGameCode = gameCode.toUpperCase().trim();
    console.log(`[RESET STATUS] Resetting game ${cleanGameCode} status to waiting`);
    
    if (useFirebase) {
      const gameRef = doc(db, 'games', cleanGameCode);
      await updateDoc(gameRef, {
        status: 'waiting',
      });
      console.log(`[RESET STATUS] Game ${cleanGameCode} status reset successfully`);
    } else {
      // Demo mode
      await localGameStorage.updateGame(cleanGameCode, {
        status: 'waiting',
      } as any);
      console.log(`[RESET STATUS] Game ${cleanGameCode} status reset in local storage`);
    }
  } catch (error) {
    console.error('[RESET STATUS] Error resetting game status:', error);
    throw error;
  }
};

// Resetowanie gry do stanu początkowego (czyści wszystko włącznie z drużynami)
export const resetGameToWaiting = async (gameCode: string, newHostId?: string): Promise<void> => {
  try {
    const cleanGameCode = gameCode.toUpperCase().trim();
    console.log(`[RESET FULL] Resetting game ${cleanGameCode} to initial state`);
    
    const resetData: any = {
      status: 'waiting',
      teams: [],
      team1Name: null,
      team2Name: null,
      team1Score: 0,
      team2Score: 0,
      currentQuestionIndex: 0,
      totalPoints: 0,
      correctAnswers: [],
      wrongAnswers: [],
      selectedTeam: null,
      categoryVotes: {},
      selectedCategory: null,
      categorySelectedAt: null,
      gamePhase: null,
      buzzedTeam: null,
      buzzTimestamp: null,
      teamVsAlert: false,
      categorySelectedAlert: false,
      hostLeftAlert: false,
      hostLeftAt: null,
      teamLeftAlert: false,
      teamLeftName: null,
      gameResultAlert: false,
    };
    
    // Jeśli podano nowy hostId, zaktualizuj go
    if (newHostId) {
      resetData.hostId = newHostId;
    }
    
    if (useFirebase) {
      const gameRef = doc(db, 'games', cleanGameCode);
      await updateDoc(gameRef, resetData);
      console.log(`[RESET FULL] Game ${cleanGameCode} reset successfully`);
    } else {
      // Demo mode
      await localGameStorage.updateGame(cleanGameCode, resetData);
      console.log(`[RESET FULL] Game ${cleanGameCode} reset in local storage`);
    }
  } catch (error) {
    console.error('[RESET FULL] Error resetting game:', error);
    throw error;
  }
};

// Rozpoczęcie gry (tylko host)
export const startGame = async (gameCode: string): Promise<void> => {
  if (useFirebase) {
    const gameRef = doc(db, 'games', gameCode);
    await updateDoc(gameRef, {
      status: 'playing',
      teamVsAlert: true,
    });
    
    // Ukryj overlay po 3 sekundach
    setTimeout(async () => {
      await updateDoc(gameRef, {
        teamVsAlert: false,
      });
    }, 3000);
  } else {
    // Demo mode
    await localGameStorage.updateGame(gameCode, {
      status: 'playing',
      teamVsAlert: true,
    } as any);
    
    // Ukryj overlay po 3 sekundach
    setTimeout(async () => {
      await localGameStorage.updateGame(gameCode, {
        teamVsAlert: false,
      } as any);
    }, 3000);
  }
};

// Głosowanie na kategorię przez drużynę
export const voteForCategory = async (gameCode: string, teamId: string, categoryName: string): Promise<void> => {
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
export const clearCategoryVotes = async (gameCode: string): Promise<void> => {
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
export const selectCategory = async (gameCode: string, category: string, isRandomlySelected: boolean = false): Promise<void> => {
  console.log(`[SELECT] Setting category for game ${gameCode}: ${category}`);
  
  const showCategorySelectedAlert = async (gameCode: string, category: string, isRandomlySelected: boolean) => {
    console.log(`[GAME] Showing category selected alert: ${category}`);
    
    if (useFirebase) {
      const gameRef = doc(db, 'games', gameCode);
      
      // Najpierw pokaż overlay losowania przez 3 sekundy
      await updateDoc(gameRef, {
        categoryDrawingAlert: true,
      });
      
      setTimeout(async () => {
        // Ukryj overlay losowania i pokaż wybraną kategorię
        await updateDoc(gameRef, {
          categoryDrawingAlert: false,
          categorySelectedAlert: true,
          selectedCategoryName: category,
          isCategoryRandomlySelected: isRandomlySelected,
        });
        
        // Po kolejnych 3 sekundach ukryj overlay i przejdź do fazy buzzerów
        setTimeout(async () => {
          await updateDoc(gameRef, {
            categorySelectedAlert: false,
            gamePhase: 'buzz',
          });
        }, 3000);
      }, 3000);
    } else {
      // Najpierw pokaż overlay losowania przez 3 sekundy
      await localGameStorage.updateGame(gameCode, {
        categoryDrawingAlert: true,
      });
      
      setTimeout(async () => {
        // Ukryj overlay losowania i pokaż wybraną kategorię
        await localGameStorage.updateGame(gameCode, {
          categoryDrawingAlert: false,
          categorySelectedAlert: true,
          selectedCategoryName: category,
          isCategoryRandomlySelected: isRandomlySelected,
        });
        
        // Po kolejnych 3 sekundach ukryj overlay i przejdź do fazy buzzerów
        setTimeout(async () => {
          await localGameStorage.updateGame(gameCode, {
            categorySelectedAlert: false,
            gamePhase: 'buzz',
          });
        }, 3000);
      }, 3000);
    }
  };
  
  if (useFirebase) {
    const gameRef = doc(db, 'games', gameCode);
    await updateDoc(gameRef, {
      selectedCategory: category,
      categorySelectedAt: new Date().toISOString(),
      currentQuestionIndex: 0,
      buzzedTeam: null,
      buzzTimestamp: null,
      categoryVotes: {},
    });
    console.log(`[SELECT] Category ${category} saved to Firestore`);
    
    await showCategorySelectedAlert(gameCode, category, isRandomlySelected);
  } else {
    // Demo mode
    await localGameStorage.updateGame(gameCode, {
      selectedCategory: category,
      categorySelectedAt: new Date().toISOString(),
      currentQuestionIndex: 0,
      buzzedTeam: null,
      buzzTimestamp: null,
      categoryVotes: {},
    });
    console.log(`[SELECT] Category ${category} saved to local storage`);
    
    await showCategorySelectedAlert(gameCode, category, isRandomlySelected);
  }
};

// Wciśnięcie przycisku przez drużynę (buzz)
export const buzzIn = async (gameCode: string, teamId: string, teamName: string): Promise<{ success: boolean; first: boolean }> => {
  const timestamp = Date.now();
  console.log(`[BUZZ] Team ${teamName} (${teamId}) buzzed at ${timestamp}`);
  
  if (useFirebase) {
    const gameRef = doc(db, 'games', gameCode);
    
    try {
      const result = await runTransaction(db, async (transaction) => {
        const gameSnap = await transaction.get(gameRef);
        
        if (!gameSnap.exists()) {
          throw new Error('Gra nie istnieje');
        }
        
        const gameData = gameSnap.data() as GameData;
        
        if (!(gameData as any).buzzedTeam) {
          transaction.update(gameRef, {
            buzzedTeam: teamId,
            buzzedTeamName: teamName,
            buzzTimestamp: timestamp,
            buzzAlert: true,
            buzzAlertTeamName: teamName,
          });
          return { success: true, first: true };
        } else {
          return { success: true, first: false };
        }
      });
      
      if (result.first) {
        console.log(`[BUZZ] ${teamName} buzzed first!`);
        // Automatycznie ukryj alert po 2 sekundach
        setTimeout(async () => {
          await updateDoc(gameRef, {
            buzzAlert: false,
            buzzAlertTeamName: null,
          });
        }, 2000);
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
    if (gameData && !(gameData as any).buzzedTeam) {
      await localGameStorage.updateGame(gameCode, {
        buzzedTeam: teamId,
        buzzedTeamName: teamName,
        buzzTimestamp: timestamp,
        buzzAlert: true,
        buzzAlertTeamName: teamName,
      } as any);
      
      // Automatycznie ukryj alert po 2 sekundach
      setTimeout(async () => {
        await localGameStorage.updateGame(gameCode, {
          buzzAlert: false,
          buzzAlertTeamName: null,
        } as any);
      }, 2000);
      
      return { success: true, first: true };
    }
    return { success: true, first: false };
  }
};

// Pozostałe funkcje będą dodane w następnej części...
// Reset przycisku buzz, startGameBoard, revealAnswer, addWrongAnswer, etc.

export const resetBuzz = async (gameCode: string): Promise<void> => {
  console.log(`[BUZZ] Resetting buzz for game ${gameCode}`);
  
  if (useFirebase) {
    const gameRef = doc(db, 'games', gameCode);
    await updateDoc(gameRef, {
      buzzedTeam: null,
      buzzedTeamName: null,
      buzzTimestamp: null,
      questionRevealed: false,
    });
  } else {
    await localGameStorage.updateGame(gameCode, {
      buzzedTeam: null,
      buzzedTeamName: null,
      buzzTimestamp: null,
      questionRevealed: false,
    } as any);
  }
  console.log(`[BUZZ] Reset complete`);
};

export const revealQuestion = async (gameCode: string): Promise<void> => {
  console.log(`[GAME] Revealing question for game ${gameCode}`);
  
  if (useFirebase) {
    const gameRef = doc(db, 'games', gameCode);
    await updateDoc(gameRef, {
      questionRevealed: true,
    });
  } else {
    await localGameStorage.updateGame(gameCode, {
      questionRevealed: true,
    } as any);
  }
  console.log(`[GAME] Question revealed`);
};

export const startGameBoard = async (gameCode: string): Promise<void> => {
  console.log(`[GAME] Starting game board for ${gameCode}`);
  
  if (useFirebase) {
    const gameRef = doc(db, 'games', gameCode);
    await updateDoc(gameRef, {
      gamePhase: 'playing',
      revealedAnswers: [],
      wrongAnswersCount: 0,
      totalPoints: 0,
      warningActive: false,
      warningCountdown: null,
    });
  } else {
    await localGameStorage.updateGame(gameCode, {
      gamePhase: 'playing',
      revealedAnswers: [],
      wrongAnswersCount: 0,
      totalPoints: 0,
      warningActive: false,
      warningCountdown: null,
    } as any);
  }
  console.log(`[GAME] Game board started - cumulative scores preserved`);
};

export const showTopAnswerAlert = async (gameCode: string): Promise<void> => {
  console.log('[GAME] Showing top answer alert!');
  
  if (useFirebase) {
    const gameRef = doc(db, 'games', gameCode);
    await updateDoc(gameRef, {
      topAnswerAlert: true,
    });
    
    // Automatycznie ukryj alert po 2 sekundach
    setTimeout(async () => {
      await updateDoc(gameRef, {
        topAnswerAlert: false,
      });
    }, 2000);
  } else {
    await localGameStorage.updateGame(gameCode, {
      topAnswerAlert: true,
    } as any);
    
    setTimeout(async () => {
      await localGameStorage.updateGame(gameCode, {
        topAnswerAlert: false,
      } as any);
    }, 2000);
  }
};

export const showRoundEndAlert = async (gameCode: string): Promise<void> => {
  console.log('[GAME] Showing round end alert!');
  
  if (useFirebase) {
    const gameRef = doc(db, 'games', gameCode);
    await updateDoc(gameRef, {
      roundEndAlert: true,
      roundEnded: true,
    });
    
    // Automatycznie ukryj alert po 2 sekundach
    setTimeout(async () => {
      await updateDoc(gameRef, {
        roundEndAlert: false,
      });
    }, 2000);
  } else {
    await localGameStorage.updateGame(gameCode, {
      roundEndAlert: true,
      roundEnded: true,
    } as any);
    
    setTimeout(async () => {
      await localGameStorage.updateGame(gameCode, {
        roundEndAlert: false,
      } as any);
    }, 2000);
  }
};

export const revealAnswer = async (gameCode: string, answer: string, points: number, currentQuestionIndex: number): Promise<void> => {
  console.log(`[GAME] Revealing answer: ${answer} (${points} pts)`);
  
  const multiplier = currentQuestionIndex === 4 ? 2 : 1;
  const finalPoints = points * multiplier;
  
  // Sprawdź czy to jest odpowiedź nr 1 (100 punktów bazowych)
  // Pierwsza odpowiedź zawsze ma 100 punktów przed pomnożeniem
  const isTopAnswer = points === 100;
  console.log(`[GAME] Is top answer? ${isTopAnswer} (points: ${points}, finalPoints: ${finalPoints})`);
  
  if (useFirebase) {
    const gameRef = doc(db, 'games', gameCode);
    
    // Użyj transakcji aby uniknąć race conditions
    const result = await runTransaction(db, async (transaction) => {
      const gameSnap = await transaction.get(gameRef);
      if (!gameSnap.exists()) {
        throw new Error('Game does not exist');
      }
      
      const gameData = gameSnap.data() as GameData;
      const currentRevealed = (gameData as any).revealedAnswers || [];
      
      // Sprawdź czy odpowiedź już została odkryta
      const alreadyRevealed = currentRevealed.some((r: any) => r.answer === answer);
      if (alreadyRevealed) {
        console.log(`[GAME] ⚠️ Answer "${answer}" already revealed, skipping...`);
        return { revealed: false, newCount: currentRevealed.length, totalAnswers: 0 };
      }
      
      console.log(`[GAME] ✅ Answer "${answer}" is new, adding to revealed list...`);
      
      // WAŻNE: używaj aktualnego indeksu pytania z bazy danych, nie z parametru!
      const actualQuestionIndex = gameData.currentQuestionIndex;
      const totalAnswers = gameData.currentRound[actualQuestionIndex]?.answers.length || 0;
      const newRevealedAnswers = [...currentRevealed, { answer, points: finalPoints }];
      const newRevealedCount = newRevealedAnswers.length;
      const currentWrongAnswers = (gameData as any).wrongAnswersCount || 0;
      
      console.log(`[GAME] 📊 Question ${actualQuestionIndex}: Revealed ${newRevealedCount}/${totalAnswers} answers`);
      console.log(`[GAME] 📝 Previously revealed: [${currentRevealed.map((r: any) => r.answer).join(', ')}]`);
      console.log(`[GAME] 🆕 Adding: "${answer}" (${finalPoints} pts)`);
      console.log(`[GAME] ❌ Current wrong answers: ${currentWrongAnswers}`);
      
      transaction.update(gameRef, {
        revealedAnswers: newRevealedAnswers,
        totalPoints: (gameData.totalPoints || 0) + finalPoints,
      });
      
      return { revealed: true, newCount: newRevealedCount, totalAnswers, wrongAnswersCount: currentWrongAnswers };
    });
    
    if (!result.revealed) {
      return; // Odpowiedź już była odkryta
    }
    
    // Jeśli to najwyżej punktowana odpowiedź, pokaż overlay
    if (isTopAnswer) {
      console.log('[GAME] Top answer revealed! Showing alert in 1.5s...');
      setTimeout(async () => {
        await showTopAnswerAlert(gameCode);
      }, 1500);
    }
    
    // Sprawdź czy wszystkie odpowiedzi zostały odkryte
    if (result.newCount === result.totalAnswers) {
      console.log(`[GAME] ✅ ALL ANSWERS REVEALED! ${result.newCount}/${result.totalAnswers} - Showing round end alert in 1.5s...`);
      // Poczekaj 1.5 sekundy przed pokazaniem overlay
      setTimeout(async () => {
        await showRoundEndAlert(gameCode);
      }, 1500);
    } else if (result.wrongAnswersCount === 3) {
      // Jeśli mamy 3 błędy i odkryliśmy odpowiedź, koniec rundy
      console.log(`[GAME] ⚠️ 3 WRONG ANSWERS + answer revealed - Showing round end alert in 1.5s...`);
      setTimeout(async () => {
        await showRoundEndAlert(gameCode);
      }, 1500);
    }
  } else {
    const gameData = await localGameStorage.getGame(gameCode);
    if (!gameData) return;
    
    const currentTotal = gameData.totalPoints || 0;
    const currentRevealed = (gameData as any).revealedAnswers || [];
    const currentWrongAnswers = (gameData as any).wrongAnswersCount || 0;
    
    // Sprawdź czy odpowiedź już została odkryta
    const alreadyRevealed = currentRevealed.some((r: any) => r.answer === answer);
    if (alreadyRevealed) {
      console.log(`[GAME] Answer "${answer}" already revealed, skipping...`);
      return;
    }
    
    // WAŻNE: używaj aktualnego indeksu pytania z bazy danych, nie z parametru!
    const actualQuestionIndex = gameData.currentQuestionIndex;
    const totalAnswers = gameData.currentRound[actualQuestionIndex]?.answers.length || 0;
    const newRevealedAnswers = [...currentRevealed, { answer, points: finalPoints }];
    const newRevealedCount = newRevealedAnswers.length;
    
    console.log(`[GAME] 📊 Question ${actualQuestionIndex}: Revealed ${newRevealedCount}/${totalAnswers} answers`);
    console.log(`[GAME] 📝 Previously revealed: [${currentRevealed.map((r: any) => r.answer).join(', ')}]`);
    console.log(`[GAME] 🆕 Adding: "${answer}" (${finalPoints} pts)`);
    console.log(`[GAME] ❌ Current wrong answers: ${currentWrongAnswers}`);
    
    await localGameStorage.updateGame(gameCode, {
      revealedAnswers: newRevealedAnswers,
      totalPoints: currentTotal + finalPoints,
    } as any);
    
    // Jeśli to najwyżej punktowana odpowiedź, pokaż overlay
    if (isTopAnswer) {
      console.log('[GAME] Top answer revealed! Showing alert in 1.5s...');
      setTimeout(async () => {
        await showTopAnswerAlert(gameCode);
      }, 1500);
    }
    
    // Sprawdź czy wszystkie odpowiedzi zostały odkryte
    if (newRevealedCount === totalAnswers) {
      console.log(`[GAME] ✅ ALL ANSWERS REVEALED! ${newRevealedCount}/${totalAnswers} - Showing round end alert in 1.5s...`);
      // Poczekaj 1.5 sekundy przed pokazaniem overlay
      setTimeout(async () => {
        await showRoundEndAlert(gameCode);
      }, 1500);
    } else if (currentWrongAnswers === 3) {
      // Jeśli mamy 3 błędy i odkryliśmy odpowiedź, koniec rundy
      console.log(`[GAME] ⚠️ 3 WRONG ANSWERS + answer revealed - Showing round end alert in 1.5s...`);
      setTimeout(async () => {
        await showRoundEndAlert(gameCode);
      }, 1500);
    }
  }
};

export const addWrongAnswer = async (gameCode: string): Promise<void> => {
  console.log(`[GAME] Adding wrong answer`);
  
  if (useFirebase) {
    const gameRef = doc(db, 'games', gameCode);
    const gameSnap = await getDoc(gameRef);
    const gameData = gameSnap.data() as any;
    const currentCount = gameData.wrongAnswersCount || 0;
    const newCount = currentCount + 1;
    
    await updateDoc(gameRef, {
      wrongAnswersCount: newCount,
    });
    
    // Jeśli to 4 błąd, pokaż overlay końca rundy po błędzie
    if (newCount === 4) {
      console.log('[GAME] 4th wrong answer! Showing round end alert after wrong answer alert...');
      // Poczekaj 2 sekundy na zakończenie animacji wrongAnswerAlert
      setTimeout(async () => {
        await showRoundEndAlert(gameCode);
      }, 2000);
    }
  } else {
    const gameData = await localGameStorage.getGame(gameCode);
    if (!gameData) return;
    
    const currentCount = (gameData as any).wrongAnswersCount || 0;
    const newCount = currentCount + 1;
    
    await localGameStorage.updateGame(gameCode, {
      wrongAnswersCount: newCount,
    } as any);
    
    // Jeśli to 4 błąd, pokaż overlay końca rundy po błędzie
    if (newCount === 4) {
      console.log('[GAME] 4th wrong answer! Showing round end alert after wrong answer alert...');
      setTimeout(async () => {
        await showRoundEndAlert(gameCode);
      }, 2000);
    }
  }
};

export const transferPointsToTeam = async (gameCode: string, teamIndex: number): Promise<void> => {
  console.log(`[GAME] Transferring points to team ${teamIndex}`);
  
  const showRoundWinnerAlert = async (gameCode: string, winnerTeamName: string) => {
    console.log(`[GAME] Showing round winner alert for: ${winnerTeamName}`);
    
    if (useFirebase) {
      const gameRef = doc(db, 'games', gameCode);
      await updateDoc(gameRef, {
        roundWinnerAlert: true,
        roundWinnerName: winnerTeamName,
      });
      
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
      } as any);
      
      setTimeout(async () => {
        await localGameStorage.updateGame(gameCode, {
          roundWinnerAlert: false,
          roundWinnerName: null,
        } as any);
      }, 3000);
    }
  };
  
  if (useFirebase) {
    const gameRef = doc(db, 'games', gameCode);
    const gameSnap = await getDocFromServer(gameRef);
    const gameData = gameSnap.data() as any;
    
    const pointsToTransfer = gameData.totalPoints || 0;
    const fieldName = teamIndex === 1 ? 'team1Score' : 'team2Score';
    const teamNameField = teamIndex === 1 ? 'team1Name' : 'team2Name';
    const teamName = gameData[teamNameField] || `Drużyna ${teamIndex}`;
    const currentScore = gameData[fieldName] || 0;
    
    console.log(`[TRANSFER] 📡 Fresh data from server - Team 1: ${gameData.team1Score || 0}, Team 2: ${gameData.team2Score || 0}`);
    console.log(`[TRANSFER] Team ${teamIndex} (${teamName}): ${currentScore} + ${pointsToTransfer} = ${currentScore + pointsToTransfer}`);
    
    await updateDoc(gameRef, {
      [fieldName]: increment(pointsToTransfer),
      pointsTransferred: true,
      lastPointsRecipient: teamName,
      lastPointsAmount: pointsToTransfer,
    });
    
    await showRoundWinnerAlert(gameCode, teamName);
    
    const verifySnap = await getDocFromServer(gameRef);
    const verifyData = verifySnap.data() as any;
    console.log(`[TRANSFER] ✅ Points transferred successfully!`);
    console.log(`[TRANSFER] After transfer - Team 1: ${verifyData.team1Score || 0}, Team 2: ${verifyData.team2Score || 0}`);
  } else {
    const gameData = await localGameStorage.getGame(gameCode);
    if (!gameData) return;
    
    const pointsToTransfer = gameData.totalPoints || 0;
    const fieldName = teamIndex === 1 ? 'team1Score' : 'team2Score';
    const teamNameField = teamIndex === 1 ? 'team1Name' : 'team2Name';
    const currentScore = (gameData as any)[fieldName] || 0;
    const teamName = (gameData as any)[teamNameField] || `Drużyna ${teamIndex}`;
    const newScore = currentScore + pointsToTransfer;
    
    await localGameStorage.updateGame(gameCode, {
      [fieldName]: newScore,
      pointsTransferred: true,
      lastPointsRecipient: teamName,
      lastPointsAmount: pointsToTransfer,
    } as any);
    
    await showRoundWinnerAlert(gameCode, teamName);
  }
};

export const nextQuestion = async (gameCode: string): Promise<void> => {
  console.log(`[GAME] Moving to next question`);
  
  if (useFirebase) {
    const gameRef = doc(db, 'games', gameCode);
    const gameSnap = await getDocFromServer(gameRef);
    const gameData = gameSnap.data() as any;
    
    const nextIndex = (gameData.currentQuestionIndex || 0) + 1;
    
    await updateDoc(gameRef, {
      currentQuestionIndex: nextIndex,
      gamePhase: nextIndex >= 5 ? 'finished' : 'buzz',
      buzzedTeam: null,
      buzzedTeamName: null,
      buzzTimestamp: null,
      revealedAnswers: [],
      wrongAnswersCount: 0,
      totalPoints: 0,
      pointsTransferred: false,
      roundEnded: false,
      lastPointsRecipient: null,
      lastPointsAmount: 0,
      questionRevealed: false,
    });
  } else {
    const gameData = await localGameStorage.getGame(gameCode);
    if (!gameData) return;
    
    const nextIndex = (gameData.currentQuestionIndex || 0) + 1;
    
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
      roundEnded: false,
      lastPointsRecipient: null,
      lastPointsAmount: 0,
      questionRevealed: false,
    } as any);
  }
};

export const showNewGameAlert = async (gameCode: string): Promise<void> => {
  console.log('[GAME] Showing new game alert!');
  
  if (useFirebase) {
    const gameRef = doc(db, 'games', gameCode);
    await updateDoc(gameRef, {
      newGameAlert: true,
    });
    
    // Automatycznie ukryj alert po 2 sekundach
    setTimeout(async () => {
      await updateDoc(gameRef, {
        newGameAlert: false,
      });
    }, 2000);
  } else {
    await localGameStorage.updateGame(gameCode, {
      newGameAlert: true,
    } as any);
    
    setTimeout(async () => {
      await localGameStorage.updateGame(gameCode, {
        newGameAlert: false,
      } as any);
    }, 2000);
  }
};

export const restartGame = async (gameCode: string): Promise<void> => {
  console.log(`[GAME] Restarting game ${gameCode}`);
  
  if (useFirebase) {
    const gameRef = doc(db, 'games', gameCode);
    const gameSnap = await getDocFromServer(gameRef);
    const gameData = gameSnap.data() as any;
    
    await updateDoc(gameRef, {
      status: 'waiting',
      gamePhase: 'category-selection',
      selectedCategory: null,
      categorySelectedAt: null,
      currentQuestionIndex: 0,
      team1Score: 0,
      team2Score: 0,
      totalPoints: 0,
      categoryVotes: {},
      buzzedTeam: null,
      buzzedTeamName: null,
      buzzTimestamp: null,
      revealedAnswers: [],
      wrongAnswersCount: 0,
      pointsTransferred: false,
      roundEnded: false,
      lastPointsRecipient: null,
      lastPointsAmount: 0,
      warningActive: false,
      warningCountdown: null,
      questionRevealed: false,
      hostLeftAlert: false,
      hostLeftAt: null,
      teamLeftAlert: false,
      teamLeftName: null,
    });
    
    console.log(`[GAME] Game restarted - teams preserved`);
  } else {
    await localGameStorage.updateGame(gameCode, {
      status: 'waiting',
      gamePhase: 'category-selection',
      selectedCategory: null,
      categorySelectedAt: null,
      currentQuestionIndex: 0,
      team1Score: 0,
      team2Score: 0,
      totalPoints: 0,
      categoryVotes: {},
      buzzedTeam: null,
      buzzedTeamName: null,
      buzzTimestamp: null,
      revealedAnswers: [],
      wrongAnswersCount: 0,
      pointsTransferred: false,
      roundEnded: false,
      lastPointsRecipient: null,
      lastPointsAmount: 0,
      warningActive: false,
      warningCountdown: null,
      questionRevealed: false,
      hostLeftAlert: false,
      hostLeftAt: null,
      teamLeftAlert: false,
      teamLeftName: null,
    } as any);
  }
};

export const subscribeToGame = (gameCode: string, callback: (data: DocumentData) => void): Unsubscribe => {
  if (useFirebase) {
    const gameRef = doc(db, 'games', gameCode);
    return onSnapshot(gameRef, (doc) => {
      if (doc.exists()) {
        callback(doc.data());
      }
    });
  } else {
    localGameStorage.getGame(gameCode)
      .then(gameData => {
        if (gameData) {
          callback(gameData as any);
        }
      })
      .catch(err => {
        console.log(`[DEMO MODE] Waiting for game ${gameCode} to be created...`);
      });
    
    return localGameStorage.onGameChange(gameCode, callback as any);
  }
};

export const endGame = async (gameCode: string): Promise<void> => {
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

export const resetWrongAnswers = async (gameCode: string): Promise<void> => {
  console.log(`[GAME] Resetting wrong answers`);
  
  if (useFirebase) {
    const gameRef = doc(db, 'games', gameCode);
    await updateDoc(gameRef, {
      wrongAnswersCount: 0,
    });
  } else {
    await localGameStorage.updateGame(gameCode, {
      wrongAnswersCount: 0,
    } as any);
  }
};

export const toggleWarning = async (gameCode: string, active: boolean): Promise<void> => {
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
    } as any);
  }
};

export const updateWarningCountdown = async (gameCode: string, countdown: number): Promise<void> => {
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
    } as any);
  }
};

export const showWrongAnswerAlert = async (gameCode: string, wrongCount: number): Promise<void> => {
  console.log(`[GAME] Showing wrong answer alert (count: ${wrongCount})`);
  
  if (useFirebase) {
    const gameRef = doc(db, 'games', gameCode);
    
    // ZAWSZE pokaż standardowy overlay "Błędna odpowiedź!"
    await updateDoc(gameRef, {
      wrongAnswerAlert: true,
      wrongAnswerCount: wrongCount,
    });
    
    setTimeout(async () => {
      await updateDoc(gameRef, {
        wrongAnswerAlert: false,
      });
    }, 2000);
    
    // Po 2 błędzie - pokaż dodatkowy overlay "Drużyna przeciwna się naradza" po 2.5s
    if (wrongCount === 2) {
      setTimeout(async () => {
        await updateDoc(gameRef, {
          opponentConsultationAlert: true,
        });
        
        setTimeout(async () => {
          await updateDoc(gameRef, {
            opponentConsultationAlert: false,
          });
        }, 2000);
      }, 2500);
    }
    // Po 3 błędzie - pokaż dodatkowy overlay "Pytanie przechodzi" po 2.5s
    else if (wrongCount === 3) {
      setTimeout(async () => {
        await updateDoc(gameRef, {
          transferQuestionAlert: true,
        });
        
        setTimeout(async () => {
          await updateDoc(gameRef, {
            transferQuestionAlert: false,
          });
        }, 2000);
      }, 2500);
    }
  } else {
    // Demo mode - to samo dla local storage
    await localGameStorage.updateGame(gameCode, {
      wrongAnswerAlert: true,
      wrongAnswerCount: wrongCount,
    } as any);
    
    setTimeout(async () => {
      await localGameStorage.updateGame(gameCode, {
        wrongAnswerAlert: false,
      } as any);
    }, 2000);
    
    if (wrongCount === 2) {
      setTimeout(async () => {
        await localGameStorage.updateGame(gameCode, {
          opponentConsultationAlert: true,
        } as any);
        
        setTimeout(async () => {
          await localGameStorage.updateGame(gameCode, {
            opponentConsultationAlert: false,
          } as any);
        }, 2000);
      }, 2500);
    }
    else if (wrongCount === 3) {
      setTimeout(async () => {
        await localGameStorage.updateGame(gameCode, {
          transferQuestionAlert: true,
        } as any);
        
        setTimeout(async () => {
          await localGameStorage.updateGame(gameCode, {
            transferQuestionAlert: false,
          } as any);
        }, 2000);
      }, 2500);
    }
  }
};

export const showNextQuestionAlert = async (gameCode: string): Promise<void> => {
  console.log(`[GAME] Showing next question alert`);
  
  if (useFirebase) {
    const gameRef = doc(db, 'games', gameCode);
    await updateDoc(gameRef, {
      nextQuestionAlert: true,
    });
    
    setTimeout(async () => {
      await updateDoc(gameRef, {
        nextQuestionAlert: false,
      });
    }, 2000);
  } else {
    await localGameStorage.updateGame(gameCode, {
      nextQuestionAlert: true,
    } as any);
    
    setTimeout(async () => {
      await localGameStorage.updateGame(gameCode, {
        nextQuestionAlert: false,
      } as any);
    }, 2000);
  }
};

export const showGameResultAlert = async (gameCode: string): Promise<void> => {
  console.log(`[GAME] Showing game result alert`);
  
  if (useFirebase) {
    const gameRef = doc(db, 'games', gameCode);
    await updateDoc(gameRef, {
      gameResultAlert: true,
    });
    
    setTimeout(async () => {
      await updateDoc(gameRef, {
        gameResultAlert: false,
      });
    }, 3000);
  } else {
    await localGameStorage.updateGame(gameCode, {
      gameResultAlert: true,
    } as any);
    
    setTimeout(async () => {
      await localGameStorage.updateGame(gameCode, {
        gameResultAlert: false,
      } as any);
    }, 3000);
  }
};

// Prowadzący opuszcza grę
export const hostLeftGame = async (gameCode: string): Promise<void> => {
  console.log(`[HOST_LEFT] Host leaving game: ${gameCode}`);
  console.log(`[HOST_LEFT] useFirebase: ${useFirebase}`);
  
  if (useFirebase) {
    const gameRef = doc(db, 'games', gameCode);
    console.log(`[HOST_LEFT] Updating Firestore...`);
    await updateDoc(gameRef, {
      hostLeftAlert: true,
      hostLeftAt: new Date().toISOString(),
    });
    console.log(`[HOST_LEFT] Firestore updated successfully`);
  } else {
    // Demo mode
    console.log(`[HOST_LEFT] Updating local storage...`);
    await localGameStorage.updateGame(gameCode, {
      hostLeftAlert: true,
      hostLeftAt: new Date().toISOString(),
    } as any);
    console.log(`[HOST_LEFT] Local storage updated successfully`);
  }
  
  console.log(`[HOST_LEFT] Host left alert set for game ${gameCode}`);
};

// Drużyna opuszcza grę
export const teamLeftGame = async (gameCode: string, teamName: string): Promise<void> => {
  console.log(`[TEAM_LEFT] Team "${teamName}" leaving game: ${gameCode}`);
  
  if (useFirebase) {
    const gameRef = doc(db, 'games', gameCode);
    await updateDoc(gameRef, {
      teamLeftAlert: true,
      teamLeftName: teamName,
      teamLeftAt: new Date().toISOString(),
    });
  } else {
    // Demo mode
    await localGameStorage.updateGame(gameCode, {
      teamLeftAlert: true,
      teamLeftName: teamName,
      teamLeftAt: new Date().toISOString(),
    } as any);
  }
  
  console.log(`[TEAM_LEFT] Team left alert set for game ${gameCode}`);
};

// Ustawienie statusu tworzenia własnej kategorii
export const setCreatingCustomCategory = async (gameCode: string, isCreating: boolean = true): Promise<void> => {
  console.log(`[CUSTOM_CAT] Host ${isCreating ? 'is creating' : 'finished creating'} custom category for game: ${gameCode}`);
  
  if (useFirebase) {
    const gameRef = doc(db, 'games', gameCode);
    await updateDoc(gameRef, {
      gamePhase: isCreating ? 'creating-custom-category' : 'category-selection',
    });
  } else {
    await localGameStorage.updateGame(gameCode, {
      gamePhase: isCreating ? 'creating-custom-category' : 'category-selection',
    } as any);
  }
};

// Zapisanie własnej kategorii i powrót do wyboru
export const saveCustomCategory = async (gameCode: string, customCategories: any[]): Promise<void> => {
  console.log(`[CUSTOM_CAT] 💾 Saving custom categories for game: ${gameCode}`, customCategories);
  
  if (useFirebase) {
    const gameRef = doc(db, 'games', gameCode);
    await updateDoc(gameRef, {
      hostCustomCategories: customCategories,
    });
    console.log(`[CUSTOM_CAT] ✅ Custom categories saved to Firebase`);
  } else {
    await localGameStorage.updateGame(gameCode, {
      hostCustomCategories: customCategories,
    } as any);
    console.log(`[CUSTOM_CAT] ✅ Custom categories saved to local storage`);
  }
};
