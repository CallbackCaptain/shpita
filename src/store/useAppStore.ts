import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { sound } from '../utils/sound';

export type SceneType = 'INTRO' | 'RECAP' | 'JOKES' | 'QUIZ' | 'GAME' | 'FINAL';

export const SCENE_ORDER: SceneType[] = ['INTRO', 'RECAP', 'JOKES', 'QUIZ', 'GAME', 'FINAL'];

interface AppState {
  currentScene: SceneType;
  direction: number; // 1 = вперед, -1 = назад (нужно для правильного вектора анимации)
  quizAnswers: Record<string, string>;
  jokeReactions: Record<string, string>;
  gameScore: number;
  isAudioUnlocked: boolean;
  isMuted: boolean;

  // Экшены
  nextScene: () => void;
  prevScene: () => void;
  goToScene: (scene: SceneType) => void;
  saveQuizAnswer: (questionId: string, answer: string) => void;
  saveJokeReaction: (jokeId: string, reaction: string) => void;
  setGameScore: (score: number | ((prev: number) => number)) => void;
  unlockAudio: () => void;
  toggleMute: () => void;
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
      isMuted: false,

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
        if (targetIndex !== -1) {
          set({
            currentScene: scene,
            direction: targetIndex >= currentIndex ? 1 : -1,
          });
        }
      },

      saveQuizAnswer: (questionId, answer) =>
        set((state) => ({
          quizAnswers: { ...state.quizAnswers, [questionId]: answer },
        })),

      saveJokeReaction: (jokeId, reaction) =>
        set((state) => ({
          jokeReactions: { ...state.jokeReactions, [jokeId]: reaction },
        })),

      setGameScore: (scoreOrUpdater) =>
        set((state) => ({
          gameScore: typeof scoreOrUpdater === 'function' ? scoreOrUpdater(state.gameScore) : scoreOrUpdater,
        })),

      unlockAudio: () => {
        sound.unlock();
        set({ isAudioUnlocked: true });
      },

      toggleMute: () =>
        set((state) => ({ isMuted: !state.isMuted })),

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
      partialize: (state) => ({
        currentScene: state.currentScene,
        quizAnswers: state.quizAnswers,
        jokeReactions: state.jokeReactions,
        gameScore: state.gameScore,
        isMuted: state.isMuted,
      }),
    }
  )
);
