// src/App.tsx
import { useEffect } from 'react';
import { useStore } from './store';
import { Dashboard } from './ui/Dashboard';

function App() {
    const { initGame, startGame, stopGame, isRunning, gameState } = useStore();

    useEffect(() => {
        initGame();
    }, []);

    return (
        <div className="min-h-screen bg-background text-white font-sans p-4">
            <header className="flex justify-between items-center mb-6 border-b border-muted pb-4">
                <h1 className="text-2xl font-bold tracking-tight text-white">PAPER HANDS <span className="text-xs font-normal text-muted">v0.1</span></h1>

                <div className="flex gap-4">
                    <div className="flex items-center gap-2">
                        <span className={`w-3 h-3 rounded-full ${isRunning ? 'bg-success animate-pulse' : 'bg-danger'}`}></span>
                        <span className="text-sm text-muted">{isRunning ? 'LIVE' : 'PAUSED'}</span>
                    </div>

                    <button
                        onClick={isRunning ? stopGame : startGame}
                        className={`px-4 py-1 rounded text-sm font-medium ${isRunning ? 'bg-danger/20 text-danger hover:bg-danger/30' : 'bg-success/20 text-success hover:bg-success/30'}`}
                    >
                        {isRunning ? 'PAUSE' : 'RESUME'}
                    </button>
                </div>
            </header>

            {!gameState ? (
                <div className="flex justify-center items-center h-[50vh]">
                    <p className="text-muted animate-pulse">Initializing Engine...</p>
                </div>
            ) : (
                <main>
                    <Dashboard state={gameState} />
                </main>
            )}
        </div>
    );
}

export default App;
