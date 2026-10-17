import { useCallback, useEffect, useRef, useState } from 'react';
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useTransform,
  type PanInfo,
  type Variants,
} from 'framer-motion';
import {
  ArrowLeft,
  BadgeCheck,
  ChevronRight,
  Heart,
  MapPin,
  RotateCcw,
  Sparkles,
  Undo2,
  X,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CHARACTERS, type Character, type CharacterSwipe } from '../data/characters';
import { useAppStore } from '../store/useAppStore';
import { triggerHaptic } from '../utils/haptics';
import { sound } from '../utils/sound';

// Позиции и наклон декоративных стикеров на «фото»
const STICKER_META = [
  { position: 'top-[25%] left-[9%]', rotate: -12, size: 'text-2xl' },
  { position: 'top-[30%] right-[9%]', rotate: 10, size: 'text-2xl' },
  { position: 'bottom-[21%] right-[13%]', rotate: 8, size: 'text-xl' },
];

const cardVariants: Variants = {
  initial: { opacity: 0, scale: 0.94, y: 18 },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 320, damping: 28 },
  },
  exit: (direction: number) => ({
    x: direction * 620,
    rotate: direction * 18,
    opacity: 0,
    transition: { duration: 0.28, ease: 'easeIn' },
  }),
};

export default function DatingScene() {
  const {
    nextScene,
    prevScene,
    isMuted,
    characterSwipes,
    saveCharacterSwipe,
    undoCharacterSwipe,
    resetCharacterSwipes,
  } = useAppStore();

  const remaining = CHARACTERS.filter((character) => !characterSwipes[character.id]);
  const current = remaining[0];
  const next = remaining[1];
  const swipedCount = CHARACTERS.length - remaining.length;
  const swipedIds = Object.keys(characterSwipes);
  const lastSwipedId = swipedIds[swipedIds.length - 1];
  const matches = CHARACTERS.filter((character) => characterSwipes[character.id] === 'like');
  const skipped = CHARACTERS.length - remaining.length - matches.length;

  const [exitDirection, setExitDirection] = useState<1 | -1>(1);
  const [matchToast, setMatchToast] = useState<Character | null>(null);

  const currentIdRef = useRef<string | undefined>(current?.id);
  const toastTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    currentIdRef.current = current?.id;
  }, [current]);

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    };
  }, []);

  const goBack = () => {
    triggerHaptic(10);
    sound.playSwipe(isMuted);
    prevScene();
  };

  const handleSwipe = useCallback(
    (swipe: CharacterSwipe) => {
      const characterId = currentIdRef.current;
      if (!characterId) return;

      // Защита от двойного свайпа, пока карточка еще улетает
      currentIdRef.current = undefined;

      const character = CHARACTERS.find((item) => item.id === characterId);
      if (!character) return;

      setExitDirection(swipe === 'like' ? 1 : -1);
      saveCharacterSwipe(characterId, swipe);
      triggerHaptic(swipe === 'like' ? [12, 30, 14] : 12);
      sound.playSwipe(isMuted);

      if (swipe === 'like') {
        sound.playPunchline(isMuted);
        confetti({
          particleCount: 48,
          spread: 72,
          origin: { y: 0.58 },
          colors: ['#fb7185', '#f472b6', '#fbbf24', '#34d399'],
        });

        // На последней карточке сразу открывается экран итогов — там уже есть конфетти и заголовок
        if (remaining.length === 1) {
          setMatchToast(null);
        } else {
          setMatchToast(character);
          if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
          toastTimeoutRef.current = window.setTimeout(() => setMatchToast(null), 1700);
        }
      }
    },
    [isMuted, remaining.length, saveCharacterSwipe]
  );

  const handleUndo = useCallback(() => {
    if (!lastSwipedId) return;

    triggerHaptic(10);
    sound.playTap(isMuted);
    setExitDirection(-1);
    setMatchToast(null);
    undoCharacterSwipe(lastSwipedId);
  }, [isMuted, lastSwipedId, undoCharacterSwipe]);

  const handleRestart = () => {
    triggerHaptic(20);
    sound.playTap(isMuted);
    setMatchToast(null);
    setExitDirection(-1);
    resetCharacterSwipes();
  };

  const handleNext = useCallback(() => {
    triggerHaptic(15);
    sound.playSwipe(isMuted);
    nextScene();
  }, [isMuted, nextScene]);

  // Клавиатура: ← мимо, → мэтч, Backspace — отменить
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        handleSwipe('skip');
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        handleSwipe('like');
      } else if (event.key === 'Backspace') {
        event.preventDefault();
        handleUndo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSwipe, handleUndo]);

  return (
    <div className="relative flex-1 flex flex-col min-h-0 p-5 pb-4 bg-gradient-to-b from-rose-950/80 via-zinc-900 to-zinc-950 select-none overflow-hidden">
      {/* Фоновое свечение */}
      <div className="pointer-events-none absolute -top-24 -right-24 w-72 h-72 rounded-full bg-rose-500/20 blur-[90px]" />
      <div className="pointer-events-none absolute -bottom-28 -left-24 w-64 h-64 rounded-full bg-fuchsia-500/15 blur-[80px]" />

      {/* ШАПКА */}
      <header className="relative z-20 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={goBack}
          className="flex items-center gap-1 text-[11px] font-semibold text-white/55 hover:text-white px-2 py-1.5 -ml-1 rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Шутки</span>
        </button>

        <div className="flex items-center gap-1.5">
          <span className="w-6 h-6 rounded-full bg-rose-500/20 border border-rose-400/30 flex items-center justify-center">
            <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400/70" />
          </span>
          <span className="text-[10px] font-black tracking-[0.12em] text-rose-100 whitespace-nowrap">
            ШПИТА-ДЕЙТИНГ
          </span>
        </div>

        <span className="text-[10px] font-mono text-white/40 tabular-nums min-w-[34px] text-right">
          {current ? `${swipedCount + 1}/${CHARACTERS.length}` : 'ИТОГИ'}
        </span>
      </header>

      {/* ОБЛАСТЬ КАРТОЧЕК */}
      <div className="relative z-10 flex-1 min-h-0 my-3 flex items-center justify-center">
        <div className="relative w-full h-full max-h-[620px]">
          {!current && (
            <ResultsView
              matches={matches}
              skipped={skipped}
              onRestart={handleRestart}
              onNext={handleNext}
            />
          )}

          {next && (
            <div
              aria-hidden
              className="absolute inset-0 scale-[0.945] translate-y-4 opacity-60 pointer-events-none blur-[0.4px]"
            >
              <CardFace character={next} />
            </div>
          )}

          <AnimatePresence initial={false} custom={exitDirection}>
            {current && (
              <motion.div
                key={current.id}
                custom={exitDirection}
                variants={cardVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="absolute inset-0"
              >
                <SwipeCard character={current} onSwipe={handleSwipe} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Всплывашка о мэтче */}
          <AnimatePresence>
            {matchToast && (
              <motion.div
                key={matchToast.id}
                initial={{ opacity: 0, y: -14, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 360, damping: 24 }}
                className="pointer-events-none absolute top-16 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-950/90 px-3.5 py-2 shadow-xl shadow-emerald-900/40 backdrop-blur-md"
              >
                <span className="text-lg leading-none">{matchToast.avatar}</span>
                <span className="text-xs font-black text-emerald-300 whitespace-nowrap">
                  Мэтч с {matchToast.name}! 💘
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* НИЖНЯЯ ПАНЕЛЬ УПРАВЛЕНИЯ */}
      {current && (
        <div className="relative z-20">
          <div className="flex items-center justify-center gap-5">
            <motion.button
              type="button"
              whileTap={{ scale: 0.88 }}
              onClick={handleUndo}
              disabled={!lastSwipedId}
              aria-label="Отменить последний свайп"
              className="w-11 h-11 rounded-full border border-white/15 bg-white/5 text-amber-300 flex items-center justify-center transition-colors enabled:hover:bg-white/10 disabled:opacity-25 disabled:cursor-not-allowed cursor-pointer"
            >
              <Undo2 className="w-4 h-4" />
            </motion.button>

            <motion.button
              type="button"
              whileTap={{ scale: 0.9 }}
              onClick={() => handleSwipe('skip')}
              aria-label="Пролистнуть карточку"
              className="w-16 h-16 rounded-full border-2 border-rose-400/30 bg-rose-500/10 text-rose-300 flex items-center justify-center shadow-lg shadow-rose-950/50 hover:bg-rose-500/20 transition-colors cursor-pointer"
            >
              <X className="w-7 h-7" />
            </motion.button>

            <motion.button
              type="button"
              whileTap={{ scale: 0.9 }}
              onClick={() => handleSwipe('like')}
              aria-label="Поставить мэтч"
              className="w-[72px] h-[72px] rounded-full bg-gradient-to-br from-rose-500 to-pink-600 text-white flex items-center justify-center shadow-[0_10px_35px_rgba(244,63,94,0.45)] hover:from-rose-400 hover:to-pink-500 transition-colors cursor-pointer"
            >
              <Heart className="w-8 h-8 fill-current" />
            </motion.button>
          </div>

          <p className="mt-2 text-center text-[10px] text-white/35">
            Свайп вправо — мэтч · влево — мимо
          </p>
        </div>
      )}
    </div>
  );
}

/* ============================================================================
   КАРТОЧКА С ФИЗИКОЙ СВАЙПА
============================================================================ */
function SwipeCard({
  character,
  onSwipe,
}: {
  character: Character;
  onSwipe: (swipe: CharacterSwipe) => void;
}) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-260, 0, 260], [-15, 0, 15]);
  const likeOpacity = useTransform(x, [24, 120], [0, 1]);
  const skipOpacity = useTransform(x, [-120, -24], [1, 0]);

  const handleDragEnd = (_event: unknown, info: PanInfo) => {
    const threshold = 105;
    if (info.offset.x > threshold || info.velocity.x > 650) {
      onSwipe('like');
    } else if (info.offset.x < -threshold || info.velocity.x < -650) {
      onSwipe('skip');
    }
  };

  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.85}
      dragSnapToOrigin
      onDragEnd={handleDragEnd}
      style={{ x, rotate, touchAction: 'pan-y' }}
      className="absolute inset-0 cursor-grab active:cursor-grabbing"
    >
      <CardFace character={character} />

      {/* Штампики при перетаскивании */}
      <motion.div
        style={{ opacity: likeOpacity }}
        className="pointer-events-none absolute top-16 left-4 z-30 -rotate-[14deg] rounded-xl border-4 border-emerald-400 bg-emerald-950/40 px-3 py-1 text-2xl font-black tracking-wider text-emerald-300 shadow-lg"
      >
        МЭТЧ
      </motion.div>
      <motion.div
        style={{ opacity: skipOpacity }}
        className="pointer-events-none absolute top-16 right-4 z-30 rotate-[14deg] rounded-xl border-4 border-rose-500 bg-rose-950/40 px-3 py-1 text-2xl font-black tracking-wider text-rose-300 shadow-lg"
      >
        МИМО
      </motion.div>
    </motion.div>
  );
}

/* ============================================================================
   ЛИЦЕВАЯ СТОРОНА КАРТОЧКИ
============================================================================ */
function CardFace({ character }: { character: Character }) {
  return (
    <div className="relative w-full h-full rounded-[30px] border border-white/10 bg-zinc-900 overflow-hidden shadow-2xl shadow-black/60">
      {/* «ФОТО» */}
      <div
        className={`relative h-[52%] short:h-[48%] w-full shrink-0 bg-gradient-to-br ${character.gradient}`}
      >
        <div className="absolute -top-12 -left-12 w-44 h-44 rounded-full bg-white/25 blur-2xl" />
        <div className="absolute -bottom-20 -right-14 w-52 h-52 rounded-full bg-black/30 blur-2xl" />

        {/* Полоски «фотографий» */}
        <div className="absolute top-3 inset-x-3 z-20 flex gap-1.5">
          {[0, 1, 2].map((index) => (
            <div
              key={index}
              className={`h-1 flex-1 rounded-full ${index === 0 ? 'bg-white/90' : 'bg-white/30'}`}
            />
          ))}
        </div>

        {/* Совместимость */}
        <div className="absolute top-7 right-3 z-20 flex items-center gap-1 rounded-full border border-white/25 bg-black/30 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur-md">
          <Heart className="w-3 h-3 fill-rose-300 text-rose-300" />
          <span>{character.compatibility}% шпита</span>
        </div>

        {/* Портрет */}
        <div className="absolute inset-0 flex items-center justify-center pb-3">
          <span className="text-[104px] short:text-[88px] leading-none drop-shadow-[0_16px_28px_rgba(0,0,0,0.35)]">
            {character.avatar}
          </span>
        </div>

        {/* Стикеры */}
        {character.stickers.map((sticker, index) => {
          const meta = STICKER_META[index] ?? STICKER_META[0];
          return (
            <motion.span
              key={`${character.id}-${sticker}`}
              animate={{
                y: [0, -5, 0],
                rotate: [meta.rotate, meta.rotate + 5, meta.rotate],
              }}
              transition={{
                duration: 3.2 + index * 0.7,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className={`absolute z-20 ${meta.position} ${meta.size} drop-shadow-lg`}
            >
              {sticker}
            </motion.span>
          );
        })}

        {/* Дистанция */}
        <div className="absolute bottom-7 short:bottom-5 left-4 z-20 flex items-center gap-1 rounded-full border border-white/20 bg-black/30 px-2.5 py-1 text-[10px] font-semibold text-white/85 backdrop-blur-md">
          <MapPin className="w-3 h-3" />
          <span>{character.distance}</span>
        </div>

        {/* Плавный переход к инфо */}
        <div className="absolute inset-x-0 bottom-0 h-24 short:h-16 bg-gradient-to-t from-zinc-900 via-zinc-900/70 to-transparent" />
      </div>

      {/* ИНФО */}
      <div className="relative flex-1 min-h-0 -mt-5 short:-mt-4 px-5 short:px-4 pb-4 short:pb-3 overflow-y-auto no-scrollbar">
        <div className="flex items-center gap-1.5 flex-wrap">
          <h2 className="text-[26px] short:text-[22px] font-black leading-none text-white tracking-tight">
            {character.name}
          </h2>
          <BadgeCheck className="w-[18px] h-[18px] text-sky-400 fill-sky-400/25 shrink-0" />
          {(character.tag || character.ethnicity) && (
            <span className="rounded-full border border-white/15 bg-white/10 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-white/70">
              {character.tag || character.ethnicity}
            </span>
          )}
        </div>

        <div className="mt-1.5 short:mt-1 flex items-center gap-1 text-[11px] short:text-[10px] text-white/55 flex-wrap">
          <MapPin className="w-3 h-3 shrink-0" />
          <span>
            {character.city} {character.countryEmoji} · {character.job}
          </span>
        </div>

        <p className={`mt-2 short:mt-1.5 text-[13px] short:text-[12px] font-bold leading-snug ${character.accent}`}>
          {character.tagline}
        </p>

        <p className="mt-1.5 short:mt-1 text-[12px] short:text-[11px] leading-relaxed short:leading-snug text-white/70">
          {character.bio}
        </p>

        <div className="mt-2 short:mt-1.5 flex flex-wrap gap-1.5 short:gap-1">
          {character.interests.map((interest) => (
            <span
              key={interest}
              className="rounded-full border border-white/10 bg-white/5 px-2.5 short:px-2 py-1 short:py-0.5 text-[10px] short:text-[9px] font-semibold text-white/75"
            >
              {interest}
            </span>
          ))}
        </div>

        <div className="mt-2 short:mt-1.5 flex items-start gap-1.5 rounded-xl border border-white/10 bg-white/5 px-2.5 short:px-2 py-2 short:py-1.5 text-[10.5px] short:text-[10px] leading-snug text-white/70">
          <Sparkles className={`w-3.5 h-3.5 mt-px shrink-0 ${character.accent}`} />
          <span className="min-w-0 break-words">
            <span className="text-white/45">Суперсила: </span>
            {character.superpower}
          </span>
        </div>
      </div>
    </div>
  );
}

/* ============================================================================
   ЭКРАН ИТОГОВ ДЕЙТИНГА
============================================================================ */
function ResultsView({
  matches,
  skipped,
  onRestart,
  onNext,
}: {
  matches: Character[];
  skipped: number;
  onRestart: () => void;
  onNext: () => void;
}) {
  const summary =
    matches.length === 0
      ? 'Ноль мэтчей. Зато шпитациркуль всё ещё идеален.'
      : matches.length <= 2
        ? 'Скромно, но со вкусом. Шпита одобряет!'
        : matches.length <= 4
          ? 'Серьёзный улов! Германия в опасности.'
          : 'Абсолютный максимум! Легенда шпита-дейтинга!';

  return (
    <div className="relative z-10 flex flex-col h-full min-h-0">
      <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar flex flex-col">
        <div className="my-auto py-1">
          <div className="text-center">
            <motion.div
              initial={{ scale: 0, rotate: -18 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 280, damping: 18 }}
              className="text-6xl inline-block"
            >
              💘
            </motion.div>

            <h2 className="mt-2 text-2xl font-black tracking-tight text-white">
              Мэтчи: {matches.length} из {CHARACTERS.length}
            </h2>
            <p className="mt-1 text-xs text-white/55 max-w-[280px] mx-auto">{summary}</p>
            <p className="mt-1 text-[10px] text-white/30">Мимо прошло: {skipped}</p>
          </div>

          {matches.length > 0 ? (
            <div className="mt-4 space-y-2">
              {matches.map((character, index) => (
                <motion.div
                  key={character.id}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.08 * index }}
                  className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-2"
                >
                  <div
                    className={`w-10 h-10 shrink-0 rounded-full bg-gradient-to-br ${character.gradient} flex items-center justify-center text-xl shadow-inner`}
                  >
                    {character.avatar}
                  </div>
                  <div className="min-w-0 flex-1 text-left">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-black text-white">
                        {character.name}
                      </span>
                      {(character.tag || character.ethnicity) && (
                        <span className="rounded-full border border-white/15 bg-white/10 px-1.5 py-0.2 text-[8px] font-bold uppercase tracking-wider text-white/60">
                          {character.tag || character.ethnicity}
                        </span>
                      )}
                    </div>
                    <div className="text-[10.5px] text-white/50 truncate">
                      {character.city} · {character.job}
                    </div>
                  </div>
                  <Heart className="w-4 h-4 shrink-0 fill-rose-400 text-rose-400" />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="mt-4 rounded-2xl border border-dashed border-white/15 bg-white/5 px-4 py-5 text-center text-xs text-white/45">
              Карточки закончились, а любовь — нет. Попробуй ещё раз!
            </div>
          )}
        </div>
      </div>

      <div className="pt-3 space-y-2">
        <motion.button
          type="button"
          whileTap={{ scale: 0.96 }}
          onClick={onNext}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-400 hover:to-pink-400 text-white font-bold text-sm shadow-lg shadow-rose-500/25 flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
        >
          <span>Дальше: квиз</span>
          <ChevronRight className="w-4 h-4" />
        </motion.button>

        <motion.button
          type="button"
          whileTap={{ scale: 0.96 }}
          onClick={onRestart}
          className="w-full py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white/70 font-semibold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Пройти дейтинг заново</span>
        </motion.button>
      </div>
    </div>
  );
}
