import { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion, type Variants } from 'framer-motion';
import { Sparkles, Trophy, RotateCcw, Share2, Check, ArrowLeft } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAppStore } from './store/useAppStore';
import { triggerHaptic } from './utils/haptics';
import { sound } from './utils/sound';
import RecapScene from './scenes/RecapScene';
import JokesScene from './scenes/JokesScene';

// Варианты анимации переходов между сценами
const sceneVariants: Variants = {
  initial: (direction: number) => ({
    x: direction > 0 ? '100%' : '-100%',
    opacity: 0,
    scale: 0.94,
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
    x: direction > 0 ? '-30%' : '30%',
    opacity: 0,
    scale: 0.94,
    transition: { duration: 0.22, ease: 'easeInOut' },
  }),
};

export default function App() {
  const { currentScene, direction } = useAppStore();

  return (
    <div className="fixed inset-0 w-full h-[100dvh] bg-zinc-950 flex items-center justify-center overflow-hidden">
      {/* Декоративное фоновое свечение (для десктопа) */}
      <div className="hidden sm:block absolute w-[520px] h-[520px] bg-purple-600/15 blur-[130px] rounded-full pointer-events-none" />
      <div className="hidden sm:block absolute w-[400px] h-[400px] bg-indigo-600/10 blur-[100px] rounded-full pointer-events-none -translate-x-40 translate-y-40" />

      {/* Мобильный контейнер */}
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
   1. ИНТРО СЦЕНА
============================================================================ */
function IntroScene() {
  const { nextScene, unlockAudio, isMuted } = useAppStore();

  const handleStart = () => {
    triggerHaptic(20);
    unlockAudio();
    sound.playSwipe(isMuted);
    nextScene();
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-between p-8 bg-gradient-to-b from-indigo-950 via-zinc-900 to-zinc-950 text-center select-none">
      <div className="mt-8 text-xs uppercase tracking-[0.25em] text-indigo-400 font-bold flex items-center gap-1.5">
        <Sparkles className="w-3.5 h-3.5" />
        <span>Персональный Итог Года</span>
      </div>

      <div className="my-auto space-y-5">
        <motion.div
          initial={{ scale: 0.4, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.15, type: 'spring', stiffness: 260 }}
          className="text-7xl mb-2 filter drop-shadow-[0_10px_20px_rgba(99,102,241,0.3)]"
        >
          🎁
        </motion.div>

        <h1 className="text-4xl font-black tracking-tight bg-gradient-to-r from-white via-indigo-100 to-indigo-400 bg-clip-text text-transparent leading-tight">
          Шпита 2026 Wrapped
        </h1>

        <p className="text-zinc-400 text-sm max-w-[280px] mx-auto leading-relaxed">
          Включай звук, пристегивайся! Вспомним главные маршруты, перечитаем золотой фонд шуток, пройдем опрос и откроем сюрприз.
        </p>
      </div>

      <motion.button
        whileTap={{ scale: 0.95 }}
        whileHover={{ scale: 1.02 }}
        onClick={handleStart}
        className="w-full py-4 rounded-2xl bg-white text-zinc-950 font-bold text-lg shadow-[0_0_35px_rgba(255,255,255,0.3)] active:bg-zinc-200 transition-all cursor-pointer"
      >
        Погнали! 🚀
      </motion.button>
    </div>
  );
}

/* ============================================================================
   2. КВИЗ / ОПРОС (С защитой от повторных быстрых кликов)
============================================================================ */
function QuizScene() {
  const { nextScene, prevScene, saveQuizAnswer, quizAnswers, isMuted } = useAppStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleSelect = (answer: string) => {
    if (isSubmitting) return; // Блокировка повторных кликов

    setIsSubmitting(true);
    triggerHaptic([15, 30, 15]);
    sound.playTap(isMuted);
    saveQuizAnswer('q1', answer);

    timeoutRef.current = window.setTimeout(() => {
      nextScene();
    }, 380);
  };

  const options = [
    'Шпиту пива в баре Германии 🍺',
    'Литры кофе из Шпитсбурга ☕',
    'Энергетик Шпитенваген ⚡',
    'Святая вода из реки Шпитейн 💧',
  ];

  return (
    <div className="flex-1 flex flex-col justify-between p-6 bg-gradient-to-b from-amber-950/70 via-zinc-900 to-zinc-950 select-none">
      <div className="flex items-center justify-between text-xs text-amber-300/80 font-mono">
        <span>СЦЕНА 3 / ИНТЕРАКТИВНЫЙ ОПРОС</span>
        <button
          type="button"
          onClick={() => {
            triggerHaptic(10);
            sound.playSwipe(isMuted);
            prevScene();
          }}
          className="text-white/60 hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>К сторис</span>
        </button>
      </div>

      <div className="space-y-6 my-auto py-4">
        <div className="space-y-2">
          <span className="text-[11px] font-bold text-amber-400 uppercase tracking-widest">
            Вопрос на засыпку
          </span>
          <h2 className="text-2xl font-extrabold leading-snug text-white">
            Какой напиток стал главным спонсором твоих дедлайнов в этом году?
          </h2>
        </div>

        <div className="space-y-3">
          {options.map((opt) => {
            const isSelected = quizAnswers['q1'] === opt;
            return (
              <motion.button
                key={opt}
                whileTap={{ scale: 0.97 }}
                disabled={isSubmitting}
                onClick={() => handleSelect(opt)}
                className={`w-full p-4 rounded-2xl border text-left font-semibold text-sm transition-all cursor-pointer flex items-center justify-between ${
                  isSelected
                    ? 'bg-amber-500 border-amber-400 text-zinc-950 shadow-lg shadow-amber-500/20 scale-[1.01]'
                    : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                }`}
              >
                <span>{opt}</span>
                {isSelected && <Check className="w-4 h-4 stroke-[3]" />}
              </motion.button>
            );
          })}
        </div>
      </div>

      <div className="text-center text-xs text-zinc-500">
        {isSubmitting ? 'Зафиксировано! Переходим к игре...' : 'Выбери вариант, чтобы продолжить'}
      </div>
    </div>
  );
}

/* ============================================================================
   3. ИГРА-КЛИКЕР (С защитой, визуальным прогрессом и победным фанфаром)
============================================================================ */
function GameScene() {
  const { nextScene, prevScene, isMuted } = useAppStore();
  const [clicks, setClicks] = useState(0);
  const [isWon, setIsWon] = useState(false);
  const targetClicks = 5;
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleClick = () => {
    if (isWon) return;

    triggerHaptic(20);
    const nextCount = clicks + 1;
    setClicks(nextCount);
    sound.playGamePop(isMuted, 1 + nextCount * 0.15);

    if (nextCount >= targetClicks) {
      setIsWon(true);
      sound.playFanfare(isMuted);

      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10b981', '#34d399', '#f59e0b', '#ec4899'],
      });

      timeoutRef.current = window.setTimeout(() => {
        nextScene();
      }, 700);
    }
  };

  return (
    <div
      className="flex-1 flex flex-col justify-between p-6 bg-gradient-to-b from-emerald-950/80 via-zinc-900 to-zinc-950 select-none touch-none"
    >
      <div className="flex justify-between items-center text-xs">
        <button
          type="button"
          onClick={() => {
            triggerHaptic(10);
            sound.playSwipe(isMuted);
            prevScene();
          }}
          className="text-white/60 hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>К квизу</span>
        </button>

        <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-xs border border-emerald-500/30">
          Очки: {clicks} / {targetClicks}
        </span>
      </div>

      <div className="my-auto flex flex-col items-center gap-6 py-2">
        <div className="text-center space-y-1">
          <h2 className="text-xl font-extrabold text-white">Разбей пиньяту Шпиты!</h2>
          <p className="text-xs text-zinc-400">
            {isWon ? 'Ура! Победа зафиксирована! 🎉' : `Кликни еще ${Math.max(0, targetClicks - clicks)} раз(а)`}
          </p>
        </div>

        {/* Прогресс-бар кликов */}
        <div className="w-48 h-2 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-emerald-400 to-teal-300 rounded-full"
            animate={{ width: `${(clicks / targetClicks) * 100}%` }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          />
        </div>

        {/* Кликабельный объект */}
        <motion.button
          whileTap={{ scale: 0.82, rotate: -8 }}
          whileHover={{ scale: 1.05 }}
          onClick={handleClick}
          disabled={isWon}
          className="w-36 h-36 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-300 text-6xl shadow-[0_0_50px_rgba(16,185,129,0.35)] flex items-center justify-center cursor-pointer transition-shadow active:shadow-[0_0_70px_rgba(16,185,129,0.6)]"
          aria-label="Нажать на подарок"
        >
          {isWon ? '✨' : '🎁'}
        </motion.button>
      </div>

      <motion.button
        whileTap={{ scale: 0.96 }}
        onClick={() => {
          triggerHaptic(10);
          sound.playSwipe(isMuted);
          nextScene();
        }}
        className="w-full py-3 rounded-xl bg-white/10 hover:bg-white/15 text-zinc-300 text-xs font-semibold cursor-pointer transition-colors"
      >
        Пропустить игру →
      </motion.button>
    </div>
  );
}

/* ============================================================================
   4. ФИНАЛЬНАЯ СЦЕНА (С салютом, копированием и полным рекапом)
============================================================================ */
function FinalScene() {
  const { quizAnswers, resetProgress, prevScene, isMuted } = useAppStore();
  const [copied, setCopied] = useState(false);

  // Праздничный салют при открытии финала
  useEffect(() => {
    sound.playFanfare(isMuted);

    const end = Date.now() + 1500;
    const frame = () => {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#a855f7', '#ec4899', '#3b82f6', '#eab308'],
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#a855f7', '#ec4899', '#3b82f6', '#eab308'],
      });
      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, [isMuted]);

  const handleCopy = () => {
    triggerHaptic(20);
    sound.playTap(isMuted);

    const textToShare = `🎂 Мой Шпита 2026 Wrapped:\n🍺 Спонсор года: ${
      quizAnswers['q1'] || 'Шпиту пива'
    }\n🏰 Статус: Почетный гражданин Шпитсбурга 👑\nС Днем Рождения! 🎉`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(textToShare).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-between p-6 sm:p-8 bg-gradient-to-t from-purple-950 via-zinc-900 to-zinc-950 text-center select-none overflow-y-auto no-scrollbar">
      <div className="flex items-center justify-between text-xs text-purple-400 font-mono">
        <button
          type="button"
          onClick={() => {
            triggerHaptic(10);
            sound.playSwipe(isMuted);
            prevScene();
          }}
          className="text-white/60 hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>К игре</span>
        </button>
        <span className="flex items-center gap-1">
          <Trophy className="w-3.5 h-3.5" />
          <span>ИТОГ ГОДА</span>
        </span>
      </div>

      <div className="space-y-4 my-auto py-4">
        <motion.div
          initial={{ scale: 0, rotate: -30 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          className="text-6xl"
        >
          🎂
        </motion.div>

        <h1 className="text-3xl font-black text-white tracking-tight">
          С Днем Рождения!
        </h1>

        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-left space-y-2 text-xs sm:text-sm text-zinc-300">
          <div className="flex items-center justify-between border-b border-white/5 pb-2">
            <span className="text-zinc-400">Спонсор дедлайнов:</span>
            <span className="font-bold text-amber-300">{quizAnswers['q1'] || 'Не выбран'}</span>
          </div>
          <div className="flex items-center justify-between border-b border-white/5 pb-2">
            <span className="text-zinc-400">Шутки года:</span>
            <span className="font-bold text-purple-300">Пройден весь рекап 🏰</span>
          </div>
          <div className="flex items-center justify-between pt-1">
            <span className="text-zinc-400">Присвоенный статус:</span>
            <span className="font-bold text-emerald-400">Почетный гражданин Шпитсбурга 👑</span>
          </div>
        </div>

        <p className="text-zinc-400 text-xs leading-relaxed max-w-[280px] mx-auto">
          Пусть следующий год будет полон ярких открытий, точных как шпитациркуль решений и поводов для громкого смеха!
        </p>
      </div>

      <div className="space-y-2.5">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleCopy}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 text-white font-bold text-sm shadow-lg shadow-purple-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4" />
              <span>Скопировано в буфер! 🎉</span>
            </>
          ) : (
            <>
              <Share2 className="w-4 h-4" />
              <span>Поделиться результатом</span>
            </>
          )}
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            triggerHaptic(30);
            sound.playTap(isMuted);
            resetProgress();
          }}
          className="w-full py-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-white/80 font-medium text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Пройти заново</span>
        </motion.button>
      </div>
    </div>
  );
}
