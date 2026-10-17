import { useState, useEffect, useRef, useCallback, type PointerEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX, Pause } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { triggerHaptic } from '../utils/haptics';

// Структура одного слайда Рекапа
interface StorySlide {
  id: string;
  duration: number; // Длительность в мс (например, 6000 = 6 сек)
  tag: string;
  title: string;
  statNumber?: string;
  statLabel?: string;
  description: string;
  emoji: string;
  bgGradient: string;
  accentColor: string;
}

// Контент рекапа (в стиле Spotify Wrapped)
const STORIES_DATA: StorySlide[] = [
  {
    id: 'story-1',
    duration: 5000,
    tag: 'ГЛАВНАЯ ЛОКАЦИЯ ГОДА',
    title: 'Твой год был полон маршрутов',
    statNumber: '1 420 км',
    statLabel: 'пройдено пешком в поисках приключений',
    description: 'От ночных прогулок до спонтанных поездок, которые начинались со слов «давай просто посидим часик».',
    emoji: '🗺️',
    bgGradient: 'from-violet-950 via-fuchsia-950 to-zinc-950',
    accentColor: 'text-fuchsia-400',
  },
  {
    id: 'story-2',
    duration: 6000,
    tag: 'ТОП-1 ЖАНР ВЫЖИВАНИЯ',
    title: 'Мастер закрытия задач в последнюю секунду',
    statNumber: '99.4%',
    statLabel: 'нервных клеток успешно восстановлено',
    description: 'Пока другие паниковали, ты просто открывал мем в чате и делал вид, что всё идет строго по плану.',
    emoji: '🔥',
    bgGradient: 'from-rose-950 via-orange-950 to-zinc-950',
    accentColor: 'text-orange-400',
  },
  {
    id: 'story-3',
    duration: 6000,
    tag: 'НОЧНОЙ ДОЗОР',
    title: 'Пик твоей продуктивности приходился на…',
    statNumber: '02:15',
    statLabel: 'среднее время генерации гениальных идей',
    description: 'Именно в это время рождались самые смелые планы, покупались странные вещи и отправлялись лучшие голосовые.',
    emoji: '🦉',
    bgGradient: 'from-cyan-950 via-blue-950 to-zinc-950',
    accentColor: 'text-cyan-400',
  },
  {
    id: 'story-4',
    duration: 5500,
    tag: 'АУРА ГОДА',
    title: 'Главный человек в любом чате',
    statNumber: 'ТОП 0.1%',
    statLabel: 'по уровню поддержки и лучших шуток',
    description: 'Но хватит сухой статистики. Впереди — золотой фонд локальных шуток и легендарных цитат!',
    emoji: '👑',
    bgGradient: 'from-emerald-950 via-teal-950 to-zinc-950',
    accentColor: 'text-emerald-400',
  },
];

export default function RecapScene() {
  const { nextScene, prevScene } = useAppStore();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0); // от 0 до 100
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [slideDirection, setSlideDirection] = useState<1 | -1>(1);

  // Рефы для точного таймера и распознавания "Тап vs Удержание"
  const elapsedRef = useRef<number>(0);
  const lastFrameTimeRef = useRef<number | null>(null);
  const pointerDownTimeRef = useRef<number>(0);

  const currentStory = STORIES_DATA[currentIndex];

  // Переход к следующему слайду (или следующей сцене, если сторис закончились)
  const handleNextStory = useCallback(() => {
    triggerHaptic(12);
    elapsedRef.current = 0;
    setProgress(0);

    if (currentIndex < STORIES_DATA.length - 1) {
      setSlideDirection(1);
      setCurrentIndex((prev) => prev + 1);
    } else {
      nextScene(); // Переход к QUIZ
    }
  }, [currentIndex, nextScene]);

  // Переход к предыдущему слайду (или возврат в Интро)
  const handlePrevStory = useCallback(() => {
    triggerHaptic(12);
    // Если сторис прошла больше чем на 25%, тап назад просто перезапускает текущую сторис
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
  }, [currentIndex, prevScene]);

  // Главный игровой цикл (requestAnimationFrame) для плавного заполнения полосок
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

  // Авто-пауза при сворачивании вкладки или звонке на телефоне
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsPaused(document.hidden);
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Обработка касания экрана
  const handlePointerDown = () => {
    pointerDownTimeRef.current = performance.now();
    setIsPaused(true);
  };

  // Обработка отпускания пальца
  const handlePointerUp = (e: PointerEvent<HTMLDivElement>) => {
    const holdDuration = performance.now() - pointerDownTimeRef.current;
    setIsPaused(false);

    // Если держали дольше 200 мс — это была пауза (Hold), слайд не переключаем
    if (holdDuration > 200) {
      return;
    }

    // Иначе это быстрый Тап: вычисляем зону (левые 30% = назад, правые 70% = вперед)
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const isLeftZone = clickX < rect.width * 0.3;

    if (isLeftZone) {
      handlePrevStory();
    } else {
      handleNextStory();
    }
  };

  const handlePointerCancel = () => {
    setIsPaused(false);
  };

  return (
    <div
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      onPointerLeave={handlePointerCancel}
      onContextMenu={(e) => e.preventDefault()} // Блокируем контекстное меню при долгом тапе на Android
      className={`relative flex-1 flex flex-col justify-between p-6 bg-gradient-to-b ${currentStory.bgGradient} transition-colors duration-700 select-none overflow-hidden cursor-pointer`}
    >
      {/* Анимированные фоновые пятна в стиле Spotify Wrapped */}
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

      {/* ВЕРХНЯЯ ПАНЕЛЬ: Прогресс-бары + Шапка (Прячется при долгом удержании) */}
      <motion.header
        animate={{ opacity: isPaused ? 0 : 1, y: isPaused ? -10 : 0 }}
        transition={{ duration: 0.2 }}
        className="relative z-20 space-y-3"
      >
        {/* Полоски прогресса */}
        <div className="flex gap-1.5 w-full">
          {STORIES_DATA.map((story, idx) => {
            let barWidth = '0%';
            if (idx < currentIndex) barWidth = '100%';
            if (idx === currentIndex) barWidth = `${progress}%`;

            return (
              <div
                key={story.id}
                className="flex-1 h-1 bg-white/25 rounded-full overflow-hidden backdrop-blur-sm"
              >
                <div
                  className="h-full bg-white rounded-full"
                  style={{ width: barWidth }}
                />
              </div>
            );
          })}
        </div>

        {/* Инфо-строка под полосками */}
        <div className="flex items-center justify-between text-xs font-medium text-white/80">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs">
              ✨
            </span>
            <span className="tracking-wide font-semibold">2026 WRAPPED</span>
            <span className="text-white/40">•</span>
            <span className="text-white/50">
              {currentIndex + 1} из {STORIES_DATA.length}
            </span>
          </div>

          {/* Кнопка звука — останавливаем всплытие события, чтобы тап по ней не листал сторис */}
          <button
            type="button"
            onPointerDown={(e) => e.stopPropagation()}
            onPointerUp={(e) => {
              e.stopPropagation();
              triggerHaptic(10);
              setIsMuted(!isMuted);
            }}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md transition-colors"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </motion.header>

      {/* ЦЕНТРАЛЬНЫЙ КОНТЕНТ СЛАЙДА */}
      <div className="relative z-10 my-auto py-8">
        <AnimatePresence mode="wait" custom={slideDirection}>
          <motion.div
            key={currentStory.id}
            custom={slideDirection}
            initial={{ opacity: 0, x: slideDirection * 40, scale: 0.95 }}
            animate={{
              opacity: 1,
              x: 0,
              scale: isPaused ? 0.97 : 1, // Легкий зум-аут при удержании пальца
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
            <h2 className="text-3xl font-extrabold leading-tight tracking-tight text-white">
              {currentStory.title}
            </h2>

            {/* Крупная цифра статистики (Wrapped-style карточка) */}
            {currentStory.statNumber && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="p-5 rounded-3xl bg-white/10 border border-white/15 backdrop-blur-xl shadow-2xl"
              >
                <div className={`text-5xl font-black tracking-tighter ${currentStory.accentColor}`}>
                  {currentStory.statNumber}
                </div>
                <div className="text-xs text-white/70 mt-1 font-medium">
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
            <motion.div
              key="paused-badge"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/50 border border-white/15 text-xs text-white/80 backdrop-blur-md"
            >
              <Pause className="w-3 h-3 fill-current" />
              <span>На паузе</span>
            </motion.div>
          ) : (
            <motion.div
              key="hint-badge"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-[11px] text-white/40 tracking-wide text-center"
            >
              Тап — дальше • Удерживай — пауза
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
