// src/engine/math.ts
import { ProjectState, MarketState, ConfigParams } from './types';
import { RNG } from './rng';

/**
 * Calculates the Net Flow (Buy Pressure - Sell Pressure)
 */
export function calculateNetFlow(
    project: ProjectState,
    market: MarketState,
    rng: RNG
): number {
    // Base organic interest depends on Trust and Market Sentiment
    const sentimentScore = (market.globalMarketSentiment + project.communityTrust) / 200; // 0..1

    // Bull/Bear multiplier
    const regimeMult = market.regime === 'bull' ? 1.5 : (market.regime === 'bear' ? 0.5 : 1.0);

    // Random fluctuation
    const noise = rng.gaussian(0, 0.1);

    // Buy Pressure
    const baseDemand = 1000 * sentimentScore * regimeMult * (1 + noise);

    // Sell Pressure (Profit taking increases as price goes up, Panic selling as trust goes down)
    const profitTaking = Math.max(0, (project.price - 0.1) * 100); // Placeholder baseline
    const panicSelling = (100 - project.communityTrust) * 20;

    return baseDemand + project.volume.fake - profitTaking - panicSelling;
}

/**
 * Updates Price based on Net Flow and Liquidity (Slippage)
 */
export function updatePrice(
    currentPrice: number,
    netFlow: number,
    liquidity: number,
    config: ConfigParams
): number {
    // Slippage model: Lower liquidity = Higher impact
    const slippage = 1 / Math.max(liquidity, 1000);
    const percentChange = netFlow * slippage * config.priceSensitivity;

    // Apply change
    let newPrice = currentPrice * (1 + percentChange);

    // Sanity clamp
    return Math.max(0.0000001, newPrice);
}

/**
 * Updates Risk Bar based on activity
 */
export function updateRisk(
    project: ProjectState,
    config: ConfigParams
): number {
    let risk = project.risk;

    // 1. Fake Volume Risk
    if (project.volume.total > 0) {
        const fakeRatio = project.volume.fake / project.volume.total;
        // If > 50% fake, risk spikes fast
        risk += fakeRatio * 2.0;
    }

    // 2. Team Sell Cooldown Risk (if recently sold)
    // (Logic handled in action handler usually, but passive decay here)

    // Passive Decay (if no bad actions)
    risk -= config.risk.decayRate;

    return Math.max(0, Math.min(100, risk));
}

/**
 * Updates Trust (Community & Institutional)
 */
export function updateTrust(
    project: ProjectState,
    priceChangePct: number,
    config: ConfigParams
): { ct: number; it: number } {
    let { communityTrust: ct, institutionalTrust: it } = project;

    // CT Logic
    if (priceChangePct > 0) ct += config.trust.recoverRate;
    else ct -= config.trust.decayOnSell * Math.abs(priceChangePct * 10);

    // IT Logic
    // Institutions love liquidity and stability
    if (project.liquidity.amount > 100000) it += 0.05;
    if (project.flags.isSECInvestigated) it -= 1.0; // Heavy penalty

    return {
        ct: Math.max(0, Math.min(100, ct)),
        it: Math.max(0, Math.min(100, it))
    };
}
