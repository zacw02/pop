import { prisma } from "./prisma";
import { computeTotal } from "./pricing";
import type { RegistrationEmailData } from "./email";

export type AdditionalRegistrant = {
  type: "adult" | "child";
  firstName: string;
  lastName: string;
  shirtSize: string | null; // adults have a shirt size; children do not
};

// Normalized, server-validated registration payload.
export type ParsedRegistration = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  age: number | null;
  shirtSize: string;
  additionalRegistrants: AdditionalRegistrant[];
  isSurvivor: boolean;
  registrationType: "individual" | "join" | "start";
  teamName: string | null; // team to join, or new team name
  teamGoal: number;
  numAdults: number;
  numChildren: number;
  sleepingIn: boolean;
  shipTee: boolean;
  donation: number;
  mailingStreet: string | null;
  mailingCity: string | null;
  mailingState: string | null;
  mailingZip: string | null;
  total: number;
};

const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");
const optStr = (v: unknown) => {
  const s = str(v);
  return s.length ? s : null;
};
const num = (v: unknown, d = 0) => {
  const n = typeof v === "number" ? v : parseFloat(String(v));
  return Number.isFinite(n) ? n : d;
};
const bool = (v: unknown) => v === true || v === "true" || v === "on" || v === 1;

export class RegistrationError extends Error {}

export function parseRegistration(body: Record<string, unknown>): ParsedRegistration {
  const firstName = str(body.firstName);
  const lastName = str(body.lastName);
  const email = str(body.email);
  if (!firstName || !lastName) throw new RegistrationError("First and last name are required.");
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) throw new RegistrationError("A valid email is required.");

  let registrationType = str(body.registrationType) as ParsedRegistration["registrationType"];
  if (!["individual", "join", "start"].includes(registrationType)) registrationType = "individual";

  const numAdults = Math.max(1, Math.floor(num(body.numAdults, 1)));
  const numChildren = Math.max(0, Math.floor(num(body.numChildren, 0)));
  const shipTee = bool(body.shipTee) || bool(body.sleepingIn);
  const sleepingIn = bool(body.sleepingIn);
  const donation = Math.max(0, num(body.donation, 0));

  let teamName = optStr(body.teamName);
  if (registrationType === "start" && !teamName) teamName = `${firstName}'s Team`;
  if (registrationType === "join" && !teamName) {
    throw new RegistrationError("Please choose a team to join.");
  }

  const mailingStreet = optStr(body.mailingStreet);
  const mailingCity = optStr(body.mailingCity);
  const mailingState = optStr(body.mailingState);
  const mailingZip = optStr(body.mailingZip);

  // If the shirt is being mailed (ship option, or "sleeping in"), we MUST have a
  // full address to send it to.
  if (shipTee && !(mailingStreet && mailingCity && mailingState && mailingZip)) {
    throw new RegistrationError(
      "Please enter your full mailing address (street, city, state, and ZIP) so we can ship your t-shirt."
    );
  }

  // Names of everyone else covered by this registration. Adults carry a shirt
  // size; children are name-only. Every participant must have a name.
  const rawExtras = Array.isArray(body.additionalRegistrants) ? body.additionalRegistrants : [];
  const additionalRegistrants: AdditionalRegistrant[] = rawExtras.map((e) => {
    const rec = e && typeof e === "object" ? (e as Record<string, unknown>) : {};
    const type: "adult" | "child" = rec.type === "child" ? "child" : "adult";
    return {
      type,
      firstName: str(rec.firstName),
      lastName: str(rec.lastName),
      shirtSize: str(rec.shirtSize) || (type === "child" ? "S" : "L"),
    };
  });
  if (additionalRegistrants.some((r) => !r.firstName || !r.lastName)) {
    throw new RegistrationError("Please enter the first and last name of every participant.");
  }
  const gotAdults = additionalRegistrants.filter((r) => r.type === "adult").length;
  const gotChildren = additionalRegistrants.filter((r) => r.type === "child").length;
  if (gotAdults !== Math.max(0, numAdults - 1) || gotChildren !== numChildren) {
    throw new RegistrationError("Please enter the name of every adult and child in your group.");
  }

  const total = computeTotal({ numAdults, numChildren, shipTee, donation });

  return {
    firstName,
    lastName,
    email,
    phone: optStr(body.phone),
    age: body.age != null && str(body.age) !== "" ? Math.max(0, Math.floor(num(body.age, 0))) : null,
    shirtSize: str(body.shirtSize) || "L",
    additionalRegistrants,
    isSurvivor: bool(body.isSurvivor),
    registrationType,
    teamName,
    teamGoal: Math.max(0, num(body.teamGoal, 500)) || 500,
    numAdults,
    numChildren,
    sleepingIn,
    shipTee,
    donation,
    mailingStreet,
    mailingCity,
    mailingState,
    mailingZip,
    total,
  };
}

// Persists the registration, creating or joining a team as needed.
export async function persistRegistration(
  p: ParsedRegistration,
  payment: { paid: boolean; method: "paypal" | "event"; paypalOrderId?: string | null }
): Promise<RegistrationEmailData> {
  let teamId: string | null = null;
  let teamName: string | null = null;

  if (p.registrationType === "start" && p.teamName) {
    const existing = await prisma.team.findUnique({ where: { name: p.teamName } });
    if (existing) {
      throw new RegistrationError(
        `A team named "${p.teamName}" already exists. Pick a different name or join that team instead.`
      );
    }
    const team = await prisma.team.create({
      data: {
        name: p.teamName,
        captainName: `${p.firstName} ${p.lastName}`,
        captainPhone: p.phone,
        teamEmail: p.email,
        goal: p.teamGoal,
      },
    });
    teamId = team.id;
    teamName = team.name;
  } else if (p.registrationType === "join" && p.teamName) {
    const team = await prisma.team.findUnique({ where: { name: p.teamName } });
    if (!team) throw new RegistrationError(`Team "${p.teamName}" was not found.`);
    teamId = team.id;
    teamName = team.name;
  }

  await prisma.registration.create({
    data: {
      firstName: p.firstName,
      lastName: p.lastName,
      email: p.email,
      phone: p.phone,
      age: p.age,
      shirtSize: p.shirtSize,
      isSurvivor: p.isSurvivor,
      registrationType: p.registrationType,
      numAdults: p.numAdults,
      numChildren: p.numChildren,
      additionalRegistrants: p.additionalRegistrants.length ? p.additionalRegistrants : undefined,
      sleepingIn: p.sleepingIn,
      shipTee: p.shipTee,
      donation: p.donation,
      mailingStreet: p.mailingStreet,
      mailingCity: p.mailingCity,
      mailingState: p.mailingState,
      mailingZip: p.mailingZip,
      totalAmount: p.total,
      paid: payment.paid,
      paymentMethod: payment.method,
      paypalOrderId: payment.paypalOrderId ?? null,
      teamId,
    },
  });

  return {
    firstName: p.firstName,
    lastName: p.lastName,
    email: p.email,
    phone: p.phone,
    age: p.age,
    shirtSize: p.shirtSize,
    isSurvivor: p.isSurvivor,
    registrationType: p.registrationType,
    teamName,
    additionalRegistrants: p.additionalRegistrants,
    numAdults: p.numAdults,
    numChildren: p.numChildren,
    sleepingIn: p.sleepingIn,
    shipTee: p.shipTee,
    donation: p.donation,
    totalAmount: p.total,
    paid: payment.paid,
    paymentMethod: payment.method,
    mailing: {
      street: p.mailingStreet,
      city: p.mailingCity,
      state: p.mailingState,
      zip: p.mailingZip,
    },
  };
}
