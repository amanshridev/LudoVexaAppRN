import { getTrackIndex } from './LudoEngine.js';
import { SAFE_INDICES, HOME_STEP } from './LudoConstants.js';

export function chooseBestTokenToMove(state, difficulty = 'medium') {
  const { movableTokenIds, currentTurn, diceValue, tokens, activePlayers } = state;
  if (!movableTokenIds || movableTokenIds.length === 0) return null;
  if (movableTokenIds.length === 1) return movableTokenIds[0];

  const playerTokens = tokens[currentTurn];
  const candidateTokens = playerTokens.filter((t) => movableTokenIds.includes(t.id));

  // Easy mode: 40% random move, 60% heuristic
  if (difficulty === 'easy' && Math.random() < 0.4) {
    const randomIdx = Math.floor(Math.random() * candidateTokens.length);
    return candidateTokens[randomIdx].id;
  }

  let bestToken = candidateTokens[0];
  let bestScore = -Infinity;

  candidateTokens.forEach((token) => {
    let score = 0;
    const currentStep = token.step;
    const nextStep = currentStep === -1 ? 0 : currentStep + diceValue;

    // 1. Releasing from base on a 6
    if (currentStep === -1 && diceValue === 6) {
      score += 60; // Strong desire to get pieces out
    }

    // 2. Finishing into Home
    if (nextStep === HOME_STEP) {
      score += 100; // Immediate victory step + extra turn
    } else if (nextStep > 50) {
      // Entering safe home corridor
      score += 45;
    }

    // 3. Capturing an opponent token
    if (nextStep >= 0 && nextStep <= 50) {
      const targetTrackIdx = getTrackIndex(currentTurn, nextStep);
      const isSafe = SAFE_INDICES.includes(targetTrackIdx);

      if (!isSafe) {
        let wouldCapture = false;
        activePlayers.forEach((opp) => {
          if (opp !== currentTurn) {
            tokens[opp].forEach((oppToken) => {
              if (oppToken.step >= 0 && oppToken.step <= 50) {
                const oppTrackIdx = getTrackIndex(opp, oppToken.step);
                if (oppTrackIdx === targetTrackIdx) {
                  wouldCapture = true;
                  score += 90; // High priority: knock out opponent & get extra roll
                }
              }
            });
          }
        });

        // 4. Moving into a safe star square
        if (isSafe) {
          score += 35;
        }

        // 5. Danger penalty: moving into square where opponents could capture us next turn
        // Check if any opponent is 1-6 steps behind our target square
        activePlayers.forEach((opp) => {
          if (opp !== currentTurn) {
            tokens[opp].forEach((oppToken) => {
              if (oppToken.step >= 0 && oppToken.step <= 50) {
                const oppTrackIdx = getTrackIndex(opp, oppToken.step);
                const distanceBehind = (targetTrackIdx - oppTrackIdx + 52) % 52;
                if (distanceBehind >= 1 && distanceBehind <= 6) {
                  score -= 20; // Potential danger square
                }
              }
            });
          }
        });
      } else {
        // Safe square bonus
        score += 30;
      }
    }

    // 6. Natural advancement preference (further along is usually better)
    score += nextStep * 0.5;

    // Add tiny random jitter to prevent deterministic loops
    score += Math.random() * 5;

    if (score > bestScore) {
      bestScore = score;
      bestToken = token;
    }
  });

  return bestToken ? bestToken.id : candidateTokens[0].id;
}
