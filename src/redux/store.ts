import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from 'redux-persist/lib/storage';

import questionReducer from "./reducer/questionReducer";
import gameReducer from "./reducer/gameSlice";
import type { QuestionState } from "./reducer/questionReducer";
import type { GameState } from "./reducer/gameSlice";

// Typ dla całego stanu aplikacji
export interface RootState {
  question: QuestionState;
  game: GameState;
}

const rootReducer = combineReducers({
  question: questionReducer,
  game: gameReducer,
});

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["question", "game"],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

const persistor = persistStore(store);

export type AppDispatch = typeof store.dispatch;

export { store, persistor };
