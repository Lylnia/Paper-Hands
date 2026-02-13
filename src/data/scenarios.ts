// src/data/scenarios.ts
import { GameState, ProjectState, MarketState, ConfigParams } from '../engine/types';

// Default Config
export const DEFAULT_CONFIG: ConfigParams = {
    tickSecondsReal: 0.5,
    priceK: 0.05,
    noiseSigma: 0.01,
    volatilityWindow: 20,
    liquidityImpactK: 0.5,
    slippageK: 0.1,

    trustDecayRates: {
        ct: { vp: 0.2, newsNeg: 5, teamSell: 10, delist: 15 },
        it: { vp: 0.1, risk: 0.1, detection: 10, regulator: 5 }
    },
    trustRecoveryRates: {
        ct: { stability: 0.1, transparency: 0.02, revenue: 0.05 },
        it: { stability: 0.1, locked: 0.05, cleanVolume: 0.1 }
    },

    riskBaseRates: {
        wash: 1.0,
        teamSell: 2.0,
        supply: 5.0,
        volatility: 0.1,
        bear: 0.05,
        decay: 0.05
    },
    riskMemoryDecay: 0.01,

    detectionParams: {
        baseSensitivity: 0.05,
        tierMultiplier: 1.5
    },

    exchangeTiers: {
        small: { listingReqIT: 20, listingReqL: 50000, volumeMultiplier: 1.5, visMultiplier: 1.2, delistThresholdIT: 10 },
        mid: { listingReqIT: 50, listingReqL: 250000, volumeMultiplier: 3.0, visMultiplier: 2.0, delistThresholdIT: 30 },
        major: { listingReqIT: 80, listingReqL: 1000000, volumeMultiplier: 8.0, visMultiplier: 5.0, delistThresholdIT: 60 }
    },

    rankingWeights: {
        mc: 0.5,
        trust: 0.2,
        liquidity: 0.1,
        volatility: 0.1,
        fakePenalty: 0.5,
        riskPenalty: 0.5
    },

    crisisThresholds: {
        liquidityDeath: 1000,
        trustCollapse: 10,
        riskExplosion: 90
    },

    winConditionTicks: 500
};

// Competitor Archetypes
const COMPETITORS = [
    { id: 'c1', name: 'SolanaKiller', archetype: 'aggressive' as const, budget: 100000, riskAppetite: 90, strategyWeights: { fud: 0.5, pump: 0.4, utility: 0.1 }, memory: { lastActionTick: 0, successRate: 0.5 }, mc: 50000000, trust: 60, rank: 2 },
    { id: 'c2', name: 'SafeMoon 3.0', archetype: 'scammer' as const, budget: 10000, riskAppetite: 100, strategyWeights: { fud: 0.1, pump: 0.9, utility: 0 }, memory: { lastActionTick: 0, successRate: 0.5 }, mc: 5000000, trust: 20, rank: 5 },
    { id: 'c3', name: 'CardanoClone', archetype: 'institutional' as const, budget: 500000, riskAppetite: 20, strategyWeights: { fud: 0.2, pump: 0.1, utility: 0.7 }, memory: { lastActionTick: 0, successRate: 0.5 }, mc: 150000000, trust: 85, rank: 1 },
    { id: 'c4', name: 'DogeWifHat', archetype: 'scammer' as const, budget: 5000, riskAppetite: 100, strategyWeights: { fud: 0.1, pump: 0.9, utility: 0 }, memory: { lastActionTick: 0, successRate: 0.5 }, mc: 2000000, trust: 30, rank: 8 },
    { id: 'c5', name: 'ZK-Rollup', archetype: 'institutional' as const, budget: 200000, riskAppetite: 30, strategyWeights: { fud: 0.3, pump: 0.2, utility: 0.5 }, memory: { lastActionTick: 0, successRate: 0.5 }, mc: 80000000, trust: 75, rank: 3 },
    { id: 'c6', name: 'BaseMemes', archetype: 'aggressive' as const, budget: 50000, riskAppetite: 80, strategyWeights: { fud: 0.4, pump: 0.5, utility: 0.1 }, memory: { lastActionTick: 0, successRate: 0.5 }, mc: 25000000, trust: 50, rank: 4 }
];

export function createScenario(type: 'new_chain' | 'existing_token' | 'dead_project', seed: number): GameState {

    const baseProject: ProjectState = {
        id: 'p1',
        name: 'Player Project',
        scenarioType: type,
        tick: 0,
        s_max: 100_000_000,
        s_circ: 10_000_000,
        teamAlloc: 20_000_000,
        teamTokensRemaining: 20_000_000,
        priceP: 0.10,
        marketCapMC: 1_000_000,
        volumeV: 10_000,
        liquidityL: 50_000,
        liquidityLockedPct: 0.2,
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
            volatility: 0.02,
            volumeStability: 0.9,
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
    };

    // Scenario Adjustments
    if (type === 'new_chain') {
        baseProject.name = "New Layer 1";
        baseProject.s_max = 1_000_000_000;
        baseProject.s_circ = 50_000_000;
        baseProject.priceP = 0.50;
        baseProject.marketCapMC = 25_000_000;
        baseProject.riskR = 20; // High initial risk due to new tech
    } else if (type === 'existing_token') {
        baseProject.name = "Utility Token";
        baseProject.s_max = 100_000_000; // Fixed
        baseProject.s_circ = 80_000_000;
        baseProject.priceP = 0.05;
        baseProject.marketCapMC = 4_000_000;
        baseProject.liquidityLockedPct = 0.5; // High locked
        baseProject.riskR = 5; // Low base risk
    } else if (type === 'dead_project') {
        baseProject.name = "Lazarus DAO";
        baseProject.s_max = 10_000_000; // Low supply
        baseProject.s_circ = 9_000_000;
        baseProject.priceP = 0.01;
        baseProject.marketCapMC = 90_000;
        baseProject.volumeV = 500; // Dead volume
        baseProject.communityTrustCT = 10;
        baseProject.institutionalTrustIT = 5;
        baseProject.riskR = 50; // High risk of total collapse
        baseProject.treasuryUSD = 5_000;
    }

    return {
        project: baseProject,
        market: {
            msi: 0.1,
            regime: 'neutral',
            regimeTimer: 0,
            globalLiquidityFactor: 1.0,
            leadingIndicators: { newsSentiment: 0, btcTrend: 0 },
            competitors: JSON.parse(JSON.stringify(COMPETITORS)) // clone
        },
        log: [],
        config: DEFAULT_CONFIG,
        rngState: seed
    };
}
