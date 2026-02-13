// src/engine/math.ts
import { ConfigParams, MarketState, ProjectState, RollingMetrics } from './types';
import { RNG } from './rng';

// 4.1 Base identities
export function calculateMarketCap(price: number, supplyCirc: number): number {
    return price * supplyCirc;
}

// 4.2 Liquidity-effective term
// L_eff = L * (1 + 0.01*IT) * (1 + 0.5*liquidityLockedPct) * exchangeTierMultiplier
export function calculateEffectiveLiquidity(
    liquidity: number,
    it: number,
    lockedPct: number,
    tierMultiplier: number
): number {
    return liquidity * (1 + 0.01 * it) * (1 + 0.5 * lockedPct) * tierMultiplier;
}

// 4.3 NetFlow per tick
// NetFlow = organicBuys + speculativeInflow - organicSells - teamSells - panicSells
export function calculateNetFlow(
    project: ProjectState,
    market: MarketState
): { netFlow: number; organicVolume: number; buyPressure: number } {

    // V_org = f(CT, IT, MSI, rankMomentum, volatility, recentReturns)
    // Simplified for MVP:
    const baseVolume = project.volumeV * 0.1; // Base turnover
    const sentiment = (project.communityTrustCT + project.institutionalTrustIT) / 200; // 0..1
    const msiFactor = (market.msi + 1) / 2; // 0..1

    // Volatility attracts volume, but scares away pure organic holders
    const volFactor = 1 + project.rolling.volatility * 5;

    const v_org = baseVolume * sentiment * msiFactor * volFactor;

    // buyShare = clamp(0.5 + s1*MSI + s2*rankMomentum - s3*volatility - s4*R_scaled, 0.05, 0.95)
    // config.priceK is used as a proxy for sensitivity here for now
    const r_scaled = calculateScaledRisk(project.riskR, project.marketCapMC, project.visibilityVIS);

    const s1 = 0.2;
    const s2 = 0.1;
    const s3 = 0.5;
    const s4 = 0.005;

    let buyShare = 0.5 +
        s1 * market.msi +
        s2 * project.rolling.rankMomentum -
        s3 * project.rolling.volatility -
        s4 * r_scaled;

    buyShare = Math.max(0.05, Math.min(0.95, buyShare));

    const organicBuys = v_org * buyShare;
    const organicSells = v_org * (1 - buyShare);

    // Speculative inflow (bull market bonus)
    const speculativeInflow = market.msi > 0 ? v_org * market.msi * 0.5 : 0;

    // Team sells & Panic sells would be added here based on actions/events
    // For now, we return the organic component base
    const netFlow = organicBuys + speculativeInflow - organicSells;

    return { netFlow, organicVolume: v_org, buyPressure: buyShare };
}

// 4.4 Price update
// P(t+1) = P(t) * exp( k * (NetFlow / max(L_eff, eps)) - drag(R_scaled, VIS) + noise(MSI, sigma) )
export function updatePrice(
    currentPrice: number,
    netFlow: number,
    l_eff: number,
    project: ProjectState,
    market: MarketState,
    rng: RNG,
    config: ConfigParams
): number {
    const eps = 1000; // Minimum liquidity to avoid division by zero
    const r_scaled = calculateScaledRisk(project.riskR, project.marketCapMC, project.visibilityVIS);

    // drag = d1*(R_scaled/100) + d2*VIS
    const d1 = 0.001;
    const d2 = 0.0001;
    const drag = d1 * (r_scaled / 100) + d2 * (project.visibilityVIS / 100);

    // noise = Normal(0, sigma*(1+abs(MSI))*volatilityMultiplier)
    const volMult = 1 + project.rolling.volatility;
    const noiseStd = config.noiseSigma * (1 + Math.abs(market.msi)) * volMult;
    const noise = rng.nextGaussian(0, noiseStd);

    const flowImpact = config.priceK * (netFlow / Math.max(l_eff, eps));

    const exponent = flowImpact - drag + noise;

    return currentPrice * Math.exp(exponent);
}

// 4.5 Volatility pressure (VP)
// VP = v1*abs(MSI) + v2*(1/sqrt(max(L_eff,eps))) + v3*(R_scaled/100) + v4*stdev(returnsWindow)
export function calculateVolatilityPressure(
    project: ProjectState,
    market: MarketState
): number {
    const r_scaled = calculateScaledRisk(project.riskR, project.marketCapMC, project.visibilityVIS);
    const l_eff = calculateEffectiveLiquidity(project.liquidityL, project.institutionalTrustIT, project.liquidityLockedPct, 1);
    const eps = 1000;

    const v1 = 0.05;
    const v2 = 1000; // Scale factor for inverse liquidity
    const v3 = 0.1;
    const v4 = 2.0;

    const vp =
        v1 * Math.abs(market.msi) +
        v2 * (1 / Math.sqrt(Math.max(l_eff, eps))) +
        v3 * (r_scaled / 100) +
        v4 * project.rolling.volatility;

    return vp;
}

// 4.7 Risk dynamics with scaling + memory
// R_scaled = R * log(1 + MC_norm) * (1 + VIS/100)
// MC_norm is MC / 1_000_000 (scaled to millions)
export function calculateScaledRisk(risk: number, mc: number, vis: number): number {
    const mc_norm = Math.max(0, mc / 1000000);
    // Log base 10 of (1 + mc in millions) ensures it grows slowly
    const sizeFactor = Math.log10(1 + mc_norm);

    // VIS is 0..100, we normalize to 1..2 multiplier
    const visFactor = 1 + (vis / 100);

    return risk * sizeFactor * visFactor;
}

// Helper to update rolling metrics
export function updateRollingMetrics(
    current: RollingMetrics,
    newReturn: number,
    config: ConfigParams
): RollingMetrics {
    // Simple exponential moving average for volatility
    const alpha = 0.1;
    const squaredReturn = newReturn * newReturn;
    const newVol = current.volatility * (1 - alpha) + Math.sqrt(squaredReturn) * alpha;

    // Update returns history (window)
    const windowSize = config.volatilityWindow;
    const newReturns = [newReturn, ...current.returns].slice(0, windowSize);

    return {
        ...current,
        returns: newReturns,
        volatility: newVol,
        // others would be updated similarly
    };
}
