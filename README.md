# Sphere Chess

A mobile-friendly chess game where you play against the computer, connect a Sphere Wallet, use UCT Testnet move credits, and view leaderboard and weekly-prize UI.

## Deploy from GitHub and Vercel without Terminal

1. Create a GitHub repository.
2. Upload **all files and folders inside this project**. Do not upload the ZIP itself.
3. Make sure `package.json` is in the repository root.
4. Open Vercel.
5. Add New → Project.
6. Import your GitHub repository.
7. Application Preset: **Vite**.
8. Root Directory: **./**.
9. Leave Environment Variables empty for now.
10. Deploy.

## Required project structure

```text
sphereChess/
├── README.md
├── index.html
├── package.json
├── vite.config.js
├── src/
│   ├── main.jsx
│   └── style.css
└── public/
    └── icon.svg
```

## Sphere Wallet

The browser connection uses the Sphere SDK `autoConnect`, the `testnet2` network, `identity:read` and `sign:request` permissions, and the Sphere web wallet.

## UCT move credits

- 5 UCT = 100 moves
- 10 UCT = 200 moves
- 15 UCT = 300 moves
- Every additional 1 UCT = 20 moves

Formula: **moves = UCT × 20**.

## Current scope

The frontend includes chess vs computer, difficulty selection, Sphere Wallet connection, UCT deposit/move-credit UI, leaderboard UI, weekly leaderboard UI, and the 50% weekly prize-pool display.

The current deposit button is a frontend/demo flow. Real UCT transfers, weekly deposit accounting, global persistent rankings, prize-pool custody, and automatic top-5 payouts require a secure backend and on-chain settlement. Sensitive transfer operations should be confirmed by the Sphere Wallet and unconfirmed outcomes should be reconciled rather than blindly resent.
