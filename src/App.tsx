import { useState, useEffect, useCallback, useRef } from 'react';
import { generators, upgrades, projects, clickMessages, Generator, Upgrade } from './gameData';

interface GameState {
  loc: number;
  totalLOC: number;
  clickPower: number;
  generatorsOwned: Record<string, number>;
  upgradesBought: string[];
  projectsCompleted: string[];
  prestigeCount: number;
  prestigeMultiplier: number;
  totalClicks: number;
  floatingTexts: { id: number; text: string; x: number; y: number }[];
}

function formatNumber(num: number): string {
  if (num < 1000) return Math.floor(num).toString();
  if (num < 1000000) return (num / 1000).toFixed(1) + 'K';
  if (num < 1000000000) return (num / 1000000).toFixed(2) + 'M';
  if (num < 1000000000000) return (num / 1000000000).toFixed(2) + 'B';
  return (num / 1000000000000).toFixed(2) + 'T';
}

function getGeneratorCost(gen: Generator, owned: number): number {
  return Math.floor(gen.baseCost * Math.pow(gen.costMultiplier, owned));
}

function getLOCPerSecond(state: GameState): number {
  let total = 0;
  for (const gen of generators) {
    const owned = state.generatorsOwned[gen.id] || 0;
    if (owned === 0) continue;
    let production = gen.baseProduction * owned;
    // Apply generator-specific upgrades
    for (const upId of state.upgradesBought) {
      const up = upgrades.find(u => u.id === upId);
      if (up && up.effect === 'generatorMultiplier' && up.targetId === gen.id) {
        production *= up.multiplier;
      }
      if (up && up.effect === 'allMultiplier') {
        production *= up.multiplier;
      }
    }
    production *= state.prestigeMultiplier;
    total += production;
  }
  return total;
}

function getClickPower(state: GameState): number {
  let power = 1;
  for (const upId of state.upgradesBought) {
    const up = upgrades.find(u => u.id === upId);
    if (up && up.effect === 'clickMultiplier') {
      power *= up.multiplier;
    }
  }
  power *= state.prestigeMultiplier;
  return power;
}

const initialState: GameState = {
  loc: 0,
  totalLOC: 0,
  clickPower: 1,
  generatorsOwned: {},
  upgradesBought: [],
  projectsCompleted: [],
  prestigeCount: 0,
  prestigeMultiplier: 1,
  totalClicks: 0,
  floatingTexts: [],
};

function App() {
  const [state, setState] = useState<GameState>(() => {
    const saved = localStorage.getItem('codeclips_save');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return { ...initialState, ...parsed, floatingTexts: [] };
      } catch {
        return initialState;
      }
    }
    return initialState;
  });

  const [activeTab, setActiveTab] = useState<'generators' | 'upgrades' | 'projects'>('generators');
  const [showPrestige, setShowPrestige] = useState(false);
  const [currentMessage, setCurrentMessage] = useState('');
  const floatingIdRef = useRef(0);

  // Save game periodically
  useEffect(() => {
    const interval = setInterval(() => {
      const saveData = { ...state, floatingTexts: [] };
      localStorage.setItem('codeclips_save', JSON.stringify(saveData));
    }, 5000);
    return () => clearInterval(interval);
  }, [state]);

  // Game loop
  useEffect(() => {
    const interval = setInterval(() => {
      const lps = getLOCPerSecond(state);
      if (lps > 0) {
        setState(prev => ({
          ...prev,
          loc: prev.loc + lps / 20,
          totalLOC: prev.totalLOC + lps / 20,
        }));
      }
    }, 50);
    return () => clearInterval(interval);
  }, [state.generatorsOwned, state.upgradesBought, state.prestigeMultiplier]);

  // Floating text cleanup
  useEffect(() => {
    const interval = setInterval(() => {
      setState(prev => ({
        ...prev,
        floatingTexts: prev.floatingTexts.filter(ft => Date.now() - ft.id < 1500),
      }));
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const handleClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    const power = getClickPower(state);
    const msg = clickMessages[Math.floor(Math.random() * clickMessages.length)];
    setCurrentMessage(msg);
    setTimeout(() => setCurrentMessage(''), 800);

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setState(prev => ({
      ...prev,
      loc: prev.loc + power,
      totalLOC: prev.totalLOC + power,
      totalClicks: prev.totalClicks + 1,
      floatingTexts: [
        ...prev.floatingTexts.slice(-8),
        { id: Date.now() + floatingIdRef.current++, text: `+${formatNumber(power)}`, x, y },
      ],
    }));
  }, [state]);

  const buyGenerator = useCallback((genId: string) => {
    const gen = generators.find(g => g.id === genId)!;
    const owned = state.generatorsOwned[genId] || 0;
    const cost = getGeneratorCost(gen, owned);
    if (state.loc >= cost) {
      setState(prev => ({
        ...prev,
        loc: prev.loc - cost,
        generatorsOwned: { ...prev.generatorsOwned, [genId]: (prev.generatorsOwned[genId] || 0) + 1 },
      }));
    }
  }, [state]);

  const buyUpgrade = useCallback((upId: string) => {
    const up = upgrades.find(u => u.id === upId)!;
    if (state.loc >= up.cost && !state.upgradesBought.includes(upId)) {
      setState(prev => ({
        ...prev,
        loc: prev.loc - up.cost,
        upgradesBought: [...prev.upgradesBought, upId],
      }));
    }
  }, [state]);

  const doPrestige = useCallback(() => {
    if (state.totalLOC < 1000000) return;
    const newMultiplier = 1 + Math.log10(state.totalLOC / 100000) * 0.5;
    setState(prev => ({
      ...initialState,
      prestigeCount: prev.prestigeCount + 1,
      prestigeMultiplier: newMultiplier,
      floatingTexts: [],
    }));
    setShowPrestige(false);
  }, [state.totalLOC]);

  const resetGame = useCallback(() => {
    if (confirm('Вы уверены? Весь прогресс будет потерян!')) {
      localStorage.removeItem('codeclips_save');
      setState({ ...initialState, floatingTexts: [] });
    }
  }, []);

  const lps = getLOCPerSecond(state);
  const clickPower = getClickPower(state);
  const availableUpgrades = upgrades.filter(
    u => !state.upgradesBought.includes(u.id) && state.totalLOC >= u.requirement
  );
  const completedProjects = projects.filter(p => state.totalLOC >= p.requiredLOC);
  const nextProject = projects.find(p => state.totalLOC < p.requiredLOC);

  return (
    <div className="min-h-screen bg-gray-900 text-green-400 font-mono flex flex-col">
      {/* Header */}
      <header className="bg-gray-800 border-b border-green-900 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">⌨️</span>
          <h1 className="text-xl md:text-2xl font-bold text-green-300">
            CodeClips
          </h1>
          <span className="text-xs text-gray-500 hidden md:inline">idle programming game</span>
        </div>
        <div className="flex items-center gap-4">
          {state.prestigeCount > 0 && (
            <span className="text-xs bg-purple-900/50 text-purple-300 px-2 py-1 rounded">
              ⭐ x{state.prestigeMultiplier.toFixed(1)}
            </span>
          )}
          <button
            onClick={() => setShowPrestige(true)}
            className="text-xs bg-purple-800/50 hover:bg-purple-700/50 text-purple-300 px-3 py-1 rounded transition-colors"
          >
            Рефакторинг
          </button>
          <button
            onClick={resetGame}
            className="text-xs text-red-400 hover:text-red-300 transition-colors"
          >
            Сброс
          </button>
        </div>
      </header>

      {/* Main Stats */}
      <div className="bg-gray-800/50 border-b border-green-900/50 p-4 text-center">
        <div className="text-3xl md:text-5xl font-bold text-green-300 mb-1">
          {formatNumber(state.loc)}
        </div>
        <div className="text-sm text-gray-400">строк кода</div>
        <div className="flex justify-center gap-6 mt-2 text-xs text-gray-500">
          <span>⚡ {formatNumber(lps)}/сек</span>
          <span>👆 +{formatNumber(clickPower)}/клик</span>
          <span>🖱️ {formatNumber(state.totalClicks)} кликов</span>
        </div>
        {currentMessage && (
          <div className="mt-2 text-xs text-green-600 animate-pulse">{currentMessage}</div>
        )}
      </div>

      {/* Progress bar to next project */}
      {nextProject && (
        <div className="px-4 py-2 bg-gray-800/30">
          <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
            <span>{nextProject.icon}</span>
            <span>Следующий проект: {nextProject.name}</span>
            <span className="ml-auto">{formatNumber(state.totalLOC)} / {formatNumber(nextProject.requiredLOC)}</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, (state.totalLOC / nextProject.requiredLOC) * 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Click area */}
        <div className="md:w-1/3 flex flex-col items-center justify-center p-6 relative">
          <div className="relative">
            <button
              onClick={handleClick}
              className="w-40 h-40 md:w-48 md:h-48 rounded-full bg-gradient-to-br from-green-700 to-green-900 
                         border-4 border-green-500 shadow-lg shadow-green-900/50
                         hover:from-green-600 hover:to-green-800 hover:scale-105 
                         active:scale-95 transition-all duration-100
                         flex flex-col items-center justify-center gap-2
                         cursor-pointer select-none"
            >
              <span className="text-4xl">💻</span>
              <span className="text-sm font-bold">CODE!</span>
              <span className="text-xs text-green-300">+{formatNumber(clickPower)} LOC</span>
            </button>
            {/* Floating texts */}
            {state.floatingTexts.map(ft => (
              <div
                key={ft.id}
                className="absolute pointer-events-none text-green-300 font-bold text-sm animate-bounce"
                style={{
                  left: ft.x,
                  top: ft.y,
                  animation: 'floatUp 1.5s ease-out forwards',
                }}
              >
                {ft.text}
              </div>
            ))}
          </div>

          {/* Terminal-like display */}
          <div className="mt-6 w-full max-w-xs bg-black rounded-lg border border-gray-700 p-3">
            <div className="flex gap-1.5 mb-2">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
            </div>
            <div className="text-xs text-gray-400 space-y-1">
              <div>$ npm run code</div>
              <div className="text-green-400">{'>'} writing code...</div>
              <div className="text-green-400">{'>'} {formatNumber(state.totalLOC)} lines written</div>
              <div className="text-yellow-400">{'>'} bugs: {Math.floor(state.totalLOC / 1000)}</div>
              <div className="text-gray-600">{'>'} _</div>
            </div>
          </div>
        </div>

        {/* Shop area */}
        <div className="md:w-2/3 flex flex-col border-l border-green-900/30 overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-green-900/50">
            <button
              onClick={() => setActiveTab('generators')}
              className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                activeTab === 'generators'
                  ? 'bg-green-900/30 text-green-300 border-b-2 border-green-500'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              🏭 Команда ({Object.values(state.generatorsOwned).reduce((a, b) => a + b, 0)})
            </button>
            <button
              onClick={() => setActiveTab('upgrades')}
              className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                activeTab === 'upgrades'
                  ? 'bg-green-900/30 text-green-300 border-b-2 border-green-500'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              ⬆️ Апгрейды ({state.upgradesBought.length}/{upgrades.length})
            </button>
            <button
              onClick={() => setActiveTab('projects')}
              className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                activeTab === 'projects'
                  ? 'bg-green-900/30 text-green-300 border-b-2 border-green-500'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              📁 Проекты ({completedProjects.length}/{projects.length})
            </button>
          </div>

          {/* Tab content */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {activeTab === 'generators' && generators.map(gen => {
              const owned = state.generatorsOwned[gen.id] || 0;
              const cost = getGeneratorCost(gen, owned);
              const canAfford = state.loc >= cost;
              const production = gen.baseProduction * owned;

              return (
                <button
                  key={gen.id}
                  onClick={() => buyGenerator(gen.id)}
                  disabled={!canAfford}
                  className={`w-full text-left p-3 rounded-lg border transition-all ${
                    canAfford
                      ? 'bg-gray-800 border-green-700 hover:bg-gray-750 hover:border-green-500 cursor-pointer'
                      : 'bg-gray-800/50 border-gray-700 opacity-50 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{gen.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-green-300 text-sm">{gen.name}</span>
                        <span className="text-xs bg-gray-700 px-2 py-0.5 rounded text-gray-300">
                          x{owned}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 truncate">{gen.description}</div>
                      <div className="flex items-center justify-between mt-1">
                        <span className={`text-xs ${canAfford ? 'text-green-400' : 'text-red-400'}`}>
                          💰 {formatNumber(cost)} LOC
                        </span>
                        {owned > 0 && (
                          <span className="text-xs text-gray-400">
                            ⚡ {formatNumber(production)}/сек
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}

            {activeTab === 'upgrades' && (
              <>
                {availableUpgrades.length === 0 && state.upgradesBought.length === upgrades.length && (
                  <div className="text-center text-gray-500 py-8">
                    <span className="text-4xl">🎉</span>
                    <p className="mt-2">Все апгрейды куплены!</p>
                  </div>
                )}
                {availableUpgrades.length === 0 && state.upgradesBought.length < upgrades.length && (
                  <div className="text-center text-gray-500 py-8">
                    <span className="text-4xl">🔒</span>
                    <p className="mt-2">Продолжайте писать код, чтобы открыть новые апгрейды</p>
                  </div>
                )}
                {availableUpgrades.map(up => {
                  const canAfford = state.loc >= up.cost;
                  return (
                    <button
                      key={up.id}
                      onClick={() => buyUpgrade(up.id)}
                      disabled={!canAfford}
                      className={`w-full text-left p-3 rounded-lg border transition-all ${
                        canAfford
                          ? 'bg-yellow-900/20 border-yellow-700 hover:bg-yellow-900/30 hover:border-yellow-500 cursor-pointer'
                          : 'bg-gray-800/50 border-gray-700 opacity-50 cursor-not-allowed'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{up.icon}</span>
                        <div className="flex-1">
                          <div className="font-medium text-yellow-300 text-sm">{up.name}</div>
                          <div className="text-xs text-gray-500">{up.description}</div>
                          <div className={`text-xs mt-1 ${canAfford ? 'text-yellow-400' : 'text-red-400'}`}>
                            💰 {formatNumber(up.cost)} LOC
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
                {state.upgradesBought.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-700">
                    <h3 className="text-xs text-gray-500 mb-2">КУПЛЕННЫЕ:</h3>
                    <div className="flex flex-wrap gap-2">
                      {state.upgradesBought.map(upId => {
                        const up = upgrades.find(u => u.id === upId)!;
                        return (
                          <span
                            key={upId}
                            className="text-xs bg-green-900/30 border border-green-800 rounded px-2 py-1 text-green-400"
                            title={up.description}
                          >
                            {up.icon} {up.name}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}
              </>
            )}

            {activeTab === 'projects' && (
              <div className="space-y-2">
                {projects.map(proj => {
                  const completed = state.totalLOC >= proj.requiredLOC;
                  const progress = Math.min(100, (state.totalLOC / proj.requiredLOC) * 100);
                  return (
                    <div
                      key={proj.id}
                      className={`p-3 rounded-lg border transition-all ${
                        completed
                          ? 'bg-green-900/20 border-green-700'
                          : 'bg-gray-800/50 border-gray-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{proj.icon}</span>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className={`font-medium text-sm ${completed ? 'text-green-300' : 'text-gray-400'}`}>
                              {proj.name}
                            </span>
                            {completed && <span className="text-green-500 text-xs">✓</span>}
                          </div>
                          <div className="text-xs text-gray-500">{proj.description}</div>
                          {completed ? (
                            <div className="text-xs text-green-400 mt-1">🎁 {proj.reward}</div>
                          ) : (
                            <div className="mt-2">
                              <div className="w-full bg-gray-700 rounded-full h-1.5">
                                <div
                                  className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                                  style={{ width: `${progress}%` }}
                                />
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                {formatNumber(state.totalLOC)} / {formatNumber(proj.requiredLOC)} ({progress.toFixed(1)}%)
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Prestige Modal */}
      {showPrestige && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 border border-purple-700 rounded-xl p-6 max-w-md w-full">
            <h2 className="text-xl font-bold text-purple-300 mb-4">🔄 Рефакторинг</h2>
            <p className="text-sm text-gray-400 mb-4">
              Переписать весь код с нуля! Вы потеряете все строки кода, генераторы и апгрейды, 
              но получите постоянный множитель ко всему производству.
            </p>
            <div className="bg-gray-900 rounded-lg p-4 mb-4">
              <div className="text-sm text-gray-400">Текущий множитель:</div>
              <div className="text-2xl font-bold text-purple-300">x{state.prestigeMultiplier.toFixed(2)}</div>
              {state.totalLOC >= 1000000 && (
                <>
                  <div className="text-sm text-gray-400 mt-2">Новый множитель:</div>
                  <div className="text-2xl font-bold text-green-300">
                    x{(1 + Math.log10(state.totalLOC / 100000) * 0.5).toFixed(2)}
                  </div>
                </>
              )}
              {state.totalLOC < 1000000 && (
                <div className="text-xs text-red-400 mt-2">
                  Нужно минимум 1M LOC для рефакторинга (сейчас: {formatNumber(state.totalLOC)})
                </div>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={doPrestige}
                disabled={state.totalLOC < 1000000}
                className="flex-1 py-2 px-4 bg-purple-700 hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed 
                           text-white rounded-lg font-medium transition-colors"
              >
                Рефакторить!
              </button>
              <button
                onClick={() => setShowPrestige(false)}
                className="flex-1 py-2 px-4 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg font-medium transition-colors"
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CSS for floating animation */}
      <style>{`
        @keyframes floatUp {
          0% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-60px); }
        }
      `}</style>
    </div>
  );
}

export default App;
