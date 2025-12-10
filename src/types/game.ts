// Typy dla pytań i odpowiedzi
export interface Answer {
  answer: string;
  points: number;
}

export interface Question {
  question: string;
  answers: Answer[];
}

export interface SimpleQuestion {
  question: string;
  answers: string[];
}

export interface QuestionSet {
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  questions: SimpleQuestion[];
}

export interface CategoryInfo {
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

// Typy dla gry
export interface Team {
  id: string;
  name: string;
  joinedAt: string;
}

export interface GameData {
  code: string;
  hostId: string;
  status: 'waiting' | 'playing' | 'finished' | 'ended';
  createdAt: string;
  team1Score: number;
  team2Score: number;
  currentQuestionIndex: number;
  currentRound: Question[];
  totalPoints: number;
  correctAnswers: string[];
  wrongAnswers: string[];
  selectedTeam: number | null;
  categoryVotes: Record<string, string>;
  players: string[];
  rounds: Question[];
  teams?: Team[];
  team1Name?: string;
  team2Name?: string;
  
  // Dodatkowe pola używane w aplikacji
  selectedCategory?: string;
  categorySelectedAt?: string;
  gamePhase?: 'category-selection' | 'buzz' | 'playing' | 'finished';
  buzzedTeam?: string | null;
  buzzedTeamName?: string | null;
  buzzTimestamp?: number | null;
  revealedAnswers?: Array<{ answer: string; points: number }>;
  wrongAnswersCount?: number;
  pointsTransferred?: boolean;
  lastPointsRecipient?: string | null;
  lastPointsAmount?: number;
  warningActive?: boolean;
  warningCountdown?: number | null;
  wrongAnswerAlert?: boolean;
  wrongAnswerCount?: number;
  opponentConsultationAlert?: boolean;
  transferQuestionAlert?: boolean;
  nextQuestionAlert?: boolean;
  roundWinnerAlert?: boolean;
  roundWinnerName?: string | null;
  gameResultAlert?: boolean;
  categorySelectedAlert?: boolean;
  selectedCategoryName?: string;
  topAnswerAlert?: boolean;
  buzzAlert?: boolean;
  buzzAlertTeamName?: string;
  roundEndAlert?: boolean;
  questionRevealed?: boolean;
  teamVsAlert?: boolean;
}

export interface JoinGameResult {
  gameCode: string;
  gameId: string;
  teamId: string;
}

export interface CreateGameResult {
  gameCode: string;
  gameId: string;
}
