import { Request, Response } from "express";
import { StatsRepository } from "src/repositories/stats.repository";

export class StatsController {
  static async getDashboardStats(_req: Request, res: Response) {
    try {
      const stats = await StatsRepository.getDashboardStats();
      return res.status(200).json(stats);
    } catch {
      return res.status(500).json({ error: "Failed to load dashboard stats" });
    }
  }
}
