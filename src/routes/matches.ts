import { Router, Request, Response } from "express";
import {
  createMatchSchema,
  listMatchesQuerySchema,
} from "../validation/matches";
import { db } from "../db/db";
import { matches } from "../schema/schema";
import { getMatchStatus } from "../utils/match-status";
import { desc } from "drizzle-orm";

export const matchRouter = Router();
const MAX_LIMIT = 100;
matchRouter.get("/", async (req: Request, res: Response) => {
  console.log("from drizzle orm");
  const parsed = listMatchesQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({
      error: "invalid query",
      details: JSON.stringify(parsed.error),
    });
    return;
  }
  const limit = Math.min(parsed.data.limit ?? 50, MAX_LIMIT);

  try {
    const data = await db
      .select()
      .from(matches)
      .orderBy(desc(matches.createdAt))
      .limit(limit);

    res.json({ data });
  } catch (e) {
    res.status(500).json({ error: "Failed to list matches" });
  }
});

matchRouter.post("/", async (req, res) => {
  const parsed = createMatchSchema.safeParse(req.body);
  /*  const {
    data: { startTime },
  } = parsed; */
  if (!parsed.success) {
    res.status(400).json({
      error: "invalid payload",
      details: JSON.stringify(parsed.error),
    });
    return;
  }

  const {
    data: {
      startTime,
      endTime,
      sport,
      homeTeam,
      awayTeam,
      homeScore,
      awayScore,
    },
  } = parsed;

  try {
    const startTimeDate = new Date(startTime);
    const endTimeDate = new Date(endTime);
    const status = getMatchStatus(startTimeDate, endTimeDate);

    if (!status) {
      res.status(400).json({
        error: "invalid match status",
        details: "Unable to determine match status from provided times",
      });
      return;
    }

    const [event] = await db
      .insert(matches)
      .values({
        sport,
        homeTeam,
        awayTeam,
        startTime: startTimeDate,
        endTime: endTimeDate,
        homeScore: homeScore ?? 0,
        awayScore: awayScore ?? 0,
        status,
      })
      .returning();
    res.status(201).json({
      success: true,
      data: event,
    });
  } catch (e) {
    res
      .status(500)
      .json({ error: "Failed to create match", details: JSON.stringify(e) });
  }
});
