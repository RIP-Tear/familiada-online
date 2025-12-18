import type { GameData } from '../types/game';

// Struktura zapisywanej gry w historii
export interface GameHistoryEntry {
  gameCode: string;
  createdAt: string;
  lastAccessedAt: string;
  category?: string;
  teams: string[];
  isActive: boolean;
  finalScore?: {
    team1: number;
    team2: number;
  };
  status: 'waiting' | 'playing' | 'finished';
}

const STORAGE_KEY = 'familiada_game_history';
const MAX_HISTORY_ENTRIES = 20; // Maksymalna liczba zapisanych gier

class GameHistoryStorage {
  // Pobranie całej historii gier
  getHistory(): GameHistoryEntry[] {
    if (typeof window === 'undefined') return [];
    
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return [];
      
      const history = JSON.parse(stored) as GameHistoryEntry[];
      // Sortuj po dacie ostatniego dostępu (najnowsze pierwsze)
      return history.sort((a, b) => 
        new Date(b.lastAccessedAt).getTime() - new Date(a.lastAccessedAt).getTime()
      );
    } catch (error) {
      console.error('Error reading game history:', error);
      return [];
    }
  }

  // Dodanie nowej gry do historii
  addGame(gameCode: string, category?: string): void {
    if (typeof window === 'undefined') return;
    
    try {
      const history = this.getHistory();
      
      // Sprawdź czy gra już istnieje w historii
      const existingIndex = history.findIndex(g => g.gameCode === gameCode);
      
      const now = new Date().toISOString();
      const newEntry: GameHistoryEntry = {
        gameCode,
        createdAt: now,
        lastAccessedAt: now,
        category,
        teams: [],
        isActive: true,
        status: 'waiting'
      };
      
      if (existingIndex >= 0) {
        // Aktualizuj istniejący wpis
        history[existingIndex] = {
          ...history[existingIndex],
          lastAccessedAt: now,
          isActive: true
        };
      } else {
        // Dodaj nowy wpis na początku
        history.unshift(newEntry);
        
        // Ogranicz historię do MAX_HISTORY_ENTRIES
        if (history.length > MAX_HISTORY_ENTRIES) {
          history.splice(MAX_HISTORY_ENTRIES);
        }
      }
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch (error) {
      console.error('Error adding game to history:', error);
    }
  }

  // Aktualizacja gry w historii
  updateGame(gameCode: string, updates: Partial<GameHistoryEntry>): void {
    if (typeof window === 'undefined') return;
    
    try {
      const history = this.getHistory();
      const index = history.findIndex(g => g.gameCode === gameCode);
      
      if (index >= 0) {
        history[index] = {
          ...history[index],
          ...updates,
          lastAccessedAt: new Date().toISOString()
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
      }
    } catch (error) {
      console.error('Error updating game in history:', error);
    }
  }

  // Oznaczenie gry jako nieaktywnej (gdy nie istnieje już w Firebase)
  markAsInactive(gameCode: string): void {
    this.updateGame(gameCode, { isActive: false });
  }

  // Usunięcie gry z historii
  removeGame(gameCode: string): void {
    if (typeof window === 'undefined') return;
    
    try {
      const history = this.getHistory();
      const filtered = history.filter(g => g.gameCode !== gameCode);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error('Error removing game from history:', error);
    }
  }

  // Pobranie konkretnej gry z historii
  getGame(gameCode: string): GameHistoryEntry | null {
    const history = this.getHistory();
    return history.find(g => g.gameCode === gameCode) || null;
  }

  // Aktualizacja drużyn w grze
  updateTeams(gameCode: string, teams: string[]): void {
    this.updateGame(gameCode, { teams });
  }

  // Aktualizacja statusu gry
  updateStatus(gameCode: string, status: 'waiting' | 'playing' | 'finished', finalScore?: { team1: number; team2: number }): void {
    const updates: Partial<GameHistoryEntry> = { status };
    if (finalScore) {
      updates.finalScore = finalScore;
    }
    this.updateGame(gameCode, updates);
  }

  // Wyczyszczenie całej historii
  clearHistory(): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing game history:', error);
    }
  }
}

export const gameHistoryStorage = new GameHistoryStorage();
