export function getExperienceYears(hireDate: string) {
  if (!hireDate) return 0;

  const start = new Date(hireDate);
  const now = new Date();

  let years = now.getFullYear() - start.getFullYear();

  const month = now.getMonth() - start.getMonth();

  if (
    month < 0 ||
    (month === 0 && now.getDate() < start.getDate())
  ) {
    years--;
  }

  return Math.max(0, years);
}
export function getExperienceBonus(hireDate: string) {
  const years = getExperienceYears(hireDate);

  if (years < 1) return 0;

  return 2000 + (years - 1) * 1000;
}