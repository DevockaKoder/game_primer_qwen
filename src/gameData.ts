export interface Generator {
  id: string;
  name: string;
  description: string;
  baseCost: number;
  costMultiplier: number;
  baseProduction: number;
  icon: string;
}

export interface Upgrade {
  id: string;
  name: string;
  description: string;
  cost: number;
  effect: 'clickMultiplier' | 'generatorMultiplier' | 'allMultiplier';
  multiplier: number;
  targetId?: string;
  requirement: number; // LOC needed to unlock
  icon: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  requiredLOC: number;
  reward: string;
  icon: string;
}

export const generators: Generator[] = [
  {
    id: 'autocomplete',
    name: 'Автодополнение',
    description: 'IDE подсказывает код за тебя',
    baseCost: 15,
    costMultiplier: 1.15,
    baseProduction: 0.1,
    icon: '💡',
  },
  {
    id: 'script',
    name: 'Скрипт автоматизации',
    description: 'Bash-скрипт пишет бойлерплейт',
    baseCost: 100,
    costMultiplier: 1.15,
    baseProduction: 1,
    icon: '📜',
  },
  {
    id: 'junior',
    name: 'Junior Developer',
    description: 'Стажёр копирует с StackOverflow',
    baseCost: 1100,
    costMultiplier: 1.15,
    baseProduction: 8,
    icon: '👶',
  },
  {
    id: 'middle',
    name: 'Middle Developer',
    description: 'Пишет чистый код (иногда)',
    baseCost: 12000,
    costMultiplier: 1.15,
    baseProduction: 47,
    icon: '👨‍💻',
  },
  {
    id: 'senior',
    name: 'Senior Developer',
    description: 'Архитектор решений, гуглит меньше',
    baseCost: 130000,
    costMultiplier: 1.15,
    baseProduction: 260,
    icon: '🧙‍♂️',
  },
  {
    id: 'techlead',
    name: 'Tech Lead',
    description: 'Управляет командой и пьёт кофе',
    baseCost: 1400000,
    costMultiplier: 1.15,
    baseProduction: 1400,
    icon: '👔',
  },
  {
    id: 'copilot',
    name: 'AI Copilot',
    description: 'Нейросеть пишет код за тебя',
    baseCost: 20000000,
    costMultiplier: 1.15,
    baseProduction: 7800,
    icon: '🤖',
  },
  {
    id: 'quantum',
    name: 'Квантовый компьютер',
    description: 'Вычисляет все возможные решения одновременно',
    baseCost: 330000000,
    costMultiplier: 1.15,
    baseProduction: 44000,
    icon: '⚛️',
  },
  {
    id: 'agi',
    name: 'AGI',
    description: 'Общий искусственный интеллект. Конец близок.',
    baseCost: 5100000000,
    costMultiplier: 1.15,
    baseProduction: 260000,
    icon: '🧠',
  },
];

export const upgrades: Upgrade[] = [
  {
    id: 'mechanical_keyboard',
    name: 'Механическая клавиатура',
    description: 'Клики x2. Щелчки вдохновляют!',
    cost: 100,
    effect: 'clickMultiplier',
    multiplier: 2,
    requirement: 50,
    icon: '⌨️',
  },
  {
    id: 'second_monitor',
    name: 'Второй монитор',
    description: 'Автодополнение x2. Больше экранов = больше кода',
    cost: 500,
    effect: 'generatorMultiplier',
    multiplier: 2,
    targetId: 'autocomplete',
    requirement: 200,
    icon: '🖥️',
  },
  {
    id: 'coffee_machine',
    name: 'Кофемашина',
    description: 'Всё производство x2. Кофе — топливо программиста',
    cost: 5000,
    effect: 'allMultiplier',
    multiplier: 2,
    requirement: 2000,
    icon: '☕',
  },
  {
    id: 'ergonomic_chair',
    name: 'Эргономичное кресло',
    description: 'Клики x3. Комфорт = продуктивность',
    cost: 10000,
    effect: 'clickMultiplier',
    multiplier: 3,
    requirement: 5000,
    icon: '🪑',
  },
  {
    id: 'stack_overflow',
    name: 'Подписка StackOverflow',
    description: 'Junior x2. Ответы на все вопросы',
    cost: 25000,
    effect: 'generatorMultiplier',
    multiplier: 2,
    targetId: 'junior',
    requirement: 10000,
    icon: '📚',
  },
  {
    id: 'standing_desk',
    name: 'Стол-трансформер',
    description: 'Middle x2. Стоя думается лучше',
    cost: 100000,
    effect: 'generatorMultiplier',
    multiplier: 2,
    targetId: 'middle',
    requirement: 50000,
    icon: '🏗️',
  },
  {
    id: 'noise_cancelling',
    name: 'Шумоподавляющие наушники',
    description: 'Senior x2. Тишина = фокус',
    cost: 500000,
    effect: 'generatorMultiplier',
    multiplier: 2,
    targetId: 'senior',
    requirement: 200000,
    icon: '🎧',
  },
  {
    id: 'rubber_duck',
    name: 'Резиновая утка',
    description: 'Всё производство x2. Метод утани работает!',
    cost: 2000000,
    effect: 'allMultiplier',
    multiplier: 2,
    requirement: 1000000,
    icon: '🦆',
  },
  {
    id: 'vim',
    name: 'Выучить Vim',
    description: 'Клики x5. Ты никогда не вернёшься назад',
    cost: 10000000,
    effect: 'clickMultiplier',
    multiplier: 5,
    requirement: 5000000,
    icon: '📝',
  },
  {
    id: 'open_source',
    name: 'Open Source контрибьютор',
    description: 'Tech Lead x3. Сообщество помогает',
    cost: 50000000,
    effect: 'generatorMultiplier',
    multiplier: 3,
    targetId: 'techlead',
    requirement: 20000000,
    icon: '🌐',
  },
  {
    id: 'gpu_cluster',
    name: 'GPU кластер',
    description: 'Copilot x3. Больше VRAM = больше токенов',
    cost: 500000000,
    effect: 'generatorMultiplier',
    multiplier: 3,
    targetId: 'copilot',
    requirement: 200000000,
    icon: '🎮',
  },
  {
    id: 'dark_mode',
    name: 'Тёмная тема везде',
    description: 'Всё x3. Глаза не болят — код летит',
    cost: 2000000000,
    effect: 'allMultiplier',
    multiplier: 3,
    requirement: 1000000000,
    icon: '🌑',
  },
];

export const projects: Project[] = [
  {
    id: 'hello_world',
    name: 'Hello World',
    description: 'Первая программа. Путь начался!',
    requiredLOC: 50,
    reward: 'Ты написал первую программу!',
    icon: '👋',
  },
  {
    id: 'calculator',
    name: 'Калькулятор',
    description: 'Консольный калькулятор на Python',
    requiredLOC: 500,
    reward: 'Базовые алгоритмы освоены',
    icon: '🧮',
  },
  {
    id: 'todo_app',
    name: 'To-Do приложение',
    description: 'CRUD приложение с базой данных',
    requiredLOC: 5000,
    reward: 'Fullstack разработка',
    icon: '✅',
  },
  {
    id: 'website',
    name: 'Веб-сайт',
    description: 'Адаптивный сайт с бэкендом',
    requiredLOC: 50000,
    reward: 'Деплой в продакшн!',
    icon: '🌍',
  },
  {
    id: 'mobile_app',
    name: 'Мобильное приложение',
    description: 'React Native приложение в сторах',
    requiredLOC: 500000,
    reward: '1000 скачиваний в первую неделю',
    icon: '📱',
  },
  {
    id: 'saas',
    name: 'SaaS продукт',
    description: 'Облачный сервис с подпиской',
    requiredLOC: 5000000,
    reward: 'Первые платящие клиенты!',
    icon: '💰',
  },
  {
    id: 'social_network',
    name: 'Социальная сеть',
    description: 'Платформа с миллионами пользователей',
    requiredLOC: 50000000,
    reward: 'Миллион активных пользователей',
    icon: '👥',
  },
  {
    id: 'os',
    name: 'Операционная система',
    description: 'Своя ОС с нуля',
    requiredLOC: 500000000,
    reward: 'Линус Торвальдс одобряет',
    icon: '💻',
  },
  {
    id: 'agi',
    name: 'AGI',
    description: 'Общий искусственный интеллект',
    requiredLOC: 10000000000,
    reward: '🎉 ПОБЕДА! Ты создал AGI!',
    icon: '🧠',
  },
];

export const clickMessages = [
  'console.log("code")',
  'function write() {}',
  'import { code } from "brain"',
  'git commit -m "fix"',
  'npm install productivity',
  'if (tired) { coffee() }',
  'while(true) { code() }',
  'return success;',
  '// TODO: sleep',
  'const bug = "feature"',
  'try { code } catch { google }',
  'docker compose up',
  'SELECT * FROM skills',
  'async function learn() {}',
  'export default genius',
  'rm -rf bugs/',
  'chmod 777 life',
  'ping localhost',
  'ssh brain@productivity',
  'make build',
];
