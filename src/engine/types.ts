// src/engine/types.ts

// --- Configuration ---
export interface ConfigParams {
    tickSecondsReal: number;

    // Market Physics
    priceSensitivity: number; // K factor
    volatilityBase: number;

    // Risk Thresholds
    risk: {
        warning: number; // 50
        danger: number; // 75
        critical: number; // 90
        decayRate: number;
    };

    // Trust Dynamics
    trust: {
        decayOnSell: number;
        decayOnFakeVol: number;
        decayOnBear: number;
        recoverRate: number;
    };

    // Regulation
    regulation: {
        detectionChanceBase: number; // 0.05
        fineAmount: number;
    };
}

// --- State ---

export type ScenarioType = 'new_chain' | 'existing_token' | 'dead_project';
export type MarketRegime = 'bull' | 'bear' | 'crab';

export interface ProjectState {
    // Identity
    id: string;
    name: string;
    ticker: string;
    scenario: ScenarioType;
    tick: number;

    // The 7 Core Metrics
    marketCap: number;      // Derived: Price * CircSupply
    price: number;          // Primary variable
    volume: {
        real: number;
        fake: number;
        total: number;        // real + fake
        history: number[];    // For charts
    };
    liquidity: {
        amount: number;       // USD value in LP
        locked: boolean;
        lockDuration: number; // ticks remaining
    };
    communityTrust: number; // 0-100 (CT)
    institutionalTrust: number; // 0-100 (IT)
    risk: number;           // 0-100 (R) - The "Heat" Meter

    // Resources
    supply: {
        max: number;
        circulating: number;
        team: number;         // Team allocation
    };
    treasury: number;       // USD

    // Status flags
    flags: {
        isDelisted: boolean;
        isSECInvestigated: boolean;
        isRugged: boolean;
    };

    // Cooldowns
    cooldowns: Record<string, number>;
}

export interface MarketState {
    regime: MarketRegime;
    regimeDuration: number; // How long in this regime
    globalMarketSentiment: number; // 0-100 (affects all crypto)
    competitors: Competitor[];
}

export interface Competitor {
    id: string;
    name: string;
    rank: number;
    marketCap: number;
    priceChange24h: number;
}

export interface GameState {
    project: ProjectState;
    market: MarketState;
    config: ConfigParams;
    log: LogEntry[];
    rngState: number; // Seed
}

export interface LogEntry {
    id: string;
    tick: number;
    type: 'info' | 'success' | 'warning' | 'danger';
    message: string;
}

// --- Actions ---

export type ActionType =
    | 'buy_marketing'
    | 'buy_fake_volume'
    | 'sell_team_tokens'
    | 'add_liquidity'
    | 'remove_liquidity'
    | 'launch_fud';

export interface GameAction {
    type: ActionType;
    payload?: any;
}
