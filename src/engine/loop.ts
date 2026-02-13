// src/engine/loop.ts
import { GameState, GameAction, LogEntry } from './types';
import { calculateNetFlow, updatePrice, updateRisk, updateTrust } from './math';
import { RNG } from './rng';

export function step(state: GameState, actions: GameAction[]): GameState {
    const { project, market, config } = state;
    const rng = new RNG(state.rngState);
    const log: LogEntry[] = [...state.log];

    // 1. Process Actions
    let actionVolume = 0;

    actions.forEach(action => {
        switch (action.type) {
            case 'buy_marketing':
                if (project.treasury >= 5000) {
                    project.treasury -= 5000;
                    project.communityTrust = Math.min(100, project.communityTrust + 5);
                    log.push({ id: crypto.randomUUID(), tick: project.tick, type: 'success', message: 'Marketing Campaign Launched' });
                }
                break;
            case 'buy_fake_volume':
                if (project.treasury >= 1000) {
                    project.treasury -= 1000;
                    project.volume.fake += 50_000; // Boost fake volume
                    log.push({ id: crypto.randomUUID(), tick: project.tick, type: 'warning', message: 'Bot Farm Activated' });
                }
                break;
            case 'sell_team_tokens':
                const sellAmount = project.supply.team * 0.01; // 1%
                if (sellAmount > 0) {
                    project.supply.team -= sellAmount;
                    project.supply.circulating += sellAmount;
                    project.treasury += sellAmount * project.price;
                    project.communityTrust -= 10; // Penalty
                    log.push({ id: crypto.randomUUID(), tick: project.tick, type: 'danger', message: 'Team Dump Executed' });
                }
                break;
        }
    });

    // 2. Market Physics
    const netFlow = calculateNetFlow(project, market, rng);
    const oldPrice = project.price;
    project.price = updatePrice(project.price, netFlow, project.liquidity.amount, config);
    const priceChangePct = (project.price - oldPrice) / oldPrice;

    project.marketCap = project.price * project.supply.circulating;

    // Volume Decay
    project.volume.fake *= 0.9; // Decay fake volume fast
    project.volume.real = (project.volume.real * 0.95) + (Math.abs(netFlow) * 0.1);
    project.volume.total = project.volume.real + project.volume.fake;
    project.volume.history = [...project.volume.history, project.volume.total].slice(-50);

    // 3. Trust & Risk
    const trustUpdates = updateTrust(project, market, priceChangePct, config);
    project.communityTrust = trustUpdates.ct;
    project.institutionalTrust = trustUpdates.it;

    // Risk update (now checks fake volume ratio inside)
    const riskChange = updateRisk(project, config);
    // We apply the change relative to current, math.ts returned absolute target?
    // Let's adjust math.ts or just set it:
    // Actually math.ts logic was: return NEW risk.
    project.risk = riskChange;

    // 4. Events / Regulation
    // SEC Investigation Check
    if (project.risk > 75 && !project.flags.isSECInvestigated) {
        if (rng.bool(0.01)) { // 1% chance per tick if risk is high
            project.flags.isSECInvestigated = true;
            log.push({ id: crypto.randomUUID(), tick: project.tick, type: 'danger', message: 'SEC Investigation Opened!' });
        }
    }

    // Delisting Check
    if (project.risk > 90) {
        if (rng.bool(0.05)) {
            project.flags.isDelisted = true;
            log.push({ id: crypto.randomUUID(), tick: project.tick, type: 'danger', message: 'CEX Delisting Notice!' });
        }
    }

    // 5. Cleanup
    project.tick++;
    state.rngState = rng.getState();
    state.log = log.slice(-20); // Keep last 20 logs

    return { ...state };
}
