export function classifyCompany(revenue, employees) {
  if (revenue > 75_000_000) {
    return 'GRAN EMPRESA';
  }
  if (employees <= 4 && revenue <= 2_000_000) {
    return 'MICRO';
  }
  if (employees <= 19 && revenue <= 10_000_000) {
    return 'PEQUEÑA';
  }
  if (employees <= 50 && revenue <= 75_000_000) {
    return 'MEDIANA';
  }
  return 'GRAN EMPRESA';
}
