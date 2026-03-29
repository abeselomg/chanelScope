export function formatNumber(num: number | string | undefined): string {
  if (num === undefined || num === null) return "0";
  const n = typeof num === 'string' ? parseInt(num, 10) : num;
  if (isNaN(n)) return "0";
  
  if (n >= 1000000) return (n / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  return n.toLocaleString();
}

export function isWithinDate(dateStr: string, filterConfig: string): boolean {
  if (filterConfig === "All Time") return true;
  const published = new Date(dateStr);
  const now = new Date();

  if (filterConfig === "This Week") {
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    return published >= sevenDaysAgo;
  }
  if (filterConfig === "This Month") {
    return (
      published.getMonth() === now.getMonth() &&
      published.getFullYear() === now.getFullYear()
    );
  }
  if (filterConfig === "Last 90 Days") {
    const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    return published >= ninetyDaysAgo;
  }
  if (filterConfig === "This Year") {
    return published.getFullYear() === now.getFullYear();
  }
  return true;
}
