import { z } from "zod";

// Match status constants
export const MATCH_STATUS = {
  SCHEDULED: "scheduled",
  LIVE: "live",
  FINISHED: "finished",
} as const;

// Schema for listing matches with optional limit parameter
export const listMatchesQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(100).optional(),
});

export type ListMatchesQuery = z.infer<typeof listMatchesQuerySchema>;

// Schema for match ID parameter
export const matchIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export type MatchIdParam = z.infer<typeof matchIdParamSchema>;

// Helper function to validate ISO 8601 date strings
const isValidISODate = (dateString: string): boolean => {
  const isoDateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/;
  if (!isoDateRegex.test(dateString)) {
    return false;
  }
  const date = new Date(dateString);
  return !isNaN(date.getTime());
};

// Schema for creating a new match
export const createMatchSchema = z
  .object({
    sport: z.string().min(1, "Sport is required and cannot be empty"),
    homeTeam: z.string().min(1, "Home team is required and cannot be empty"),
    awayTeam: z.string().min(1, "Away team is required and cannot be empty"),
    startTime: z
      .string()
      .refine(isValidISODate, "startTime must be a valid ISO 8601 date string"),
    endTime: z
      .string()
      .refine(isValidISODate, "endTime must be a valid ISO 8601 date string"),
    homeScore: z.coerce.number().int().nonnegative().optional(),
    awayScore: z.coerce.number().int().nonnegative().optional(),
  })
  .superRefine((data, ctx) => {
    const startTime = new Date(data.startTime);
    const endTime = new Date(data.endTime);

    if (endTime <= startTime) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["endTime"],
        message: "endTime must be chronologically after startTime",
      });
    }
  });

export type CreateMatch = z.infer<typeof createMatchSchema>;

// Schema for updating match scores
export const updateScoreSchema = z.object({
  homeScore: z.coerce.number().int().nonnegative(),
  awayScore: z.coerce.number().int().nonnegative(),
});

export type UpdateScore = z.infer<typeof updateScoreSchema>;
