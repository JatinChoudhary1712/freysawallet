// services/actions/getGameState.ts

export interface TGameState {
    isActive: boolean;
    currentRound: number;
    prizePool: number;
  }
  
  export async function getGameState(): Promise<TGameState> {
    // Dummy implementation: replace with your actual game state logic.
    return {
      isActive: true,
      currentRound: 1,
      prizePool: 1000, // example value; update as needed
    };
  }
  