import { useState, useEffect, useRef, useCallback, type PointerEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX, Pause, Play } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { triggerHaptic } from '../utils/haptics';
import { sound } from '../utils/sound';

// Структура одного слайда Рекапа
interface StorySlide {
  id: string;
  duration: number; // Длительность в мс
  tag: string;
  title: string;
  statNumber?: string;
  statLabel?: string;
  description: string;
  emoji: string;
  bgGradient: string;
  accentColor: string;
}

const getStatFontSize = (text?: string) => {
  if (!text) return 'text-4xl sm:text-5xl';
  const len = text.length;
  if (len > 14) return 'text-xl sm:text-2xl';
  if (len > 10) return 'text-2xl sm:text-3xl';
  if (len > 7) return 'text-3xl sm:text-4xl';
  return 'text-4xl sm:text-5xl';
};

// Контент рекапа на основе легендарных шуток Шпиты
const STORIES_DATA: StorySlide[] = [
  {
    id: 'story-neuschpitastein',
    duration: 9000,
    tag: 'АРХИТЕКТУРА И ТУРИЗМ',
    title: 'Главная жемчужина и замок Баварии',
    statNumber: 'Нойшпиташтайн',
    statLabel: 'замок, построенный строго по канонам Шпиты',
    description: 'Король Людвиг II лично утвердил проект. Туристы со всего мира съезжаются взглянуть на этот архитектурный триумф.',
    emoji: '🏰',
    bgGradient: 'from-emerald-950 via-teal-950 to-zinc-950',
    accentColor: 'text-emerald-400',
  },
  {
    id: 'story-beer',
    duration: 9000,
    tag: 'МЕЖДУНАРОДНЫЙ ЭТИКЕТ',
    title: 'Как правильно делать заказ в баре Германии',
    statNumber: 'Шпиту пива!',
    statLabel: 'и сочная шпитавурст с горчицей к нему',
    description: '«— Guten Шпита! Мне Шпиту пива, пожалуйста!» Бармен в Мюнхене наливает не задумываясь. Данке шпита!',
    emoji: '🍺',
    bgGradient: 'from-amber-950 via-orange-950 to-zinc-950',
    accentColor: 'text-amber-400',
  },
  {
    id: 'story-capital',
    duration: 9000,
    tag: 'ГЕОГРАФИЯ ГОДА',
    title: 'Куда ведут скоростные немецкие автобаны',
    statNumber: 'Шпитсбург',
    statLabel: 'официальная столица и сердце навигатора',
    description: 'Забудь про Берлин. Главная водная артерия — река Шпитейн, валюта — шпитенмарка, а столица Германии — навсегда Шпитсбург.',
    emoji: '🗺️',
    bgGradient: 'from-cyan-950 via-blue-950 to-zinc-950',
    accentColor: 'text-cyan-400',
  },
  {
    id: 'story-genetics',
    duration: 9000,
    tag: 'ГЕНЕТИКА И ФИЛОСОФИЯ',
    title: 'Главный неразрешимый вопрос года',
    statNumber: '100% Шпита',
    statLabel: 'но семейный совет в полном тупике...',
    description: '«Ты шпита, я шпита... почему у нас родился нацист?!» Главный фундаментальный вопрос после закона всемирного шпитания.',
    emoji: '🧬',
    bgGradient: 'from-fuchsia-950 via-purple-950 to-zinc-950',
    accentColor: 'text-fuchsia-400',
  },
  {
    id: 'story-precision',
    duration: 9000,
    tag: 'НЕМЕЦКАЯ ТОЧНОСТЬ',
    title: 'Инструмент максимальной точности',
    statNumber: 'Шпитациркуль',
    statLabel: 'погрешность измерений — ровно 0.0 шпит',
    description: 'На нем держится народный авто Шпитаваген, философский труд «Критика чистой шпиты» и тяжелый металл Rammшпита.',
    emoji: '📐',
    bgGradient: 'from-indigo-950 via-violet-950 to-zinc-950',
    accentColor: 'text-indigo-400',
  },
  {
    id: 'story-diagnosis',
    duration: 9000,
    tag: 'ИТОГОВЫЙ ВЕРДИКТ',
    title: 'Заключение врачебной комиссии',
    statNumber: 'Острая Шпита',
    statLabel: 'головного мозга высшей категории',
    description: '«— Sprechen Sie Deutsch? — Нет, я говорю исключительно на шпита!» Ich liebe Шпита. Пристегнись, впереди золотой фонд шуток!',
    emoji: '👑',
    bgGradient: 'from-rose-950 via-pink-950 to-zinc-950',
    accentColor: 'text-rose-400',
  },
];

export default function RecapScene() {
  const { nextScene, prevScene, isMuted, toggleMute } = useAppStore();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0); // от 0 до 100
  const [isPaused, setIsPaused] = useState(false);
  const [isHolding, setIsHolding] = useState(false);
  const [slideDirection, setSlideDirection] = useState<1 | -1>(1);

  // Рефы для таймера и распознавания "Тап / Свайп / Удержание"
  const elapsedRef = useRef<number>(0);
  const lastFrameTimeRef = useRef<number | null>(null);
  const pointerDownTimeRef = useRef<number>(0);
  const pointerStartXRef = useRef<number>(0);
  const pointerStartYRef = useRef<number>(0);
  const isHoldingRef = useRef<boolean>(false);
  const isManuallyPausedRef = useRef<boolean>(false);
  const holdTimeoutRef = useRef<number | null>(null);

  const currentStory = STORIES_DATA[currentIndex];

  // Переключение паузы кнопкой или клавишей
  const togglePause = useCallback(() => {
    triggerHaptic(10);
    sound.playTap(isMuted);
    setIsPaused((prev) => {
      const next = !prev;
      isManuallyPausedRef.current = next;
      return next;
    });
  }, [isMuted]);

  // Переход к следующему слайду (или следующей сцене)
  const handleNextStory = useCallback(() => {
    triggerHaptic(12);
    sound.playSwipe(isMuted);
    elapsedRef.current = 0;
    setProgress(0);

    if (currentIndex < STORIES_DATA.length - 1) {
      setSlideDirection(1);
      setCurrentIndex((prev) => prev + 1);
    } else {
      nextScene(); // Переход к JOKES
    }
  }, [currentIndex, isMuted, nextScene]);

  // Переход к предыдущему слайду (или возврат в Интро)
  const handlePrevStory = useCallback(() => {
    triggerHaptic(12);
    sound.playSwipe(isMuted);

    // Если сторис прошла больше чем на 1.2 сек, тап назад просто перезапускает текущую сторис
    if (elapsedRef.current > 1200) {
      elapsedRef.current = 0;
      setProgress(0);
      return;
    }

    elapsedRef.current = 0;
    setProgress(0);

    if (currentIndex > 0) {
      setSlideDirection(-1);
      setCurrentIndex((prev) => prev - 1);
    } else {
      prevScene(); // Возврат в INTRO
    }
  }, [currentIndex, isMuted, prevScene]);

  // Прямой переход по клику на прогресс-бар
  const jumpToStory = (targetIndex: number) => {
    if (targetIndex === currentIndex) return;
    triggerHaptic(10);
    sound.playTap(isMuted);
    elapsedRef.current = 0;
    setProgress(0);
    setSlideDirection(targetIndex > currentIndex ? 1 : -1);
    setCurrentIndex(targetIndex);
  };

  // Клавиатурная навигация (стрелки и пробел)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        handleNextStory();
      } else if (e.key === 'ArrowLeft') {
        handlePrevStory();
      } else if (e.key === ' ') {
        e.preventDefault();
        togglePause();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNextStory, handlePrevStory, togglePause]);

  // Игровой цикл (requestAnimationFrame) для плавного заполнения полосок
  useEffect(() => {
    let animationFrameId: number;

    const updateTimer = (timestamp: number) => {
      if (lastFrameTimeRef.current === null) {
        lastFrameTimeRef.current = timestamp;
      }

      const delta = timestamp - lastFrameTimeRef.current;
      lastFrameTimeRef.current = timestamp;

      if (!isPaused) {
        elapsedRef.current += delta;
        const newProgress = Math.min((elapsedRef.current / currentStory.duration) * 100, 100);
        setProgress(newProgress);

        if (elapsedRef.current >= currentStory.duration) {
          handleNextStory();
          return;
        }
      }

      animationFrameId = requestAnimationFrame(updateTimer);
    };

    animationFrameId = requestAnimationFrame(updateTimer);

    return () => {
      cancelAnimationFrame(animationFrameId);
      lastFrameTimeRef.current = null;
    };
  }, [currentIndex, isPaused, currentStory.duration, handleNextStory]);

  // Авто-пауза при сворачивании вкладки
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsPaused(document.hidden);
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Очистка таймера удержания при размонтировании
  useEffect(() => {
    return () => {
      if (holdTimeoutRef.current) clearTimeout(holdTimeoutRef.current);
    };
  }, []);

  // Начало касания
  const handlePointerDown = (e: PointerEvent<HTMLDivElement>) => {
    // Игнорируем нажатия правой кнопки мыши
    if (e.button && e.button !== 0) return;

    pointerDownTimeRef.current = performance.now();
    pointerStartXRef.current = e.clientX;
    pointerStartYRef.current = e.clientY;
    isHoldingRef.current = false;

    // Таймер удержания (через 350 мс переходит в режим паузы)
    if (holdTimeoutRef.current) clearTimeout(holdTimeoutRef.current);
    holdTimeoutRef.current = window.setTimeout(() => {
      isHoldingRef.current = true;
      setIsHolding(true);
      setIsPaused(true);
    }, 350);
  };

  // Окончание касания: точное различение свайпа, тапа и удержания
  const handlePointerUp = (e: PointerEvent<HTMLDivElement>) => {
    if (holdTimeoutRef.current) {
      clearTimeout(holdTimeoutRef.current);
      holdTimeoutRef.current = null;
    }

    const holdDuration = performance.now() - pointerDownTimeRef.current;
    const deltaX = e.clientX - pointerStartXRef.current;
    const deltaY = e.clientY - pointerStartYRef.current;

    // Если был в режиме удержания (паузы)
    if (isHoldingRef.current || holdDuration > 400) {
      isHoldingRef.current = false;
      setIsHolding(false);
      // Если пауза не была включена вручную кнопкой, возобновляем воспроизведение
      if (!isManuallyPausedRef.current) {
        setIsPaused(false);
      }
      return;
    }

    setIsHolding(false);

    // Проверяем свайп по горизонтали (свайп влево = вперед, свайп вправо = назад)
    const isHorizontalSwipe = Math.abs(deltaX) > 40 && Math.abs(deltaX) > Math.abs(deltaY) * 1.5;
    if (isHorizontalSwipe) {
      if (deltaX < 0) {
        handleNextStory(); // Свайп влево -> следующий слайд
      } else {
        handlePrevStory(); // Свайп вправо -> предыдущий слайд
      }
      return;
    }

    // Обычный тап: определяем зону по точке нажатия (startX)
    const rect = e.currentTarget.getBoundingClientRect();
    const relativeX = pointerStartXRef.current - rect.left;
    const isLeftZone = relativeX < rect.width * 0.3;

    if (isLeftZone) {
      handlePrevStory();
    } else {
      handleNextStory();
    }
  };

  const handlePointerCancel = () => {
    if (holdTimeoutRef.current) {
      clearTimeout(holdTimeoutRef.current);
      holdTimeoutRef.current = null;
    }
    isHoldingRef.current = false;
    setIsHolding(false);
    if (!isManuallyPausedRef.current) {
      setIsPaused(false);
    }
  };

  return (
    <div
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      onPointerLeave={handlePointerCancel}
      onContextMenu={(e) => e.preventDefault()} // Блокируем контекстное меню при долгом тапе
      className={`relative flex-1 flex flex-col justify-between p-6 bg-gradient-to-b ${currentStory.bgGradient} transition-colors duration-700 select-none overflow-hidden cursor-pointer touch-none`}
    >
      {/* Анимированные фоновые пятна */}
      <motion.div
        key={`blob-${currentStory.id}`}
        initial={{ scale: 0.8, opacity: 0, rotate: 0 }}
        animate={{
          scale: isPaused ? 0.95 : [1, 1.15, 1],
          opacity: 0.35,
          rotate: [0, 45, 0],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-white/15 blur-[80px] pointer-events-none"
      />

      {/* ВЕРХНЯЯ ПАНЕЛЬ: Прогресс-бары + Шапка */}
      <motion.header
        animate={{ opacity: isHolding ? 0 : 1, y: isHolding ? -10 : 0 }}
        transition={{ duration: 0.2 }}
        className="relative z-20 space-y-3"
      >
        {/* Полоски прогресса с увеличенной зоной клика */}
        <div className="flex gap-1.5 w-full">
          {STORIES_DATA.map((story, idx) => {
            let barWidth = '0%';
            if (idx < currentIndex) barWidth = '100%';
            if (idx === currentIndex) barWidth = `${progress}%`;

            return (
              <button
                key={story.id}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  jumpToStory(idx);
                }}
                className="flex-1 py-2 -my-2 flex items-center cursor-pointer group focus:outline-none"
                aria-label={`Перейти к слайду ${idx + 1}`}
              >
                <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm group-hover:bg-white/30 transition-colors">
                  <div
                    className="h-full bg-white rounded-full transition-all duration-75"
                    style={{ width: barWidth }}
                  />
                </div>
              </button>
            );
          })}
        </div>

        {/* Инфо-строка под полосками */}
        <div className="flex items-center justify-between text-xs font-medium text-white/80 gap-2">
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
            <span className="w-6 h-6 shrink-0 rounded-full bg-white/20 flex items-center justify-center text-xs">
              ✨
            </span>
            <span className="tracking-wide font-semibold truncate">2026 WRAPPED</span>
            <span className="text-white/40 shrink-0">•</span>
            <span className="text-white/50 shrink-0">
              {currentIndex + 1} из {STORIES_DATA.length}
            </span>
          </div>

          {/* Кнопки управления: Пауза и Звук */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Очевидная кнопка Пауза / Плей */}
            <button
              type="button"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                togglePause();
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full backdrop-blur-md transition-all text-xs font-semibold cursor-pointer border ${
                isPaused
                  ? 'bg-amber-500 border-amber-400 text-zinc-950 shadow-md shadow-amber-500/30 scale-105'
                  : 'bg-white/10 hover:bg-white/20 border-white/15 text-white'
              }`}
              title={isPaused ? 'Возобновить просмотр' : 'Поставить на паузу'}
              aria-label={isPaused ? 'Возобновить просмотр' : 'Поставить на паузу'}
            >
              {isPaused ? (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Плей</span>
                </>
              ) : (
                <>
                  <Pause className="w-3.5 h-3.5 fill-current" />
                  <span>Пауза</span>
                </>
              )}
            </button>

            {/* Кнопка звука */}
            <button
              type="button"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                triggerHaptic(10);
                toggleMute();
                sound.playTap(!isMuted);
              }}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md transition-colors border border-white/15 text-white cursor-pointer"
              title={isMuted ? 'Включить звук' : 'Выключить звук'}
              aria-label={isMuted ? 'Включить звук' : 'Выключить звук'}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </motion.header>

      {/* ЦЕНТРАЛЬНЫЙ КОНТЕНТ СЛАЙДА (с поддержкой прокрутки на сверхмалых экранах) */}
      <div className="relative z-10 my-auto py-4 min-h-0 overflow-y-auto no-scrollbar">
        <AnimatePresence mode="wait" custom={slideDirection}>
          <motion.div
            key={currentStory.id}
            custom={slideDirection}
            initial={{ opacity: 0, x: slideDirection * 40, scale: 0.95 }}
            animate={{
              opacity: 1,
              x: 0,
              scale: isPaused ? 0.97 : 1,
            }}
            exit={{ opacity: 0, x: slideDirection * -40, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            className="space-y-6"
          >
            {/* Эмодзи-иконка */}
            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.1, type: 'spring', stiffness: 260, damping: 18 }}
              className="text-6xl inline-block"
            >
              {currentStory.emoji}
            </motion.div>

            {/* Тег рубрики */}
            <div className={`text-xs font-black tracking-[0.2em] uppercase ${currentStory.accentColor}`}>
              {currentStory.tag}
            </div>

            {/* Заголовок */}
            <h2 className="text-2xl sm:text-3xl font-extrabold leading-tight tracking-tight text-white">
              {currentStory.title}
            </h2>

            {/* Крупная цифра статистики */}
            {currentStory.statNumber && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="p-5 rounded-3xl bg-white/10 border border-white/15 backdrop-blur-xl shadow-2xl overflow-hidden max-w-full"
              >
                <div
                  className={`font-black tracking-tight leading-tight break-words [overflow-wrap:anywhere] hyphens-auto ${getStatFontSize(
                    currentStory.statNumber
                  )} ${currentStory.accentColor}`}
                >
                  {currentStory.statNumber}
                </div>
                <div className="text-xs text-white/70 mt-1.5 font-medium break-words">
                  {currentStory.statLabel}
                </div>
              </motion.div>
            )}

            {/* Описание */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25 }}
              className="text-sm text-white/80 leading-relaxed"
            >
              {currentStory.description}
            </motion.p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* НИЖНЯЯ ПОДСКАЗКА И ИНДИКАТОР ПАУЗЫ */}
      <div className="relative z-20 h-8 flex items-center justify-center">
        <AnimatePresence mode="wait">
          {isPaused ? (
            <motion.button
              key="paused-badge"
              type="button"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              whileTap={{ scale: 0.95 }}
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                togglePause();
              }}
              className="flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-black/75 border border-amber-400/50 text-xs text-amber-300 backdrop-blur-md cursor-pointer hover:bg-black/90 transition-all shadow-lg shadow-black/40"
              title="Нажмите, чтобы продолжить"
            >
              <Play className="w-3 h-3 fill-current" />
              <span className="font-medium">На паузе • Нажми, чтобы продолжить</span>
            </motion.button>
          ) : (
            <motion.div
              key="hint-badge"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-[11px] text-white/40 tracking-wide text-center"
            >
              Тап — дальше • Свайп • Кнопка «Пауза» наверху
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
