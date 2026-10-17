import { useState, useCallback } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { Sparkles, ChevronLeft, ChevronRight, Laugh } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAppStore } from '../store/useAppStore';
import { triggerHaptic } from '../utils/haptics';

interface JokeItem {
  id: string;
  tag: string;
  emoji: string;
  setup: string;
  punchline: string;
  comment: string;
  bgGradient: string;
  accentColor: string;
  borderGlow: string;
}

const JOKES_DATA: JokeItem[] = [
  {
    id: 'joke-1',
    tag: 'СЕМЕЙНАЯ ДРАМА & ГЕНЕТИКА',
    emoji: '🧬',
    setup: 'Главный экзистенциальный вопрос года:',
    punchline: '«Ты шпита, я шпита... почему у нас родился нацист?!»',
    comment: '👶 Биологический парадокс, над которым ученые бьются до сих пор',
    bgGradient: 'from-fuchsia-950/80 via-purple-950/50 to-zinc-950',
    accentColor: 'text-fuchsia-400',
    borderGlow: 'border-fuchsia-500/30',
  },
  {
    id: 'joke-2',
    tag: 'МЕЖДУНАРОДНЫЙ ЭТИКЕТ',
    emoji: '🍺',
    setup: 'Как правильно сделать заказ в баре Германии?',
    punchline: '«— Мне Шпиту пива, пожалуйста!»',
    comment: '🍻 Бармен в Мюнхене налил не задумываясь',
    bgGradient: 'from-amber-950/80 via-orange-950/50 to-zinc-950',
    accentColor: 'text-amber-400',
    borderGlow: 'border-amber-500/30',
  },
  {
    id: 'joke-3',
    tag: 'ГЕОГРАФИЯ НА 100 БАЛЛОВ',
    emoji: '🗺️',
    setup: 'Блиц-опрос: назови столицу Германии...',
    punchline: '«Столица Германии — Шпитсбург!»',
    comment: '📍 Географический атлас Шпиты официально утвержден',
    bgGradient: 'from-blue-950/80 via-cyan-950/50 to-zinc-950',
    accentColor: 'text-cyan-400',
    borderGlow: 'border-cyan-500/30',
  },
];

const REACTIONS = [
  { label: '😂 Ору', value: 'laugh' },
  { label: '💀 Трэш', value: 'skull' },
  { label: '🍺 База', value: 'beer' },
  { label: '👑 Гений', value: 'crown' },
];

const slideVariants: Variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 100 : -100,
    opacity: 0,
    scale: 0.95,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 320,
      damping: 28,
    },
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -100 : 100,
    opacity: 0,
    scale: 0.95,
    transition: { duration: 0.2 },
  }),
};

export default function JokesScene() {
  const { nextScene, prevScene, jokeReactions, saveJokeReaction } = useAppStore();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<number>(1);
  const [revealedJokes, setRevealedJokes] = useState<Record<string, boolean>>({
    'joke-1': true, // Первая открыта сразу для вовлечения
  });

  const currentJoke = JOKES_DATA[currentIndex];
  const isRevealed = !!revealedJokes[currentJoke.id];
  const activeReaction = jokeReactions[currentJoke.id];

  const handleReveal = useCallback((jokeId: string) => {
    triggerHaptic([15, 30, 20]);
    setRevealedJokes((prev) => ({ ...prev, [jokeId]: true }));

    // Запуск праздничного конфетти при раскрытии панча
    confetti({
      particleCount: 35,
      spread: 60,
      origin: { y: 0.65 },
      colors: ['#a855f7', '#ec4899', '#3b82f6', '#eab308'],
    });
  }, []);

  const handleReaction = (reactionValue: string) => {
    triggerHaptic(20);
    saveJokeReaction(currentJoke.id, reactionValue);

    confetti({
      particleCount: 25,
      spread: 50,
      origin: { y: 0.8 },
      colors: ['#f43f5e', '#fbbf24', '#34d399', '#60a5fa'],
    });
  };

  const handleNext = () => {
    triggerHaptic(12);
    if (currentIndex < JOKES_DATA.length - 1) {
      setDirection(1);
      setCurrentIndex((prev) => prev + 1);
    } else {
      nextScene();
    }
  };

  const handlePrev = () => {
    triggerHaptic(12);
    if (currentIndex > 0) {
      setDirection(-1);
      setCurrentIndex((prev) => prev - 1);
    } else {
      prevScene();
    }
  };

  return (
    <div
      className={`relative flex-1 flex flex-col justify-between p-6 bg-gradient-to-b ${currentJoke.bgGradient} transition-colors duration-700 select-none overflow-hidden`}
    >
      {/* Декоративное пятно на фоне */}
      <div className="absolute -top-16 -left-16 w-72 h-72 rounded-full bg-white/10 blur-[90px] pointer-events-none" />

      {/* ВЕРХНЯЯ ПАНЕЛЬ */}
      <header className="relative z-10 space-y-3">
        {/* Индикаторы прогресса по шуткам */}
        <div className="flex gap-1.5 w-full">
          {JOKES_DATA.map((joke, idx) => (
            <button
              key={joke.id}
              type="button"
              onClick={() => {
                triggerHaptic(10);
                setDirection(idx > currentIndex ? 1 : -1);
                setCurrentIndex(idx);
              }}
              className="flex-1 h-1 rounded-full overflow-hidden bg-white/20 transition-all"
            >
              <div
                className={`h-full transition-all duration-300 ${
                  idx <= currentIndex ? 'bg-white w-full' : 'w-0'
                }`}
              />
            </button>
          ))}
        </div>

        {/* Заголовок сцены */}
        <div className="flex items-center justify-between text-xs font-medium text-white/80 pt-1">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs">
              <Laugh className="w-3.5 h-3.5 text-white" />
            </span>
            <span className="tracking-wider uppercase font-semibold">ШПИТА-ЮМОР</span>
            <span className="text-white/40">•</span>
            <span className="text-white/50">
              {currentIndex + 1} из {JOKES_DATA.length}
            </span>
          </div>

          <div className="flex items-center gap-1 text-[11px] text-white/60 bg-white/10 px-2.5 py-1 rounded-full backdrop-blur-md">
            <Sparkles className="w-3 h-3 text-amber-300" />
            <span>Золотой фонд</span>
          </div>
        </div>
      </header>

      {/* ЦЕНТРАЛЬНАЯ КАРТОЧКА ШУТКИ */}
      <div className="relative z-10 my-auto py-2">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentJoke.id}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="space-y-4"
          >
            {/* Эмодзи рубрики */}
            <div className="flex items-center justify-between">
              <motion.div
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="text-5xl"
              >
                {currentJoke.emoji}
              </motion.div>
              <span
                className={`text-[11px] font-black tracking-widest uppercase px-3 py-1 rounded-full bg-white/10 border ${currentJoke.borderGlow} ${currentJoke.accentColor}`}
              >
                {currentJoke.tag}
              </span>
            </div>

            {/* Сетап шутки */}
            <div className="space-y-2">
              <p className="text-xs text-white/60 uppercase tracking-wider font-semibold">
                Контекст момента:
              </p>
              <h2 className="text-2xl font-extrabold text-white leading-snug">
                {currentJoke.setup}
              </h2>
            </div>

            {/* Панчлайн-карточка */}
            <div
              onClick={() => !isRevealed && handleReveal(currentJoke.id)}
              className={`relative p-5 rounded-3xl border backdrop-blur-xl transition-all duration-300 ${
                isRevealed
                  ? `bg-white/10 ${currentJoke.borderGlow} shadow-2xl shadow-black/40`
                  : 'bg-white/5 border-white/15 cursor-pointer hover:bg-white/10 active:scale-[0.98]'
              }`}
            >
              {isRevealed ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.92, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ type: 'spring', stiffness: 280, damping: 22 }}
                  className="space-y-3"
                >
                  <p className="text-xs text-amber-300 font-bold uppercase tracking-widest flex items-center gap-1.5">
                    <span>💥</span> ПАНЧЛАЙН
                  </p>
                  <div
                    className={`text-xl sm:text-2xl font-black tracking-tight leading-relaxed ${currentJoke.accentColor}`}
                  >
                    {currentJoke.punchline}
                  </div>
                  <p className="text-xs text-white/60 pt-1 italic border-t border-white/10">
                    {currentJoke.comment}
                  </p>
                </motion.div>
              ) : (
                <div className="py-6 flex flex-col items-center justify-center text-center space-y-2">
                  <motion.div
                    animate={{ scale: [1, 1.12, 1] }}
                    transition={{ repeat: Infinity, duration: 1.8 }}
                    className="text-3xl"
                  >
                    🔒
                  </motion.div>
                  <div className="text-sm font-bold text-white">
                    Нажми, чтобы открыть панчлайн
                  </div>
                  <div className="text-xs text-white/50">
                    Осторожно: уровень юмора зашкаливает
                  </div>
                </div>
              )}
            </div>

            {/* РЕАКЦИИ */}
            <div className="space-y-2 pt-1">
              <div className="text-[11px] text-white/50 uppercase tracking-wider font-semibold text-center">
                Твоя реакция:
              </div>
              <div className="grid grid-cols-4 gap-2">
                {REACTIONS.map((r) => {
                  const isSelected = activeReaction === r.value;
                  return (
                    <motion.button
                      key={r.value}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleReaction(r.value)}
                      className={`py-2 px-1 rounded-xl text-xs font-bold border transition-all text-center ${
                        isSelected
                          ? 'bg-white text-zinc-950 border-white shadow-lg shadow-white/20 scale-[1.03]'
                          : 'bg-white/5 border-white/10 text-white/80 hover:bg-white/10'
                      }`}
                    >
                      {r.label}
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* НИЖНЯЯ ПАНЕЛЬ УПРАВЛЕНИЯ */}
      <footer className="relative z-10 flex gap-3 pt-2">
        <motion.button
          whileTap={{ scale: 0.94 }}
          onClick={handlePrev}
          className="px-4 py-3.5 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 font-semibold text-sm flex items-center justify-center gap-1 text-white"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>{currentIndex === 0 ? 'К сторис' : 'Назад'}</span>
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.94 }}
          onClick={handleNext}
          className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-fuchsia-500 to-indigo-500 hover:from-fuchsia-400 hover:to-indigo-400 font-bold text-sm text-white shadow-lg shadow-fuchsia-500/25 flex items-center justify-center gap-1.5"
        >
          <span>
            {currentIndex === JOKES_DATA.length - 1 ? 'Перейти к квизу 🎯' : 'Следующая шутка'}
          </span>
          <ChevronRight className="w-4 h-4" />
        </motion.button>
      </footer>
    </div>
  );
}
