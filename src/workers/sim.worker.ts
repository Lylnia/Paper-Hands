// src/workers/sim.worker.ts
import { step } from '../engine/loop';
import { GameAction, GameState } from '../engine/types';

const CTX: Worker = self as any;

let gameState: GameState | null = null;
let intervalId: number | null = null;
let actionQueue: GameAction[] = [];

// Default Initial State (Placeholder - will be replaced by Scenario Init)
const INITIAL_STATE: GameState = {
    project: {
        id: 'p1',
        name: 'Paper Coin',
        scenarioType: 'new_chain',
        tick: 0,
        s_max: 100_000_000,
        s_circ: 10_000_000,
        teamAlloc: 20_000_000,
        teamTokensRemaining: 20_000_000,
        priceP: 1.0,
        marketCapMC: 10_000_000,
        volumeV: 50_000,
        liquidityL: 500_000,
        liquidityLockedPct: 0.1,
        communityTrustCT: 50,
        institutionalTrustIT: 50,
        riskR: 10,
        visibilityVIS: 20,
        treasuryUSD: 25_000,
        revenue: {
            dex: { unlocked: true, level: 1, efficiency: 0.8, autoCollect: true },
            cex: { unlocked: false, level: 0, efficiency: 0, autoCollect: false },
            staking: { unlocked: false, level: 0, efficiency: 0, autoCollect: false },
            nft: { unlocked: false, level: 0, efficiency: 0, autoCollect: false },
            presale: { unlocked: false, level: 0, efficiency: 0, autoCollect: false }
        },
        exchanges: {},
        rolling: {
            returns: [],
            volatility: 0.05,
            volumeStability: 0.8,
            fakeShare: 0,
            rankMomentum: 0
        },
        cooldowns: {},
        flags: {
            isRugged: false,
            isDelistedEverywhere: false,
            hasWon: false,
            ticksAtNo1: 0
        },
        regulationStage: 'normal',
        regulationTimer: 0,
        riskMemory: 0
    },
    market: {
        msi: 0.2, // slightly bull
        regime: 'neutral',
        regimeTimer: 0,
        globalLiquidityFactor: 1.0,
        leadingIndicators: {
            newsSentiment: 0,
            btcTrend: 0
        },
        competitors: []
    },
    log: [],
    config: {
        tickSecondsReal: 1,
        priceK: 0.1,
        noiseSigma: 0.02,
        volatilityWindow: 20,
        liquidityImpactK: 0.5,
        slippageK: 0.1,
        trustDecayRates: {
            ct: { vp: 0.1, newsNeg: 2, teamSell: 5, delist: 10 },
            it: { vp: 0.1, risk: 0.05, detection: 5, regulator: 2 }
        },
        trustRecoveryRates: {
            ct: { stability: 0.1, transparency: 0.05, revenue: 0.02 },
            it: { stability: 0.1, locked: 0.05, cleanVolume: 0.1 }
        },
        riskBaseRates: {
            wash: 0.5,
            teamSell: 1.0,
            supply: 2.0,
            volatility: 0.05,
            bear: 0.1,
            decay: 0.05
        },
        riskMemoryDecay: 0.01,
        detectionParams: {
            baseSensitivity: 0.1,
            tierMultiplier: 1.5
        },
        exchangeTiers: {
            small: { listingReqIT: 20, listingReqL: 10000, volumeMultiplier: 1.2, visMultiplier: 1.1, delistThresholdIT: 10 },
            mid: { listingReqIT: 50, listingReqL: 100000, volumeMultiplier: 2.0, visMultiplier: 1.5, delistThresholdIT: 30 },
            major: { listingReqIT: 80, listingReqL: 1000000, volumeMultiplier: 5.0, visMultiplier: 3.0, delistThresholdIT: 60 }
        },
        rankingWeights: {
            mc: 0.4,
            trust: 0.3,
            liquidity: 0.1,
            volatility: 0.1,
            fakePenalty: 0.5,
            riskPenalty: 0.5
        },
        crisisThresholds: {
            liquidityDeath: 1000,
            trustCollapse: 5,
            riskExplosion: 95
        },
        winConditionTicks: 100
    },
    rngState: 123456 // Seed
};

CTX.onmessage = (e: MessageEvent) => {
    const { type, payload } = e.data;

    switch (type) {
        case 'INIT':
            // Ideally load scenario here
            gameState = payload?.state || INITIAL_STATE;
            if (payload?.seed) gameState!.rngState = payload.seed;
            CTX.postMessage({ type: 'STATE_UPDATE', payload: gameState });
            break;

        case 'START':
            if (!intervalId) {
                intervalId = setInterval(() => {
                    if (gameState) {
                        // Run Tick
                        gameState = step(gameState, actionQueue);
                        // Clear processed actions
                        actionQueue = [];
                        // Send update
                        CTX.postMessage({ type: 'STATE_UPDATE', payload: gameState });
                    }
                }, (gameState?.config.tickSecondsReal || 1) * 1000) as unknown as number;
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

        case 'EXPORT':
            CTX.postMessage({ type: 'EXPORT_DATA', payload: gameState });
            break;
    }
};
