// src/store.ts
import { create } from 'zustand';
import { GameState, GameAction, ScenarioType } from './engine/types';

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

    init(scenario: ScenarioType) {
        this.worker.postMessage({ type: 'INIT', payload: { scenario } });
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
}

interface AppStore {
    gameState: GameState | null;
    isRunning: boolean;

    initGame: (scenario: ScenarioType) => void;
    startGame: () => void;
    stopGame: () => void;
    dispatchAction: (action: GameAction) => void;

    simWorker: SimWorker | null;
}

export const useStore = create<AppStore>((set, get) => ({
    gameState: null,
    isRunning: false,
    simWorker: null,

    initGame: (scenario) => {
        let worker = get().simWorker;
        if (!worker) {
            worker = new SimWorker((newState) => {
                set({ gameState: newState });
            });
            set({ simWorker: worker });
        }
        worker!.init(scenario);
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
