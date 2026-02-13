// src/store.ts
import { create } from 'zustand';
import { GameState, GameAction } from './engine/types';
import { createScenario } from './data/scenarios';

// Worker Wrapper
class SimWorker {
    private worker: Worker;
    private onStateUpdate: (state: GameState) => void;

    constructor(onStateUpdate: (state: GameState) => void) {
        this.worker = new Worker(new URL('./workers/sim.worker.ts', import.meta.url), { type: 'module' });
        this.onStateUpdate = onStateUpdate;
        this.worker.onmessage = (e) => {
            if (e.data.type === 'STATE_UPDATE') {
                this.onStateUpdate(e.data.payload);
            }
        };
    }

    init(state?: GameState) {
        this.worker.postMessage({ type: 'INIT', payload: { state } });
    }

    start() {
        this.worker.postMessage({ type: 'START' });
    }

    stop() {
        this.worker.postMessage({ type: 'STOP' });
    }

    sendAction(action: GameAction) {
        this.worker.postMessage({ type: 'ACTION', payload: action });
    }

    terminate() {
        this.worker.terminate();
    }
}

interface AppStore {
    gameState: GameState | null;
    isRunning: boolean;

    // Actions
    initGame: (scenario?: 'new_chain' | 'existing_token' | 'dead_project') => void;
    startGame: () => void;
    stopGame: () => void;
    dispatchAction: (action: GameAction) => void;

    // Worker Reference
    simWorker: SimWorker | null;
}

export const useStore = create<AppStore>((set, get) => ({
    gameState: null,
    isRunning: false,
    simWorker: null,

    initGame: (scenarioType = 'new_chain') => {
        // Only init if not already
        let worker = get().simWorker;
        if (!worker) {
            worker = new SimWorker((newState) => {
                set({ gameState: newState });
            });
            set({ simWorker: worker });
        }

        // Create Initial State
        const initialState = createScenario(scenarioType, Date.now()); // Date.now() is fine for seed here

        worker!.init(initialState);
    },

    startGame: () => {
        const { simWorker } = get();
        if (simWorker) {
            simWorker.start();
            set({ isRunning: true });
        }
    },

    stopGame: () => {
        const { simWorker } = get();
        if (simWorker) {
            simWorker.stop();
            set({ isRunning: false });
        }
    },

    dispatchAction: (action: GameAction) => {
        const { simWorker } = get();
        if (simWorker) {
            simWorker.sendAction(action);
        }
    }
}));
