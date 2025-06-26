// Avatares bíblicos animados com emojis e cores
export const biblicalAvatars = [
  {
    id: 'moses',
    name: 'Moisés',
    emoji: '👨‍🦳',
    color: 'from-blue-500 to-indigo-600',
    description: 'O Libertador'
  },
  {
    id: 'david',
    name: 'Davi',
    emoji: '👑',
    color: 'from-yellow-500 to-orange-600',
    description: 'O Rei Salmista'
  },
  {
    id: 'mary',
    name: 'Maria',
    emoji: '👸',
    color: 'from-pink-500 to-rose-600',
    description: 'A Mãe de Jesus'
  },
  {
    id: 'noah',
    name: 'Noé',
    emoji: '🚢',
    color: 'from-green-500 to-teal-600',
    description: 'O Construtor da Arca'
  },
  {
    id: 'abraham',
    name: 'Abraão',
    emoji: '👴',
    color: 'from-purple-500 to-violet-600',
    description: 'O Pai da Fé'
  },
  {
    id: 'esther',
    name: 'Ester',
    emoji: '👸🏽',
    color: 'from-red-500 to-pink-600',
    description: 'A Rainha Corajosa'
  },
  {
    id: 'solomon',
    name: 'Salomão',
    emoji: '👨‍⚖️',
    color: 'from-amber-500 to-yellow-600',
    description: 'O Rei Sábio'
  },
  {
    id: 'daniel',
    name: 'Daniel',
    emoji: '🦁',
    color: 'from-orange-500 to-red-600',
    description: 'O Profeta Corajoso'
  },
  {
    id: 'ruth',
    name: 'Rute',
    emoji: '🌾',
    color: 'from-emerald-500 to-green-600',
    description: 'A Fiel Nora'
  },
  {
    id: 'joshua',
    name: 'Josué',
    emoji: '⚔️',
    color: 'from-slate-500 to-gray-600',
    description: 'O Guerreiro'
  },
  {
    id: 'deborah',
    name: 'Débora',
    emoji: '👩‍⚖️',
    color: 'from-cyan-500 to-blue-600',
    description: 'A Juíza'
  },
  {
    id: 'elijah',
    name: 'Elias',
    emoji: '🔥',
    color: 'from-red-600 to-orange-700',
    description: 'O Profeta do Fogo'
  }
];

export function getRandomAvatar() {
  return biblicalAvatars[Math.floor(Math.random() * biblicalAvatars.length)];
}

export function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}