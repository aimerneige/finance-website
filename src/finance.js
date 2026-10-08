export const compound = (principal, rate, years, frequency = 12) => principal * (1 + rate / frequency) ** (years * frequency);
export function savingsMonths(initial, deposit, annualRate, target) {
  if (target <= initial) return 0;
  if (deposit === 0 && (annualRate === 0 || initial === 0)) return Infinity;
  const rate = annualRate / 12;
  const months = rate === 0 ? (target - initial) / deposit : Math.log((target + deposit / rate) / (initial + deposit / rate)) / Math.log1p(rate);
  return Math.ceil(months - 1e-10);
}
export function mortgage(principal, annualRate, years, method = 'annuity') {
  const months = years * 12;
  const rate = annualRate / 12;
  const payment = rate === 0 ? principal / months : principal * rate / -Math.expm1(-months * Math.log1p(rate));
  const rows = [];
  let remaining = principal;
  for (let month = 1; month <= months; month++) {
    const interest = remaining * rate;
    const capital = method === 'equal' ? principal / months : Math.min(remaining, payment - interest);
    remaining = Math.max(0, remaining - capital);
    rows.push({ month, payment: capital + interest, interest, capital, remaining });
  }
  return { rows, total: rows.reduce((sum, row) => sum + row.payment, 0), payment: rows[0].payment };
}
export const presentValue = (future, rate, years) => future / (1 + rate) ** years;
