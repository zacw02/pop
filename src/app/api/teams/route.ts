import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Leaderboard + live stats for the Walk section.
export async function GET() {
  try {
    const teams = await prisma.team.findMany({
      include: {
        registrations: {
          select: { numAdults: true, numChildren: true, totalAmount: true },
        },
      },
    });

    const ranked = teams
      .map((t) => {
        const members = t.registrations.reduce(
          (a, r) => a + r.numAdults + r.numChildren,
          0
        );
        const raised = t.registrations.reduce((a, r) => a + r.totalAmount, 0);
        return { name: t.name, members, raised, goal: t.goal };
      })
      .sort((a, b) => b.raised - a.raised)
      .map((t, i) => ({ ...t, rank: i + 1 }));

    const agg = await prisma.registration.aggregate({
      _sum: { numAdults: true, numChildren: true, totalAmount: true },
    });

    const walkers = (agg._sum.numAdults ?? 0) + (agg._sum.numChildren ?? 0);
    const raised = agg._sum.totalAmount ?? 0;

    return NextResponse.json({
      teams: ranked,
      stats: { participants: walkers, raised },
    });
  } catch (e) {
    // Before the DB is provisioned, return empty state so the UI still renders.
    console.error("GET /api/teams failed:", e);
    return NextResponse.json({
      teams: [],
      stats: { participants: 0, raised: 0 },
      error: "database_unavailable",
    });
  }
}
