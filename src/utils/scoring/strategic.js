import { clamp } from './helpers.js';

export function scoreStrategic({ strategicPriorities }) {
  return clamp(strategicPriorities * 3.5);
}
