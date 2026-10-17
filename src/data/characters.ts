// Персонажи для «Шпита-дейтинга».
// Чтобы добавить нового героя — просто допиши объект в CHARACTERS:
// сцена сама подхватит его, пересчитает счётчики и мэтчи.

export type CharacterSwipe = 'like' | 'skip';

export interface Character {
  id: string;
  name: string;
  age: number;
  city: string;
  countryEmoji: string;
  job: string;
  /** Необязательная подпись рядом с именем, например «бурят» */
  ethnicity?: string;
  distance: string;
  /** Большой эмодзи-портрет на «фото» */
  avatar: string;
  /** Маленькие стикеры, летающие вокруг портрета */
  stickers: string[];
  tagline: string;
  bio: string;
  interests: string[];
  superpower: string;
  /** Шпита-совместимость, % */
  compatibility: number;
  gradient: string;
  accent: string;
}

export const CHARACTERS: Character[] = [
  {
    id: 'anya',
    name: 'Аня',
    age: 24,
    city: 'Мюнхен',
    countryEmoji: '🇩🇪',
    job: 'бармен года в Баварии',
    distance: '1 км от тебя',
    avatar: '👩‍🦰',
    stickers: ['🍺', '☕', '✨'],
    tagline: '«Мне Шпиту пива, пожалуйста!» — и это работает',
    bio: 'Наливаю шпиту пива так, что бармены Мюнхена завидуют. Варю кофе, который спасает дедлайны. В свободное время спорю с навигатором, что столица Германии — Шпитсбург.',
    interests: ['🍺 Шпиту пива', '☕ Кофе из Шпитсбурга', '🗺️ География на 100'],
    superpower: 'Заказывает пиво на шпита без акцента',
    compatibility: 99,
    gradient: 'from-amber-400 via-orange-500 to-rose-600',
    accent: 'text-amber-300',
  },
  {
    id: 'sasha',
    name: 'Саша',
    age: 26,
    city: 'Берлин',
    countryEmoji: '🇩🇪',
    job: 'гитарист Rammшпита',
    distance: 'на другом конце автобана',
    avatar: '🧑‍🎤',
    stickers: ['🎸', '🔥', '🖤'],
    tagline: 'Du... Du hast... Du hast Шпита!',
    bio: 'Играю в кавер-группе Rammшпита и считаю, что громче — значит ближе. Ищу человека, который выдержит мой плейлист и поедет со мной по автобану прямо в Шпитсбург.',
    interests: ['🎸 Rammшпита', '🛣️ Автобаны', '🖤 Тяжеляк'],
    superpower: 'Настраивает гитару по шпитациркулю',
    compatibility: 94,
    gradient: 'from-sky-400 via-blue-500 to-indigo-700',
    accent: 'text-sky-300',
  },
  {
    id: 'kostya',
    name: 'Костя',
    age: 25,
    city: 'Шпитсбург',
    countryEmoji: '🇩🇪',
    job: 'инженер немецкой точности',
    distance: '0.0 шпит от тебя',
    avatar: '🧑‍🔧',
    stickers: ['📐', '🚗', '⚙️'],
    tagline: 'Погрешность — ровно ноль шпит',
    bio: 'Проектирую народный Шпитаваген. На свидание приезжаю на нём же и ровно вовремя. Если ты готова стать моим шпитациркулем — я уже построил маршрут до загса.',
    interests: ['🚗 Шпитаваген', '📐 Шпитациркуль', '⚙️ Точность'],
    superpower: 'Собирает счастье с точностью 0.0 шпит',
    compatibility: 91,
    gradient: 'from-violet-400 via-purple-500 to-indigo-800',
    accent: 'text-violet-300',
  },
  {
    id: 'kirill',
    name: 'Кирилл',
    age: 27,
    city: 'Гамбург',
    countryEmoji: '🇩🇪',
    job: 'звукорежиссёр',
    distance: '48 кГц от тебя',
    avatar: '🧑‍💻',
    stickers: ['🎧', '☀️', '🎹'],
    tagline: 'Включай звук — я уже всё настроил',
    bio: 'Записываю панчлайны на студии и знаю, как звучит «Guten Шпита» в 48 кГц. Ищу человека, с которым даже пауза звучит хорошо. Наушники дам, но сердце — только в мэтче.',
    interests: ['🎧 Саунд-дизайн', '☀️ Guten Шпита', '🎹 Битмейкинг'],
    superpower: 'Слышит шпиту даже в полной тишине',
    compatibility: 96,
    gradient: 'from-fuchsia-400 via-pink-500 to-purple-800',
    accent: 'text-fuchsia-300',
  },
  {
    id: 'andrey',
    name: 'Андрей',
    age: 28,
    city: 'Улан-Удэ',
    countryEmoji: '🏔️',
    job: 'шеф-повар буузной',
    ethnicity: 'бурят',
    distance: 'через степь, 4200 км',
    avatar: '🧑‍🍳',
    stickers: ['🥟', '🐎', '🌊'],
    tagline: 'Буузы, степь и Байкал — три кита',
    bio: 'Бурят из Улан-Удэ. Леплю буузы по рецепту бабушки — 32 защипа, не меньше. Знаю, где в степи лучший закат, и могу довезти до Байкала. Ищу человека, который не боится далеко ехать за вкусным.',
    interests: ['🥟 Буузы', '🐎 Степь', '🌊 Байкал'],
    superpower: 'Готовит буузы на 32 защипа и зовёт к Байкалу',
    compatibility: 97,
    gradient: 'from-emerald-400 via-teal-500 to-cyan-700',
    accent: 'text-emerald-300',
  },
];
