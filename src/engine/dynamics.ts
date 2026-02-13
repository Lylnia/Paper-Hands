// src/engine/dynamics.ts
import { ConfigParams, ProjectState, MarketState } from './types';
import { calculateScaledRisk } from './math';

export function updateTrust(
    project: ProjectState,
    market: MarketState,
    vp: number,
    config: ConfigParams
): { ct: number; it: number } {

    // CT Dynamics
    // Gain: stability + transparency + revenue
    // Loss: VP + news + teamSell + delist

    // Simplified stability score based on Volatility Pressure
    const stabilityScore = Math.max(0, 1 - vp);

    const gainCT =
        config.trustRecoveryRates.ct.stability * stabilityScore +
        config.trustRecoveryRates.ct.transparency * (project.flags.isRugged ? 0 : 0.05) +
        config.trustRecoveryRates.ct.revenue * (project.revenue.staking.unlocked ? 0.02 : 0);

    const lossCT =
        config.trustDecayRates.ct.vp * vp * 2.0 +
        config.trustDecayRates.ct.newsNeg * (market.leadingIndicators.newsSentiment < -0.5 ? 0.5 : 0);
    // Team sell and delist shocks are applied as discrete events, not continuous decay here

    let nextCT = project.communityTrustCT + gainCT - lossCT;
    nextCT = Math.max(0, Math.min(100, nextCT));

    // IT Dynamics
    // Gain: stability + locked + clean volume
    // Loss: VP + Risk + detection + regulation

    const gainIT =
        config.trustRecoveryRates.it.stability * stabilityScore +
        config.trustRecoveryRates.it.locked * project.liquidityLockedPct +
        config.trustRecoveryRates.it.cleanVolume * (1 - project.rolling.fakeShare);

    // R_scaled is expensive to compute, maybe pass it in? For now recompute.
    const r_scaled = calculateScaledRisk(project.riskR, project.marketCapMC, project.visibilityVIS);

    const lossIT =
        config.trustDecayRates.it.vp * vp +
        config.trustDecayRates.it.risk * (r_scaled / 1000) + // Risk hurts IT slowly
        config.trustDecayRates.it.regulator * (project.regulationStage !== 'normal' ? 0.5 : 0);

    let nextIT = project.institutionalTrustIT + gainIT - lossIT;
    nextIT = Math.max(0, Math.min(100, nextIT));

    return { ct: nextCT, it: nextIT };
}

export function updateRisk(
    project: ProjectState,
    market: MarketState,
    vp: number,
    config: ConfigParams
): number {
    // R(t+1) = clamp( R + riskUp - riskDown, 0, 100 )

    const vis = project.visibilityVIS;
    const isBear = market.msi < -0.3;

    // Risk Up factors (continuous)
    const bearFactor = isBear ? config.riskBaseRates.bear : 0;
    const volFactor = config.riskBaseRates.volatility * vp;
    const teamSellFactor = config.riskBaseRates.teamSell * (project.cooldowns['team_sell'] > 0 ? 1 : 0); // If selling constantly

    const riskUp = bearFactor + volFactor + teamSellFactor;

    // Risk Down (decay)
    // Slower when VIS is high, slower when regulator watching
    const regulatorFactor = project.regulationStage !== 'normal' ? 0.3 : 0;
    const visDamping = 0.5 * (vis / 100);

    const riskDown = config.riskBaseRates.decay * (1 - visDamping) * (1 - regulatorFactor);

    let nextR = project.riskR + riskUp - riskDown;
    return Math.max(0, Math.min(100, nextR));
}
