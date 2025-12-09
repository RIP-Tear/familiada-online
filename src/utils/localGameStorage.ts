import type { GameData } from '../types/game';

// Symulacja lokalnego storage dla trybu demo (bez Firebase)
class LocalGameStorage {
  private games: Record<string, GameData>;
  private listeners: Record<string, Array<(game: GameData) => void>>;

  constructor() {
    this.games = {};
    this.listeners = {};
  }

  // Tworzenie gry
  async createGame(gameCode: string, gameData: GameData): Promise<{ success: boolean }> {
    this.games[gameCode] = { ...gameData };
    console.log(`[DEMO MODE] Created game: ${gameCode}`, gameData);
    return { success: true };
  }

  // Pobieranie gry
  async getGame(gameCode: string): Promise<GameData | null> {
    const game = this.games[gameCode];
    if (!game) {
      return null; // Zwróć null zamiast rzucać błąd
    }
    return game;
  }

  // Aktualizacja gry
  async updateGame(gameCode: string, updates: Partial<GameData>): Promise<{ success: boolean }> {
    if (!this.games[gameCode]) {
      throw new Error('Gra nie istnieje');
    }
    
    this.games[gameCode] = {
      ...this.games[gameCode],
      ...updates,
    };
    
    console.log(`[DEMO MODE] Updated game: ${gameCode}`, updates);
    
    // Powiadom słuchaczy
    if (this.listeners[gameCode]) {
      this.listeners[gameCode].forEach(callback => {
        callback(this.games[gameCode]);
      });
    }
    
    return { success: true };
  }

  // Nasłuchiwanie zmian
  onGameChange(gameCode: string, callback: (game: GameData) => void): () => void {
    if (!this.listeners[gameCode]) {
      this.listeners[gameCode] = [];
    }
    this.listeners[gameCode].push(callback);
    
    // Zwróć funkcję do odsubskrybowania
    return () => {
      this.listeners[gameCode] = this.listeners[gameCode].filter(
        cb => cb !== callback
      );
    };
  }

  // Czyszczenie
  clearAll(): void {
    this.games = {};
    this.listeners = {};
  }
}

export const localGameStorage = new LocalGameStorage();
