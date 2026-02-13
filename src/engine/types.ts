// src/engine/types.ts

// --- Configuration ---

export interface ConfigParams {
    tickSecondsReal: number; // 0.1s to 1s
    priceK: number;
    noiseSigma: number;
    volatilityWindow: number;

    liquidityImpactK: number;
    slippageK: number;

    trustDecayRates: {
        ct: { vp: number; newsNeg: number; teamSell: number; delist: number };
        it: { vp: number; risk: number; detection: number; regulator: number };
    };
    trustRecoveryRates: {
        ct: { stability: number; transparency: number; revenue: number };
        it: { stability: number; locked: number; cleanVolume: number };
    };

    riskBaseRates: {
        wash: number;
        teamSell: number;
        supply: number;
        volatility: number;
        bear: number;
        decay: number;
    };
    riskMemoryDecay: number;

    detectionParams: {
        baseSensitivity: number;
        tierMultiplier: number;
    };

    exchangeTiers: {
        small: ExchangeTierConfig;
        mid: ExchangeTierConfig;
        major: ExchangeTierConfig;
    };

    rankingWeights: {
        mc: number;
        trust: number;
        liquidity: number;
        volatility: number;
        fakePenalty: number;
        riskPenalty: number;
    };

    crisisThresholds: {
        liquidityDeath: number;
        trustCollapse: number;
        riskExplosion: number;
    };

    winConditionTicks: number; // How many ticks at #1 to win
}

export interface ExchangeTierConfig {
    listingReqIT: number;
    listingReqL: number;
    volumeMultiplier: number;
    visMultiplier: number;
    delistThresholdIT: number;
}

// --- State ---

export type ScenarioType = 'new_chain' | 'existing_token' | 'dead_project';

// Revenue Streams
export interface RevenueStreamState {
    unlocked: boolean;
    level: number;
    efficiency: number; // 0..1
    autoCollect: boolean;
}

export interface ExchangeListingState {
    id: string;
    name: string;
    tier: 'dex' | 'small' | 'mid' | 'major';
    status: 'unlisted' | 'listed' | 'delisted' | 'blacklisted';
    warningPoints: number; // 0..100
    delistTimer: number; // Ticks remaining
}

export interface RollingMetrics {
    returns: number[]; // History of % returns
    volatility: number;
    volumeStability: number;
    fakeShare: number; // 0..1
    rankMomentum: number;
}

export interface CompetitorState {
    id: string;
    name: string;
    archetype: 'aggressive' | 'steady' | 'scammer' | 'institutional';
    budget: number;
    riskAppetite: number;
    strategyWeights: {
        fud: number;
        pump: number;
        utility: number;
    };
    memory: {
        lastActionTick: number;
        successRate: number;
    };
    // Simplified state for competitors (they don't run full physics, just effects)
    mc: number;
    trust: number;
    rank: number;
}

export interface ProjectState {
    // Identity
    id: string;
    name: string;
    scenarioType: ScenarioType;
    tick: number;

    // Tokenomics
    s_max: number;
    s_circ: number;
    teamAlloc: number;
    teamTokensRemaining: number;

    // Market
    priceP: number;
    marketCapMC: number;
    volumeV: number;
    liquidityL: number;
    liquidityLockedPct: number; // 0..1

    // Metrics
    communityTrustCT: number; // 0..100
    institutionalTrustIT: number; // 0..100
    riskR: number; // 0..100
    visibilityVIS: number; // 0..100 (derived often, but good to cache)

    // Resources
    treasuryUSD: number;

    // Systems
    revenue: {
        dex: RevenueStreamState;
        cex: RevenueStreamState;
        staking: RevenueStreamState;
        nft: RevenueStreamState;
        presale: RevenueStreamState;
    };

    exchanges: Record<string, ExchangeListingState>;

    rolling: RollingMetrics;

    cooldowns: Record<string, number>;

    // Flags
    flags: {
        isRugged: boolean;
        isDelistedEverywhere: boolean;
        hasWon: boolean;
        ticksAtNo1: number;
    };

    // State Machine logic (Risk/Regulation)
    regulationStage: 'normal' | 'watchlist' | 'investigation' | 'charges' | 'settlement';
    regulationTimer: number;

    riskMemory: number; // Accumulates over time with bad actions
}

export interface MarketState {
    msi: number; // -1 (bear) to 1 (bull)
    regime: 'bull' | 'bear' | 'neutral' | 'crab';
    regimeTimer: number;
    globalLiquidityFactor: number; // Multiplier
    leadingIndicators: {
        newsSentiment: number;
        btcTrend: number;
    };
    competitors: CompetitorState[];
}

export interface GameState {
    project: ProjectState;
    market: MarketState;
    log: EventLogEntry[];
    config: ConfigParams;
    rngState: number; // Current generic seed/state for specialized RNG
}

// --- Events ---

export interface EventLogEntry {
    id: string;
    tick: number;
    type: 'info' | 'warning' | 'crisis' | 'success' | 'news';
    title: string;
    detail: string;
    deltas?: Partial<ProjectState>; // Optional changes to show in UI
}

// --- Actions ---

export type ActionType =
    | 'buy_marketing'
    | 'wash_trade'
    | 'team_sell'
    | 'stake_tokens'
    | 'launch_nft'
    | 'upgrade_tech'
    | 'bribe_regulator'
    | 'apply_listing';

export interface GameAction {
    type: ActionType;
    payload?: any;
}
