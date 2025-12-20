"use client";
import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppSelector } from "@/redux/hooks";
import { subscribeToGame, saveCustomCategory } from "@/utils/firebaseUtils";
import { Navbar } from "@/components";
import {
  PiArrowRightBold,
  PiXBold,
  PiStarFill,
  PiCheckBold,
  PiDotsSixVerticalBold,
} from "react-icons/pi";
import "@/styles/game.scss";
import "@/styles/board.scss";
import type { QuestionSet } from "@/types/game";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Komponent SortableAnswer
const SortableAnswer = React.memo(({ 
  id, 
  answer, 
  index, 
  questionIndex, 
  totalAnswers,
  onUpdateAnswer,
  onRemoveAnswer 
}: { 
  id: string; 
  answer: string; 
  index: number; 
  questionIndex: number;
  totalAnswers: number;
  onUpdateAnswer: (questionIdx: number, answerIdx: number, value: string) => void;
  onRemoveAnswer: (questionIdx: number, answerIdx: number) => void;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdateAnswer(questionIndex, index, e.target.value);
  }, [onUpdateAnswer, questionIndex, index]);

  const handleRemove = React.useCallback(() => {
    onRemoveAnswer(questionIndex, index);
  }, [onRemoveAnswer, questionIndex, index]);

  const isMinimumAnswers = totalAnswers <= 3;

  return (
    <div ref={setNodeRef} style={style} className="answer-row">
      <span className="answer-num">{index + 1}.</span>
      <div className="answer-input-wrapper">
        <input
          type="text"
          className="answer-input-board"
          value={answer}
          onChange={handleChange}
          placeholder="Wpisz odpowiedź..."
          maxLength={100}
        />
        <button
          className={`btn-control-board btn-remove-board ${isMinimumAnswers ? 'disabled' : ''}`}
          onClick={handleRemove}
          type="button"
          disabled={isMinimumAnswers}
        >
          <PiXBold />
        </button>
        <div className="drag-handle" {...attributes} {...listeners}>
          <PiDotsSixVerticalBold />
        </div>
      </div>
    </div>
  );
});

SortableAnswer.displayName = 'SortableAnswer';

function CategoryEditorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const gameState = useAppSelector((state) => state.game);
  
  const editCategoryId = searchParams.get('editCategory');
  const returnTo = searchParams.get('returnTo') || 'list'; // 'list' lub 'game'
  
  const [customCategoryName, setCustomCategoryName] = useState('');
  const [customDifficulty, setCustomDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [customQuestions, setCustomQuestions] = useState(Array.from({ length: 5 }, () => ({
    question: '',
    answers: ['', '', '']
  })));
  const [creatorStep, setCreatorStep] = useState(0); // 0 = nazwa i trudność, 1-5 = pytania
  const [hostCustomCategories, setHostCustomCategories] = useState<QuestionSet[]>([]);

  useEffect(() => {
    document.title = editCategoryId ? "Edytuj kategorię | Familiada Online" : "Nowa kategoria | Familiada Online";
  }, [editCategoryId]);

  useEffect(() => {
    if (!gameState.gameCode) {
      router.push('/prowadzacy/');
      return;
    }

    const unsubscribe = subscribeToGame(gameState.gameCode, (gameData) => {
      const categories = gameData.hostCustomCategories || [];
      setHostCustomCategories(categories);

      // Jeśli edytujemy kategorię, załaduj jej dane
      if (editCategoryId) {
        const categoryToEdit = categories.find((cat: QuestionSet) => cat.id === editCategoryId);
        if (categoryToEdit) {
          setCustomCategoryName(categoryToEdit.name || categoryToEdit.category);
          setCustomDifficulty(categoryToEdit.difficulty);
          setCustomQuestions(categoryToEdit.questions.map(q => ({
            question: q.question,
            answers: [...q.answers, '', ''].slice(0, Math.max(q.answers.length, 3))
          })));
        }
      }
    });

    return () => unsubscribe();
  }, [gameState.gameCode, editCategoryId]);

  // Stabilny handler dla aktualizacji odpowiedzi
  const handleUpdateAnswer = React.useCallback((questionIdx: number, answerIdx: number, value: string) => {
    setCustomQuestions(prev => {
      const newQuestions = [...prev];
      newQuestions[questionIdx].answers[answerIdx] = value;
      return newQuestions;
    });
  }, []);

  const handleAddAnswer = (questionIndex: number) => {
    if (customQuestions[questionIndex].answers.length >= 10) {
      alert('Maksymalnie 10 odpowiedzi na pytanie');
      return;
    }
    
    const newQuestions = [...customQuestions];
    newQuestions[questionIndex].answers.push('');
    setCustomQuestions(newQuestions);
  };

  const handleRemoveAnswer = (questionIndex: number, answerIndex: number) => {
    if (customQuestions[questionIndex].answers.length <= 3) {
      alert('Minimum 3 odpowiedzi na pytanie');
      return;
    }
    
    const newQuestions = [...customQuestions];
    newQuestions[questionIndex].answers.splice(answerIndex, 1);
    setCustomQuestions(newQuestions);
  };

  const handleDragEnd = (event: DragEndEvent, questionIndex: number) => {
    const { active, over } = event;
    
    if (!over || active.id === over.id) {
      return;
    }
    
    const newQuestions = [...customQuestions];
    const answers = newQuestions[questionIndex].answers;
    const oldIndex = answers.findIndex((_, idx) => `answer-${questionIndex}-${idx}` === active.id);
    const newIndex = answers.findIndex((_, idx) => `answer-${questionIndex}-${idx}` === over.id);
    
    newQuestions[questionIndex].answers = arrayMove(answers, oldIndex, newIndex);
    setCustomQuestions(newQuestions);
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const sortableAnswerItems = React.useMemo(() => {
    if (creatorStep === 0 || !customQuestions[creatorStep - 1]) {
      return [];
    }
    return customQuestions[creatorStep - 1].answers.map((_, i) => `answer-${creatorStep - 1}-${i}`);
  }, [customQuestions, creatorStep]);

  const handleSaveCustomCategory = async () => {
    // Walidacja - nazwa kategorii
    if (!customCategoryName.trim()) {
      alert('Wprowadź nazwę kategorii');
      return;
    }
    
    // Walidacja - wszystkie pytania i odpowiedzi
    for (let i = 0; i < customQuestions.length; i++) {
      const q = customQuestions[i];
      
      if (!q.question.trim()) {
        alert(`Pytanie ${i + 1}: Wprowadź treść pytania`);
        return;
      }
      
      const validAnswers = q.answers.filter(a => a.trim() !== '');
      if (validAnswers.length < 3) {
        alert(`Pytanie ${i + 1}: Minimum 3 wypełnione odpowiedzi (obecnie: ${validAnswers.length})`);
        return;
      }
    }
    
    try {
      const newCategory: QuestionSet = {
        id: editCategoryId || `custom_${Date.now()}`,
        name: customCategoryName.trim(),
        category: customCategoryName.trim(),
        difficulty: customDifficulty,
        questions: customQuestions.map(q => ({
          question: q.question.trim(),
          answers: q.answers.filter(a => a.trim() !== '').map(a => a.trim())
        }))
      };
      
      const updatedCategories = editCategoryId
        ? hostCustomCategories.map(cat => cat.id === editCategoryId ? newCategory : cat)
        : [...hostCustomCategories, newCategory];
      
      await saveCustomCategory(gameState.gameCode, updatedCategories);
      
      // Wróć do odpowiedniego widoku
      if (returnTo === 'game') {
        router.push('/game/host/');
      } else {
        router.push('/prowadzacy/kategorie');
      }
    } catch (error) {
      console.error("Error saving category:", error);
      alert('Błąd podczas zapisywania kategorii');
    }
  };

  const handleCancel = () => {
    if (returnTo === 'game') {
      router.push('/game/host/');
    } else {
      router.push('/prowadzacy/kategorie');
    }
  };

  return (
    <>
      <Navbar />
      <div className="game-container">
        <div className="game-header">
          <h1 className="header-title">
            {editCategoryId ? 'Edytuj kategorię' : 'Nowa kategoria'}
          </h1>
          <div className="header-team">Prowadzący</div>
        </div>

        <div className="custom-category-creator-steps">
          {creatorStep === 0 ? (
            // KROK 1: Nazwa kategorii i trudność
            <>
              <h2 className="creator-step-title">
                Nazwa kategorii i trudność
              </h2>
              
              <div className="creator-name-input">
                <input
                  type="text"
                  className="form-input-large"
                  value={customCategoryName}
                  onChange={(e) => setCustomCategoryName(e.target.value)}
                  placeholder="Wpisz nazwę kategorii..."
                  maxLength={50}
                />
              </div>
              
              <div className="difficulty-cards">
                <div
                  className={`difficulty-card ${customDifficulty === 'easy' ? 'selected' : ''}`}
                  onClick={() => setCustomDifficulty('easy')}
                >
                  <div className="difficulty-stars easy">
                    <PiStarFill />
                  </div>
                  <div className="difficulty-label">Łatwy</div>
                </div>
                <div
                  className={`difficulty-card ${customDifficulty === 'medium' ? 'selected' : ''}`}
                  onClick={() => setCustomDifficulty('medium')}
                >
                  <div className="difficulty-stars medium">
                    <PiStarFill />
                    <PiStarFill />
                  </div>
                  <div className="difficulty-label">Średni</div>
                </div>
                <div
                  className={`difficulty-card ${customDifficulty === 'hard' ? 'selected' : ''}`}
                  onClick={() => setCustomDifficulty('hard')}
                >
                  <div className="difficulty-stars hard">
                    <PiStarFill />
                    <PiStarFill />
                    <PiStarFill />
                  </div>
                  <div className="difficulty-label">Trudny</div>
                </div>
              </div>
              
              <div className="actions-container">
                <button 
                  className="btn-step-next" 
                  onClick={() => setCreatorStep(1)}
                  disabled={!customCategoryName.trim()}
                >
                  Pierwsze pytanie
                  <PiArrowRightBold />
                </button>
                <button className="btn-step-cancel" onClick={handleCancel}>
                  Anuluj
                </button>
              </div>
            </>
          ) : (
            // KROKI 2-6: Pytania
            <>
              <h2 className="creator-step-title">
                {creatorStep === 5 ? 'Ostatnie pytanie' : `Pytanie ${creatorStep}`}
              </h2>
              
              <div className="question-creator-board">
                <input
                  type="text"
                  className="question-input-large"
                  value={customQuestions[creatorStep - 1].question}
                  onChange={(e) => {
                    const newQuestions = [...customQuestions];
                    newQuestions[creatorStep - 1].question = e.target.value;
                    setCustomQuestions(newQuestions);
                  }}
                  placeholder="Wpisz pytanie..."
                  maxLength={200}
                />
                
                <div className="answers-board">
                  <DndContext 
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={(event) => handleDragEnd(event, creatorStep - 1)}
                  >
                    <SortableContext 
                      items={sortableAnswerItems}
                      strategy={verticalListSortingStrategy}
                    >
                      {customQuestions[creatorStep - 1].answers.map((ans, aIdx) => (
                        <SortableAnswer
                          key={`answer-${creatorStep - 1}-${aIdx}`}
                          id={`answer-${creatorStep - 1}-${aIdx}`}
                          answer={ans}
                          index={aIdx}
                          questionIndex={creatorStep - 1}
                          totalAnswers={customQuestions[creatorStep - 1].answers.length}
                          onUpdateAnswer={handleUpdateAnswer}
                          onRemoveAnswer={handleRemoveAnswer}
                        />
                      ))}
                    </SortableContext>
                  </DndContext>
                  {customQuestions[creatorStep - 1].answers.length < 10 && (
                    <button
                      className="btn-add-answer-board"
                      onClick={() => handleAddAnswer(creatorStep - 1)}
                    >
                      + Dodaj pole
                    </button>
                  )}
                </div>
              </div>
              
              <div className="actions-container">
                <div className="step-navigation">
                  <button 
                    className="btn-nav-prev" 
                    onClick={() => setCreatorStep(creatorStep - 1)}
                  >
                    <PiArrowRightBold style={{ transform: 'rotate(180deg)' }} />
                    {creatorStep === 1 ? 'Nazwa kategorii' : `Pytanie ${creatorStep - 1}`}
                  </button>
                  
                  {(() => {
                    const currentQ = customQuestions[creatorStep - 1];
                    const isQuestionValid = currentQ.question.trim() && 
                                          currentQ.answers.filter(a => a.trim()).length >= 3;
                    
                    return creatorStep < 5 ? (
                      <button 
                        className="btn-nav-next" 
                        onClick={() => setCreatorStep(creatorStep + 1)}
                        disabled={!isQuestionValid}
                      >
                        {creatorStep + 1 === 5 ? 'Ostatnie pytanie' : `Pytanie ${creatorStep + 1}`}
                        <PiArrowRightBold />
                      </button>
                    ) : (
                      <button 
                        className="btn-nav-save" 
                        onClick={handleSaveCustomCategory}
                        disabled={!isQuestionValid}
                      >
                        <PiCheckBold />
                        {editCategoryId ? 'Zaktualizuj kategorię' : 'Zapisz kategorię'}
                      </button>
                    );
                  })()}
                </div>
                
                <button className="btn-nav-cancel" onClick={handleCancel}>
                  Anuluj
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default function CategoryEditorPage() {
  return (
    <Suspense fallback={
      <>
        <Navbar />
        <div className="game-container">
          <div className="game-header">
            <h1 className="header-title">Ładowanie...</h1>
            <div className="header-team">Prowadzący</div>
          </div>
        </div>
      </>
    }>
      <CategoryEditorContent />
    </Suspense>
  );
}
