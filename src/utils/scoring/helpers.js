export const clamp = (value, min = 0, max = 10) => Math.min(Math.max(value, min), max);

export const parseNumber = (value) => {
  const raw = String(value ?? '').trim();
  if (!raw) {
    return 0;
  }

  const normalized = raw.replace(/\s/g, '');
  const lastComma = normalized.lastIndexOf(',');
  const lastDot = normalized.lastIndexOf('.');
  const decimalIndex = Math.max(lastComma, lastDot);

  let numberString = normalized;
  if (decimalIndex >= 0) {
    const integerPart = normalized.slice(0, decimalIndex).replace(/[.,]/g, '');
    const decimalPart = normalized.slice(decimalIndex + 1).replace(/[.,]/g, '');
    numberString = `${integerPart}.${decimalPart}`;
  } else {
    numberString = normalized.replace(/[.,]/g, '');
  }

  if (lastComma === -1 && lastDot > -1 && normalized.match(/\.\d{3}$/)) {
    numberString = normalized.replace(/[.,]/g, '');
  }

  const parsed = Number(numberString);
  return Number.isNaN(parsed) ? 0 : parsed;
};

export const calcInvestmentPct = (amount, investment) => {
  if (!investment) {
    return 0;
  }
  return (amount / investment) * 100;
};

export const isIsoDate = (value) => /^\d{4}-\d{2}-\d{2}$/.test(value);

export const isOnOrBefore = (dateValue, cutoff) => {
  if (!isIsoDate(dateValue)) {
    return false;
  }
  return dateValue <= cutoff;
};
