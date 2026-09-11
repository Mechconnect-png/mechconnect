import { Response } from "express";
import { PrismaClient } from "@prisma/client";
import { AuthRequest } from "../middleware/auth.middleware.js";

const prisma = new PrismaClient();

export class MechanicController {
  public static async getProfile(req: AuthRequest, res: Response) {
    try {
      const mechanicId = req.user?.mechanicId;
      if (!mechanicId) return res.status(400).json({ success: false, message: "Mechanic profile missing." });

      const mechanic = await prisma.mechanic.findUnique({
        where: { id: mechanicId },
        include: {
          user: true,
          ratings: { include: { customer: { include: { user: true } } } },
          _count: { select: { requests: true } }
        }
      });

      return res.json({ success: true, mechanic });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  public static async toggleAvailability(req: AuthRequest, res: Response) {
    try {
      const mechanicId = req.user?.mechanicId;
      const { isOnline } = req.body;

      if (!mechanicId) return res.status(400).json({ success: false, message: "Mechanic profile missing." });

      const mechanic = await prisma.mechanic.update({
        where: { id: mechanicId },
        data: { isOnline: Boolean(isOnline) }
      });

      return res.json({ success: true, isOnline: mechanic.isOnline });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  public static async updateLocation(req: AuthRequest, res: Response) {
    try {
      const mechanicId = req.user?.mechanicId;
      const { lat, lng } = req.body;

      if (!mechanicId || lat === undefined || lng === undefined) {
        return res.status(400).json({ success: false, message: "Valid coordinates required." });
      }

      await prisma.mechanic.update({
        where: { id: mechanicId },
        data: { lat: Number(lat), lng: Number(lng) }
      });

      await prisma.mechanicLocation.create({
        data: {
          mechanicId,
          lat: Number(lat),
          lng: Number(lng)
        }
      });

      return res.json({ success: true, lat, lng });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  public static async getAvailableRequests(req: AuthRequest, res: Response) {
    try {
      const mechanicId = req.user?.mechanicId || "";

      const requests = await prisma.serviceRequest.findMany({
        where: {
          OR: [
            { status: "SEARCHING" },
            { status: { in: ["ACCEPTED", "EN_ROUTE", "ARRIVED", "SERVICING"] }, mechanicId }
          ]
        },
        include: {
          customer: { include: { user: true } },
          vehicle: true,
          serviceType: true,
          additionalCharges: true,
          chatMessages: {
            orderBy: { timestamp: "asc" }
          }
        },
        orderBy: { createdAt: "desc" }
      });

      return res.json({ success: true, requests });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  public static async getEarnings(req: AuthRequest, res: Response) {
    try {
      const mechanicId = req.user?.mechanicId;
      if (!mechanicId) return res.status(400).json({ success: false, message: "Mechanic profile missing." });

      const completedRequests = await prisma.serviceRequest.findMany({
        where: {
          mechanicId,
          status: { in: ["COMPLETED", "PAID", "RATED"] }
        },
        include: { serviceType: true, vehicle: true }
      });

      const totalEarnings = completedRequests.reduce((sum, r) => sum + r.totalAmount, 0);

      return res.json({
        success: true,
        summary: {
          totalEarnings,
          completedJobsCount: completedRequests.length,
          avgJobEarning: completedRequests.length > 0 ? Math.round(totalEarnings / completedRequests.length) : 0
        },
        jobs: completedRequests
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}
