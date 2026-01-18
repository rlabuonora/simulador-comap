export const INDICATORS = [
  { id: 'employment', label: 'Empleo', weight: 0.4, maxScore: 10 },
  { id: 'decentralization', label: 'Descentralización', weight: 0.1, maxScore: 10 },
  { id: 'exports', label: 'Exportaciones', weight: 0.15, maxScore: 10 },
  { id: 'sustainability', label: 'Sostenibilidad', weight: 0.2, maxScore: 10 },
  { id: 'iPlus', label: 'Desarrollo I+', weight: 0.2, maxScore: 10 },
  { id: 'strategic', label: 'Prioridades estratégicas', weight: 0.25, maxScore: 10 },
];

export const WEIGHTS = INDICATORS.reduce((acc, item) => {
  acc[item.id] = item.weight;
  return acc;
}, {});
