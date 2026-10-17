import { AnimatePresence, motion, type Variants } from 'framer-motion';
import { useAppStore } from './store/useAppStore';
import { triggerHaptic } from './utils/haptics';
import RecapScene from './scenes/RecapScene';
import JokesScene from './scenes/JokesScene';

// Варианты анимации переходов между глобальными сценами
const sceneVariants: Variants = {
  initial: (direction: number) => ({
    x: direction > 0 ? '100%' : '-100%',
    opacity: 0,
    scale: 0.92,
  }),
  animate: {
    x: 0,
    opacity: 1,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 30,
      mass: 0.8,
    },
  },
  exit: (direction: number) => ({
    x: direction > 0 ? '-40%' : '40%',
    opacity: 0,
    scale: 0.92,
    transition: { duration: 0.25, ease: 'easeInOut' },
  }),
};

export default function App() {
  const { currentScene, direction } = useAppStore();

  return (
    /* Внешняя обертка: на ПК центрирует "телефон" и дает красивый градиентный фон */
    <div className="fixed inset-0 w-full h-[100dvh] bg-zinc-950 flex items-center justify-center overflow-hidden">
      {/* Декоративное свечение на фоне (видно только на широких экранах) */}
      <div className="hidden sm:block absolute w-[500px] h-[500px] bg-purple-600/20 blur-[120px] rounded-full pointer-events-none" />

      {/* Непосредственно мобильный вьюпорт */}
      <main className="relative w-full h-full max-w-[430px] sm:h-[92dvh] sm:max-h-[880px] sm:rounded-[40px] sm:border-[6px] sm:border-zinc-800 bg-zinc-900 overflow-hidden shadow-2xl flex flex-col">
        <AnimatePresence mode="popLayout" custom={direction} initial={false}>
          <motion.div
            key={currentScene}
            custom={direction}
            variants={sceneVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="w-full h-full flex flex-col relative"
          >
            {currentScene === 'INTRO' && <IntroScene />}
            {currentScene === 'RECAP' && <RecapScene />}
            {currentScene === 'JOKES' && <JokesScene />}
            {currentScene === 'QUIZ' && <QuizScene />}
            {currentScene === 'GAME' && <GameScene />}
            {currentScene === 'FINAL' && <FinalScene />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

/* ============================================================================
   БАЗОВЫЕ ШАБЛОНЫ СЦЕН (Позже их можно вынести в отдельные файлы в /scenes)
============================================================================ */

function IntroScene() {
  const { nextScene, unlockAudio } = useAppStore();

  const handleStart = () => {
    triggerHaptic(20);
    unlockAudio(); // Здесь же можно запустить фоновый трек через Howler.js
    nextScene();
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-between p-8 bg-gradient-to-b from-indigo-950 via-zinc-900 to-zinc-950 text-center">
      <div className="mt-12 text-xs uppercase tracking-[0.2em] text-indigo-400 font-semibold">
        Персональный Итог Года
      </div>

      <div className="my-auto space-y-4">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, type: 'spring' }}
          className="text-7xl mb-4"
        >
          🎉
        </motion.div>
        <h1 className="text-4xl font-black tracking-tight bg-gradient-to-r from-white via-indigo-200 to-indigo-400 bg-clip-text text-transparent">
          Твой 2026 Wrapped
        </h1>
        <p className="text-zinc-400 text-sm max-w-[260px] mx-auto leading-relaxed">
          Включай звук, пристегивайся. Сейчас вспомним лучшие моменты, проверим интуицию и немного поиграем.
        </p>
      </div>

      <motion.button
        whileTap={{ scale: 0.94 }}
        onClick={handleStart}
        className="w-full py-4 rounded-2xl bg-white text-zinc-950 font-bold text-lg shadow-[0_0_30px_rgba(255,255,255,0.25)] active:bg-zinc-200 transition-colors"
      >
        Погнали! 🚀
      </motion.button>
    </div>
  );
}

function QuizScene() {
  const { nextScene, prevScene, saveQuizAnswer, quizAnswers } = useAppStore();

  const handleSelect = (answer: string) => {
    triggerHaptic([15, 30, 15]);
    saveQuizAnswer('q1', answer);
    setTimeout(() => nextScene(), 350);
  };

  return (
    <div className="flex-1 flex flex-col justify-between p-6 bg-gradient-to-b from-amber-950/60 to-zinc-950">
      <div className="flex items-center justify-between text-xs text-amber-300/70 font-mono">
        <span>СЦЕНА 4 / ИНТЕРАКТИВНЫЙ ОПРОС</span>
        <button
          type="button"
          onClick={() => {
            triggerHaptic(10);
            prevScene();
          }}
          className="text-white/50 hover:text-white transition-colors"
        >
          ← К шуткам
        </button>
      </div>

      <div className="space-y-6 my-auto">
        <h2 className="text-2xl font-bold leading-snug">
          Какой напиток стал главным спонсором твоих дедлайнов в этом году?
        </h2>
        <div className="space-y-3">
          {[
            'Литры кофе ☕',
            'Шпита пива в баре Германии 🍺',
            'Энергетики ⚡',
            'Святая вода 💧',
          ].map((opt) => (
            <motion.button
              key={opt}
              whileTap={{ scale: 0.96 }}
              onClick={() => handleSelect(opt)}
              className={`w-full p-4 rounded-2xl border text-left font-medium transition-all ${
                quizAnswers['q1'] === opt
                  ? 'bg-amber-500 border-amber-400 text-zinc-950 font-bold'
                  : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
              }`}
            >
              {opt}
            </motion.button>
          ))}
        </div>
      </div>

      <div className="text-center text-xs text-zinc-500">Выбери вариант, чтобы продолжить</div>
    </div>
  );
}

function GameScene() {
  const { nextScene, gameScore, setGameScore } = useAppStore();

  return (
    <div
      className="flex-1 flex flex-col justify-between p-6 bg-gradient-to-b from-emerald-950 to-zinc-950"
      style={{ touchAction: 'none' }} // ЖЕСТКО отключаем любые браузерные свайпы внутри канваса игры
    >
      <div className="flex justify-between items-center">
        <span className="text-xs text-emerald-400 font-mono">СЦЕНА 5 / МИНИ-ИГРА</span>
        <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-sm">
          Очки: {gameScore}
        </span>
      </div>

      <div className="my-auto flex flex-col items-center gap-6">
        <p className="text-center text-sm text-zinc-400">
          Прототип кликера (здесь будет полноценный Canvas): набери 5 очков!
        </p>
        <motion.button
          whileTap={{ scale: 0.85, rotate: -5 }}
          onClick={() => {
            triggerHaptic(25);
            const next = gameScore + 1;
            setGameScore(next);
            if (next >= 5) setTimeout(() => nextScene(), 300);
          }}
          className="w-36 h-36 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-300 text-6xl shadow-[0_0_50px_rgba(16,185,129,0.4)] flex items-center justify-center"
        >
          🎁
        </motion.button>
      </div>

      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={nextScene}
        className="w-full py-3 rounded-xl bg-white/10 text-zinc-300 text-sm"
      >
        Пропустить игру →
      </motion.button>
    </div>
  );
}

function FinalScene() {
  const { quizAnswers, gameScore, jokeReactions, resetProgress } = useAppStore();

  const totalReactions = Object.keys(jokeReactions).length;

  return (
    <div className="flex-1 flex flex-col justify-between p-8 bg-gradient-to-t from-purple-950 via-zinc-900 to-zinc-950 text-center">
      <div className="text-xs text-purple-400 font-mono">ФИНАЛ</div>

      <div className="space-y-4 my-auto">
        <div className="text-6xl">🎂</div>
        <h1 className="text-3xl font-black">С Днем Рождения!</h1>
        <p className="text-zinc-300 text-sm leading-relaxed">
          Спасибо, что прошел этот путь! Твой выбор напитка:{' '}
          <span className="text-purple-300 font-semibold">{quizAnswers['q1'] || 'Не выбран'}</span>, в игре
          ты выбил <span className="text-purple-300 font-semibold">{gameScore} очков</span>
          {totalReactions > 0 ? (
            <>, а из золотого фонда цитат Шпиты ты оценил <span className="text-amber-300 font-semibold">{totalReactions} шт.</span> 🔥</>
          ) : (
            '.'
          )}
        </p>
      </div>

      <motion.button
        whileTap={{ scale: 0.94 }}
        onClick={() => {
          triggerHaptic(30);
          resetProgress();
        }}
        className="w-full py-4 rounded-2xl bg-white/10 border border-white/15 text-white font-semibold text-sm"
      >
        Пройти заново ↻
      </motion.button>
    </div>
  );
}
