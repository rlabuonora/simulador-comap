import { WEIGHTS } from '../constants.js';
import { clamp } from './helpers.js';

export function finalScore(scores) {
  const coreTotal = Object.keys(WEIGHTS).reduce((sum, key) => {
    if (key === 'decentralization') {
      return sum;
    }
    return sum + (scores[key] ?? 0) * WEIGHTS[key];
  }, 0);

  if (coreTotal < 1) {
    return 0;
  }

  const total = Object.keys(WEIGHTS).reduce((sum, key) => {
    return sum + (scores[key] ?? 0) * WEIGHTS[key];
  }, 0);

  return clamp(total, 0, 10);
}
