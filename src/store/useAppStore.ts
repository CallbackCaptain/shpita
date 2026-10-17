import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type SceneType = 'INTRO' | 'RECAP' | 'JOKES' | 'QUIZ' | 'GAME' | 'FINAL';

const SCENE_ORDER: SceneType[] = ['INTRO', 'RECAP', 'JOKES', 'QUIZ', 'GAME', 'FINAL'];

interface AppState {
  currentScene: SceneType;
  direction: number; // 1 = вперед, -1 = назад (нужно для правильного вектора анимации)
  quizAnswers: Record<string, string>;
  jokeReactions: Record<string, string>;
  gameScore: number;
  isAudioUnlocked: boolean;

  // Экшены
  nextScene: () => void;
  prevScene: () => void;
  goToScene: (scene: SceneType) => void;
  saveQuizAnswer: (questionId: string, answer: string) => void;
  saveJokeReaction: (jokeId: string, reaction: string) => void;
  setGameScore: (score: number) => void;
  unlockAudio: () => void;
  resetProgress: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      currentScene: 'INTRO',
      direction: 1,
      quizAnswers: {},
      jokeReactions: {},
      gameScore: 0,
      isAudioUnlocked: false,

      nextScene: () => {
        const { currentScene } = get();
        const currentIndex = SCENE_ORDER.indexOf(currentScene);
        if (currentIndex < SCENE_ORDER.length - 1) {
          set({ currentScene: SCENE_ORDER[currentIndex + 1], direction: 1 });
        }
      },

      prevScene: () => {
        const { currentScene } = get();
        const currentIndex = SCENE_ORDER.indexOf(currentScene);
        if (currentIndex > 0) {
          set({ currentScene: SCENE_ORDER[currentIndex - 1], direction: -1 });
        }
      },

      goToScene: (scene) => {
        const { currentScene } = get();
        const currentIndex = SCENE_ORDER.indexOf(currentScene);
        const targetIndex = SCENE_ORDER.indexOf(scene);
        set({
          currentScene: scene,
          direction: targetIndex >= currentIndex ? 1 : -1,
        });
      },

      saveQuizAnswer: (questionId, answer) =>
        set((state) => ({
          quizAnswers: { ...state.quizAnswers, [questionId]: answer },
        })),

      saveJokeReaction: (jokeId, reaction) =>
        set((state) => ({
          jokeReactions: { ...state.jokeReactions, [jokeId]: reaction },
        })),

      setGameScore: (score) => set({ gameScore: score }),

      unlockAudio: () => set({ isAudioUnlocked: true }),

      resetProgress: () =>
        set({
          currentScene: 'INTRO',
          direction: -1,
          quizAnswers: {},
          jokeReactions: {},
          gameScore: 0,
        }),
    }),
    {
      name: 'birthday-recap-storage',
      // Не сохраняем флаг разблокировки звука, т.к. после перезагрузки браузер снова потребует тап
      partialize: (state) => ({
        currentScene: state.currentScene,
        quizAnswers: state.quizAnswers,
        jokeReactions: state.jokeReactions,
        gameScore: state.gameScore,
      }),
    }
  )
);
