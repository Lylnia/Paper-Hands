// src/engine/data.ts
import { ConfigParams, ProjectState, MarketState, ScenarioType, Competitor } from './types';

export const DEFAULT_CONFIG: ConfigParams = {
    tickSecondsReal: 0.5,
    priceSensitivity: 0.05,
    volatilityBase: 0.02,

    risk: {
        warning: 50,
        danger: 75,
        critical: 90,
        decayRate: 0.05,
    },

    trust: {
        decayOnSell: 5.0, // CT loss per 1% drop
        decayOnFakeVol: 2.0,
        decayOnBear: 0.1, // Passive decay in bear market
        recoverRate: 0.1, // Passive gain in bull/green
    },

    regulation: {
        detectionChanceBase: 0.01,
        fineAmount: 5000,
    }
};

const BASE_PROJECT: ProjectState = {
    id: 'p1',
    name: 'Paper Coin',
    ticker: 'PPR',
    scenario: 'new_chain',
    tick: 0,

    marketCap: 0,
    price: 0,
    volume: { real: 0, fake: 0, total: 0, history: [] },
    liquidity: { amount: 0, locked: false, lockDuration: 0 },

    communityTrust: 50,
    institutionalTrust: 50,
    risk: 0,

    supply: { max: 100_000_000, circulating: 0, team: 0 },
    treasury: 25_000,

    flags: { isDelisted: false, isSECInvestigated: false, isRugged: false },
    cooldowns: {}
};

const MOCK_COMPETITORS: Competitor[] = [
    { id: 'c1', name: 'Solana', rank: 5, marketCap: 60_000_000_000, priceChange24h: 2.5 },
    { id: 'c2', name: 'Cardano', rank: 10, marketCap: 15_000_000_000, priceChange24h: -1.2 },
    { id: 'c3', name: 'Pepe', rank: 40, marketCap: 3_000_000_000, priceChange24h: 15.0 },
    { id: 'c4', name: 'SafeMoon', rank: 900, marketCap: 10_000_000, priceChange24h: -5.0 },
];

export function createScenario(type: ScenarioType, _seed: number): { project: ProjectState, market: MarketState } {
    const project = JSON.parse(JSON.stringify(BASE_PROJECT)); // Deep clone
    project.scenario = type;

    // Scenario Specifics
    if (type === 'new_chain') {
        project.name = "New Layer 1";
        project.ticker = "L1";
        project.supply.max = 1_000_000_000;
        project.supply.circulating = 50_000_000;
        project.supply.team = 200_000_000;
        project.price = 0.50;
        project.liquidity.amount = 50_000;
        project.risk = 20; // High initial risk
    } else if (type === 'existing_token') {
        project.name = "Utility Token";
        project.ticker = "UTIL";
        project.supply.max = 100_000_000;
        project.supply.circulating = 80_000_000;
        project.supply.team = 10_000_000;
        project.price = 0.05;
        project.liquidity.amount = 200_000;
        project.liquidity.locked = true;
        project.institutionalTrust = 60;
    } else if (type === 'dead_project') {
        project.name = "Lazarus DAO";
        project.ticker = "RIP";
        project.supply.max = 10_000_000;
        project.supply.circulating = 9_000_000;
        project.supply.team = 0; // Community owned
        project.treasury = 50_000; // Found in old wallet
        project.price = 0.01;
        project.liquidity.amount = 5_000;
        project.communityTrust = 10;
        project.institutionalTrust = 5;
        project.risk = 40;
    }

    // Calc derived
    project.marketCap = project.price * project.supply.circulating;

    const market: MarketState = {
        regime: 'crab',
        regimeDuration: 0,
        globalMarketSentiment: 50,
        competitors: MOCK_COMPETITORS
    };

    return { project, market };
}
