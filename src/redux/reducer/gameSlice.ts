import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Typy dla stanu gry
interface GameState {
  // Tryb gry
  mode: 'host' | 'player' | null;
  
  // Informacje o grze
  gameCode: string | null;
  gameId: string | null;
  status: 'idle' | 'waiting' | 'playing' | 'finished';
  
  // Informacje o użytkowniku
  userId: string | null;
  userName: string | null;
  userTeam: 'team1' | 'team2' | null;
  
  // Lista drużyn
  teams: Array<{
    id: string;
    name: string;
    joinedAt: string;
  }>;
  
  // Stan połączenia
  isConnected: boolean;
  error: string | null;
}

const initialState: GameState = {
  // Tryb gry
  mode: null,
  
  // Informacje o grze
  gameCode: null,
  gameId: null,
  status: 'idle',
  
  // Informacje o użytkowniku
  userId: null,
  userName: null,
  userTeam: null,
  
  // Lista drużyn
  teams: [],
  
  // Stan połączenia
  isConnected: false,
  error: null,
};

const gameSlice = createSlice({
  name: "game",
  initialState,
  reducers: {
    // Ustawienie trybu (host/player)
    setMode: (state, action: PayloadAction<'host' | 'player'>) => {
      state.mode = action.payload;
    },
    
    // Tworzenie gry (host)
    createGame: (state, action: PayloadAction<{ gameCode: string; gameId: string; userId: string }>) => {
      const { gameCode, gameId, userId } = action.payload;
      state.gameCode = gameCode;
      state.gameId = gameId;
      state.userId = userId;
      state.mode = 'host';
      state.status = 'waiting';
      state.isConnected = true;
    },
    
    // Dołączanie do gry (player)
    joinGame: (state, action: PayloadAction<{ 
      gameCode: string; 
      gameId: string; 
      userId: string; 
      userName: string; 
      userTeam: 'team1' | 'team2' 
    }>) => {
      const { gameCode, gameId, userId, userName, userTeam } = action.payload;
      state.gameCode = gameCode;
      state.gameId = gameId;
      state.userId = userId;
      state.userName = userName;
      state.userTeam = userTeam;
      state.mode = 'player';
      state.isConnected = true;
    },
    
    // Aktualizacja statusu gry
    updateGameStatus: (state, action: PayloadAction<'idle' | 'waiting' | 'playing' | 'finished'>) => {
      state.status = action.payload;
    },
    
    // Aktualizacja listy graczy
    updateTeams: (state, action: PayloadAction<Array<{ id: string; name: string; joinedAt: string }>>) => {
      state.teams = action.payload;
    },
    
    // Ustawienie błędu
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.isConnected = false;
    },
    
    // Reset gry (wyjście)
    leaveGame: () => {
      return initialState;
    },
    
    // Aktualizacja połączenia
    setConnected: (state, action: PayloadAction<boolean>) => {
      state.isConnected = action.payload;
    },
  },
});

export const {
  setMode,
  createGame,
  joinGame,
  updateGameStatus,
  updateTeams,
  setError,
  leaveGame,
  setConnected,
} = gameSlice.actions;

export type { GameState };
export default gameSlice.reducer;
