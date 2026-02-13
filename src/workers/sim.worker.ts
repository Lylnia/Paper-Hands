// src/workers/sim.worker.ts
import { step } from '../engine/loop';
import { GameAction, GameState } from '../engine/types';
import { createScenario, DEFAULT_CONFIG } from '../engine/data';

const CTX: Worker = self as any;

let gameState: GameState | null = null;
let intervalId: number | null = null;
let actionQueue: GameAction[] = [];

CTX.onmessage = (e: MessageEvent) => {
    const { type, payload } = e.data;

    switch (type) {
        case 'INIT':
            const { project, market } = createScenario(payload?.scenario || 'new_chain', Date.now());
            gameState = {
                project,
                market,
                config: DEFAULT_CONFIG,
                log: [],
                rngState: Date.now()
            };
            CTX.postMessage({ type: 'STATE_UPDATE', payload: gameState });
            // Also send static config only once usually, but state has it now
            break;

        case 'START':
            if (!intervalId && gameState) {
                intervalId = setInterval(() => {
                    if (gameState) {
                        gameState = step(gameState, actionQueue);
                        actionQueue = [];
                        CTX.postMessage({ type: 'STATE_UPDATE', payload: gameState });
                    }
                }, (gameState.config.tickSecondsReal * 1000)) as unknown as number;
            }
            break;

        case 'STOP':
            if (intervalId) {
                clearInterval(intervalId);
                intervalId = null;
            }
            break;

        case 'ACTION':
            actionQueue.push(payload);
            break;
    }
};
