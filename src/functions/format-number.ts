export const formatNumber = (num: number): string => {
  const formatter = Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  });

  return formatter.format(num);
};
