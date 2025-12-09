import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import questions from "../../utils/questions";
import type { Question } from "../../types/game";

// Typy dla stanu pytań
interface QuestionState {
  team1: number;
  team2: number;
  rounds: Question[];
  selectedTeam: 'team1' | 'team2' | null;
  totalPoints: number;
  currentRound: Question;
  correctAnswers: string[];
  wrongAnswers: string[];
}

const initialState: QuestionState = {
  team1: 0,
  team2: 0,
  rounds: questions,
  selectedTeam: null,
  totalPoints: 0,
  currentRound: questions[0],
  correctAnswers: [],
  wrongAnswers: [],
};

// Maksymalna liczba błędów: 4 (3 dla pierwszej drużyny + 1 dla przeciwnej)
const MAX_WRONG_ANSWERS = 4;

const questionSlice = createSlice({
  name: "question",
  initialState,
  reducers: {
    resetCorrectAnswers: (state) => {
      state.correctAnswers = [];
    },
    resetWrongAnswers: (state) => {
      state.wrongAnswers = [];
    },
    correctAnswer: (state, action: PayloadAction<string>) => {
      const answer = action.payload;
      const correctAnswerObj = state.currentRound.answers.find((a: { answer: string; points: number }) => a.answer === answer);

      if (correctAnswerObj) {
        const pointsEarned = correctAnswerObj.points;
        state.correctAnswers.push(answer);
        state.totalPoints += pointsEarned;
      }
    },
    uncorrectAnswer: (state, action: PayloadAction<string>) => {
      const incorrectAnswer = action.payload;
      state.wrongAnswers.push(incorrectAnswer);

      if (state.wrongAnswers.length > MAX_WRONG_ANSWERS) {
        state.wrongAnswers.shift();
      }
    },
    transferPoints: (state, action: PayloadAction<{ selectedTeam: 'team1' | 'team2'; pointsToTransfer: number }>) => {
      const { selectedTeam, pointsToTransfer } = action.payload;
      
      // Zabezpieczenie: tylko team1 i team2 mogą dostać punkty
      if (selectedTeam !== "team1" && selectedTeam !== "team2") return;
      
      state[selectedTeam] += pointsToTransfer;
    },
    nextQuestion: (state) => {
      const currentIndex = state.rounds.findIndex((r: Question) => r.question === state.currentRound.question);
      const nextIndex = currentIndex + 1;

      if (nextIndex < state.rounds.length) {
        state.currentRound = state.rounds[nextIndex];
      }
    },
    selectedTeam: (state, action: PayloadAction<'team1' | 'team2'>) => {
      state.selectedTeam = action.payload;
    },
    resetTotalPoints: (state) => {
      state.totalPoints = 0;
    },
    resetGame: () => {
      return {
        ...initialState,
      };
    },
  },
});

export const {
  resetCorrectAnswers,
  resetWrongAnswers,
  correctAnswer,
  uncorrectAnswer,
  transferPoints,
  nextQuestion,
  selectedTeam,
  resetTotalPoints,
  resetGame,
} = questionSlice.actions;

export type { QuestionState };
export default questionSlice.reducer;
