import { Revenue } from './definitions';

export const formatCurrency = (amount: number) => {
  return (amount / 100).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
  });
};

export function dateToDbTimestamp(date: Date) {
  const pad = (n: number, z = 2) => n.toString().padStart(z, "0");
  // Adjust for timezone offset
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60 * 1000);
  return `${localDate.getFullYear()}-${pad(localDate.getMonth()+1)}-${pad(localDate.getDate())} ` +
         `${pad(localDate.getHours())}:${pad(localDate.getMinutes())}:${pad(localDate.getSeconds())}.000000`;
}

export const generateYAxis = (revenue: Revenue[]) => {
  // Calculate what labels we need to display on the y-axis
  // based on highest record and in 1000s
  const yAxisLabels = [];
  const highestRecord = Math.max(...revenue.map((month) => month.revenue));
  const topLabel = Math.ceil(highestRecord / 1000) * 1000;

  for (let i = topLabel; i >= 0; i -= 1000) {
    yAxisLabels.push(`$${i / 1000}K`);
  }

  return { yAxisLabels, topLabel };
};
