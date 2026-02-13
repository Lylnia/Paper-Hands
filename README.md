# PAPER HANDS 💎🙌

A production-ready, deterministic, tick-based crypto CEO simulation.

## 🚀 How to Run (Vercel Deployment)

Since you are deploying directly to cloud without local Node.js:

1.  **Push the Code**: Ensure all files in this directory are pushed to your GitHub repository.
2.  **Import to Vercel**:
    *   Go to Vercel.com -> Add New Project.
    *   Select your `Paper-Hands` repository.
3.  **Configure Build Settings**:
    *   Framework Preset: **Vite**
    *   Build Command: `npm run build`
    *   Output Directory: `dist`
4.  **Deploy**: Click Deploy.

## 🛠 Architecture

*   **Engine**: Pure TypeScript, runs in a Web Worker. No UI blocking.
*   **determinism**: Uses `Mulberry32` anchored to a seed. Same seed = exact same simulation run.
*   **State**: React + Zustand bridges the Worker state to the UI.
*   **Charts**: uPlot for high-performance rendering.

## 🎮 Gameplay

*   **Goal**: Reach Rank #1 on the leaderboard.
*   **Lose Conditions**: Trust drops to 0, Treasury runs out, or Risk explodes (regulator shutdown).
*   **Scenarios**:
    *   **New L1**: High potential, high risk.
    *   **Utility Token**: Stable, locked liquidity.
    *   **Lazarus DAO**: Dead project, try to revive it.

## ⚠️ Notes for Deployment

If you see errors about missing modules:
*   Ensure `package.json` dependencies are installed by the build server (Vercel does this automatically).
*   The `vite.config.ts` includes worker configuration for proper bundling.

Enjoy the simulation!
