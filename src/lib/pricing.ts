// Single source of truth for Walk pricing, straight from the printed flyer:
//   $30 per adult (age 12 & over), $15 per child (under 12),
//   +$5 if the tee shirt is to be shipped ("I'm sleeping in" / mail option),
//   plus any optional additional donation.
export const ADULT_FEE = 30;
export const CHILD_FEE = 15;
export const SHIP_TEE_FEE = 5;

export type RegistrationInput = {
  numAdults: number;
  numChildren: number;
  shipTee: boolean;
  donation: number;
};

export function computeTotal(input: RegistrationInput): number {
  const adults = Math.max(0, Math.floor(input.numAdults || 0));
  const children = Math.max(0, Math.floor(input.numChildren || 0));
  const donation = Math.max(0, Number(input.donation) || 0);
  const ship = input.shipTee ? SHIP_TEE_FEE : 0;
  const total = adults * ADULT_FEE + children * CHILD_FEE + ship + donation;
  return Math.round(total * 100) / 100;
}

export const money = (n: number) =>
  "$" + Number(n || 0).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 });
