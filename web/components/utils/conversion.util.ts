import { LAMPORTS_PER_SOL } from '@solana/web3.js';

export const lamportsToSol = (value: number) => {
    return Math.round((value / LAMPORTS_PER_SOL) * 100000) / 100000;
}

export const solToLamports = (value: number) => {
    return Math.round(value * LAMPORTS_PER_SOL);
}