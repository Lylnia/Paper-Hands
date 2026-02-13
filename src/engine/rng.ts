// src/engine/rng.ts

// Mulberry32 is a fast, high-quality PRNG that is easy to implement.
export class RNG {
    private state: number;

    constructor(seed: number) {
        this.state = seed;
    }

    // Returns a float between 0 and 1
    next(): number {
        let t = (this.state += 0x6d2b79f5);
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    }

    // Returns an integer between min (inclusive) and max (exclusive)
    nextInt(min: number, max: number): number {
        return Math.floor(this.next() * (max - min) + min);
    }

    // Returns a boolean with probability p of being true
    nextBool(p: number = 0.5): boolean {
        return this.next() < p;
    }

    // Standard Normal distribution (Box-Muller transform)
    nextGaussian(mean: number = 0, std: number = 1): number {
        let u = 0, v = 0;
        while (u === 0) u = this.next(); // Converting [0,1) to (0,1)
        while (v === 0) v = this.next();
        const num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
        return num * std + mean;
    }

    // Pick a random element from an array
    pick<T>(array: T[]): T {
        return array[this.nextInt(0, array.length)];
    }

    getState(): number {
        return this.state;
    }

    setState(state: number) {
        this.state = state;
    }
}
