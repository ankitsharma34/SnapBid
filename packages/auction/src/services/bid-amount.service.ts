const decimalScale = (value: string) => value.split(".")[1]?.length ?? 0;

const toScaledInteger = (value: string, scale: number) => {
  const [whole, fraction = ""] = value.split(".");
  return BigInt(`${whole}${fraction.padEnd(scale, "0")}`);
};

const fromScaledInteger = (value: bigint, scale: number) => {
  if (scale === 0) return value.toString();

  const sign = value < 0n ? "-" : "";
  const digits = value
    .toString()
    .replace("-", "")
    .padStart(scale + 1, "0");
  const whole = digits.slice(0, -scale);
  const fraction = digits.slice(-scale).replace(/0+$/, "");

  return fraction ? `${sign}${whole}.${fraction}` : `${sign}${whole}`;
};

export const calculateMinimumBid = (
  currentPrice: string,
  bidIncrement: string,
) => {
  const scale = Math.max(
    decimalScale(currentPrice),
    decimalScale(bidIncrement),
  );

  return fromScaledInteger(
    toScaledInteger(currentPrice, scale) + toScaledInteger(bidIncrement, scale),
    scale,
  );
};

export const meetsMinimumBid = (amount: string, minimumBid: string) => {
  const scale = Math.max(decimalScale(amount), decimalScale(minimumBid));

  return toScaledInteger(amount, scale) >= toScaledInteger(minimumBid, scale);
};
