// src/engine/loop.ts
import { ActionType, ConfigParams, GameAction, GameState, ProjectState, MarketState } from './types';
import { RNG } from './rng';
import { calculateNetFlow, updatePrice, calculateEffectiveLiquidity, calculateVolatilityPressure, updateRollingMetrics, calculateScaledRisk } from './math';
import { updateTrust, updateRisk } from './dynamics';

export function step(
    state: GameState,
    actions: GameAction[]
): GameState {
    // Clone state effectively (simple JSON parse/stringify for now, or spread)
    // In a real worker loop we might optimize this, but for clarity:
    const nextProject = { ...state.project, rolling: { ...state.project.rolling }, flags: { ...state.project.flags }, cooldowns: { ...state.project.cooldowns } };
    const nextMarket = { ...state.market };
    const nextLog = [...state.log];
    const rng = new RNG(state.rngState);

    // 1. Process Actions
    let actionNetFlow = 0;
    let actionCost = 0;
    let riskJump = 0;

    for (const action of actions) {
        // Basic handler
        switch (action.type) {
            case 'team_sell':
                // Sell 1% of team tokens
                const sellAmount = nextProject.teamTokensRemaining * 0.01;
                nextProject.teamTokensRemaining -= sellAmount;
                // Selling adds supply to circulation (if not already)
                // Actually, typically team tokens are locked. If unlocked, they enter circ.
                nextProject.s_circ += sellAmount;

                // Creates sell pressure
                actionNetFlow -= (sellAmount * nextProject.priceP);

                // Adds Risk
                riskJump += 5;

                nextLog.push({
                    id: crypto.randomUUID(),
                    tick: nextProject.tick,
                    type: 'warning',
                    title: 'Team Sell',
                    detail: `Sold ${sellAmount.toFixed(0)} tokens.`
                });
                break;

            case 'wash_trade':
                // Spend treasury to boost volume
                const cost = 1000;
                if (nextProject.treasuryUSD >= cost) {
                    nextProject.treasuryUSD -= cost;
                    nextProject.volumeV += cost * 5; // Fake volume multiplier
                    nextProject.rolling.fakeShare = Math.min(1, nextProject.rolling.fakeShare + 0.1);
                    riskJump += 2; // accumulating risk
                }
                break;
        }
    }

    // 2. Core Physics
    const l_eff = calculateEffectiveLiquidity(nextProject.liquidityL, nextProject.institutionalTrustIT, nextProject.liquidityLockedPct, 1.0);

    const { netFlow: organicNetFlow, organicVolume } = calculateNetFlow(nextProject, nextMarket, rng, state.config);

    const totalNetFlow = organicNetFlow + actionNetFlow;

    // Update Price
    const previousPrice = nextProject.priceP;
    const newPrice = updatePrice(previousPrice, totalNetFlow, l_eff, nextProject, nextMarket, rng, state.config);
    nextProject.priceP = newPrice;
    nextProject.marketCapMC = newPrice * nextProject.s_circ;

    // Update Volume (simplified decay toward organic)
    nextProject.volumeV = nextProject.volumeV * 0.9 + organicVolume * 0.1;

    // 3. Dynamics
    const returnPct = (newPrice - previousPrice) / previousPrice;
    nextProject.rolling = updateRollingMetrics(nextProject.rolling, returnPct, nextProject.volumeV, nextProject.tick, state.config);
    const vp = calculateVolatilityPressure(nextProject, nextMarket, state.config);

    // Trust
    const { ct, it } = updateTrust(nextProject, nextMarket, vp, state.config);
    nextProject.communityTrustCT = ct;
    nextProject.institutionalTrustIT = it;

    // Risk
    const currentRisk = updateRisk(nextProject, nextMarket, vp, state.config);
    nextProject.riskR = Math.min(100, currentRisk + riskJump);

    // Visibility (derived)
    // VIS = log(Volume) + log(MC) basically
    nextProject.visibilityVIS = Math.min(100, (Math.log10(nextProject.volumeV + 1) * 10) + (Math.log10(nextProject.marketCapMC + 1) * 5)) / 2;

    // 4. Events / Triggers
    // Check for Ranking #1
    // (Placeholder)

    // Delisting Check (if risk too high)
    if (nextProject.riskR > 90 && !nextProject.flags.isDelistedEverywhere) {
        // Trigger warning or delist
    }

    // 5. Cleanup
    nextProject.tick += 1;
    const nextRngState = rng.getState();

    return {
        project: nextProject,
        market: nextMarket,
        log: nextLog.slice(-50), // Keep last 50 logs
        config: state.config,
        rngState: nextRngState
    };
}
