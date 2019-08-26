// Date format: yyyymmddHHMMss
export function getLastUpdatedTime(date = new Date()): string {
  const withZero = (n: number): string => `0${n}`.slice(-2);

  const rest = [
    date.getMonth() + 1,
    date.getDate(),
    date.getHours(),
    date.getMinutes(),
    date.getSeconds()
  ].map((n): string => withZero(n));

  return [date.getFullYear(), ...rest].join('');
}
