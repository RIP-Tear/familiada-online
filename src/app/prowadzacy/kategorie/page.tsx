"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/redux/hooks";
import { subscribeToGame } from "@/utils/firebaseUtils";
import { Navbar } from "@/components";
import { PiPlusCircleFill, PiStarFill, PiPen, PiArrowLeftBold } from "react-icons/pi";
import "@/styles/game.scss";
import type { QuestionSet } from "@/types/game";

export default function HostCategoriesPage() {
  const router = useRouter();
  const gameState = useAppSelector((state) => state.game);
  
  const [hostCustomCategories, setHostCustomCategories] = useState<QuestionSet[]>([]);

  useEffect(() => {
    document.title = "Tworzenie kategorii | Familiada Online";
  }, []);

  useEffect(() => {
    if (!gameState.gameCode) {
      router.push('/prowadzacy/');
      return;
    }

    const unsubscribe = subscribeToGame(gameState.gameCode, (gameData) => {
      setHostCustomCategories(gameData.hostCustomCategories || []);
    });

    return () => unsubscribe();
  }, [gameState.gameCode]);

  const handleCreateCustomCategory = () => {
    // Przekieruj do dedykowanego edytora kategorii
    router.push('/prowadzacy/kategorie/edytor');
  };

  const handleEditCustomCategory = (category: QuestionSet) => {
    // Przekieruj do dedykowanego edytora kategorii z ID kategorii
    router.push(`/prowadzacy/kategorie/edytor?editCategory=${category.id}`);
  };

  const handleBackToWaiting = () => {
    router.push('/prowadzacy/');
  };

  const isCategoryComplete = (category: QuestionSet) => {
    if (!category.name && !category.category) return false;
    if (!category.questions || category.questions.length !== 5) return false;
    
    return category.questions.every(q => {
      if (!q.question || q.question.trim() === '') return false;
      if (!q.answers || q.answers.length < 6) return false;
      const filledAnswers = q.answers.filter(a => a && a.trim() !== '');
      return filledAnswers.length >= 6;
    });
  };

  // Widok listy kategorii
  return (
    <>
      <Navbar />
      <div className="game-container" style={{ maxWidth: '800px' }}>
        <div className="game-header">
          <h1 className="header-title">Tworzenie kategorii</h1>
          <div className="header-team">Prowadzący</div>
        </div>
        <div className="category-actions-section">
          <button
            className="btn-create-custom-outside"
            onClick={handleCreateCustomCategory}
          >
            <PiPlusCircleFill className="btn-icon" />
            Stwórz własną kategorię pytań
          </button>

          <button
            className="btn-back-to-waiting"
            onClick={handleBackToWaiting}
          >
            <PiArrowLeftBold className="btn-icon" />
            Wróć do poczekalni
          </button>
        </div>

          {/* Lista stworzonych własnych kategorii */}
          {hostCustomCategories.length > 0 ? (
            <div className="host-custom-categories-list">
              <h3 className="custom-categories-title">Twoje kategorie:</h3>
              <div className="custom-categories-grid">
                {hostCustomCategories.map((category) => {
                  const isComplete = isCategoryComplete(category);
                  return (
                    <div 
                      key={category.id} 
                      className={`custom-category-card ${isComplete ? 'complete' : 'incomplete'}`}
                      onClick={() => handleEditCustomCategory(category)}
                    >
                      <div className="custom-category-content">
                        <h4 className="custom-category-name">
                          {category.name || category.category || 'Bez nazwy'}
                        </h4>
                        <div className="custom-category-difficulty">
                          {Array.from({ length: category.difficulty === 'easy' ? 1 : category.difficulty === 'medium' ? 2 : 3 }).map((_, i) => (
                            <PiStarFill key={i} />
                          ))}
                        </div>
                      </div>
                      <div className="custom-category-edit">
                        <PiPen />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="no-categories-message">
              <p>Nie masz jeszcze żadnych własnych kategorii.</p>
              <p>Kliknij przycisk powyżej, aby stworzyć pierwszą!</p>
            </div>
          )}
        </div>
    </>
  );
}
