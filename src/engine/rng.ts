// src/engine/rng.ts

export class RNG {
    private state: number;

    constructor(seed: number) {
        this.state = seed;
    }

    next(): number {
        let t = (this.state += 0x6d2b79f5);
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    }

    // Range [min, max)
    float(min: number, max: number): number {
        return min + this.next() * (max - min);
    }

    // Range [min, max)
    int(min: number, max: number): number {
        return Math.floor(this.float(min, max));
    }

    bool(chance: number = 0.5): boolean {
        return this.next() < chance;
    }

    // Standard Normal (Box-Muller)
    gaussian(mean: number = 0, std: number = 1): number {
        let u = 0, v = 0;
        while (u === 0) u = this.next();
        while (v === 0) v = this.next();
        const num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
        return num * std + mean;
    }

    getState(): number {
        return this.state;
    }
}
