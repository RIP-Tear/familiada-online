import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import createWebStorage from "redux-persist/lib/storage/createWebStorage";

import questionReducer from "./reducer/questionReducer";
import gameReducer from "./reducer/gameSlice";
import type { QuestionState } from "./reducer/questionReducer";
import type { GameState } from "./reducer/gameSlice";

// Typ dla całego stanu aplikacji
export interface RootState {
  question: QuestionState;
  game: GameState;
}

// Tworzenie noop storage dla SSR
const createNoopStorage = () => {
  return {
    getItem(_key: string) {
      return Promise.resolve(null);
    },
    setItem(_key: string, value: any) {
      return Promise.resolve(value);
    },
    removeItem(_key: string) {
      return Promise.resolve();
    },
  };
};

// Użyj localStorage tylko po stronie klienta
const storage =
  typeof window !== "undefined"
    ? createWebStorage("local")
    : createNoopStorage();

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
