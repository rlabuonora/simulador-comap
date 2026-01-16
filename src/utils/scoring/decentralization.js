import { clamp } from './helpers.js';

export const DEPARTMENT_SCORES = {
  artigas: 10,
  treintaYTres: 10,
  cerroLargo: 9,
  rioNegro: 9,
  tacuarembo: 8,
  salto: 8,
  paysandu: 8,
  rivera: 7,
  rocha: 6,
  soriano: 6,
  lavalleja: 5,
  sanJose: 5,
  canelones: 4,
  florida: 4,
  durazno: 3,
  maldonado: 3,
  colonia: 2,
  flores: 2,
  montevideo: 0,
};

export function scoreDecentralization({ deptAllocations = [], investment = 0 }) {
  const totalAllocation = deptAllocations.reduce((sum, item) => sum + (item.amount ?? 0), 0);
  const totalInvestment = investment > 0 ? investment : totalAllocation;

  if (!totalInvestment) {
    return 0;
  }

  const weightedScore = deptAllocations.reduce((sum, item) => {
    const deptScore = DEPARTMENT_SCORES[item.id] ?? 0;
    return sum + (item.amount / totalInvestment) * deptScore;
  }, 0);

  return clamp(weightedScore, 0, 10);
}
