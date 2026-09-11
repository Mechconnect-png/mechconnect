import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { AuthRequest } from "../middleware/auth.middleware.js";

const prisma = new PrismaClient();

export class CustomerController {
  public static async getVehicles(req: AuthRequest, res: Response) {
    try {
      const customerId = req.user?.customerId;
      if (!customerId) return res.status(400).json({ success: false, message: "Customer profile missing." });

      const vehicles = await prisma.vehicle.findMany({
        where: { customerId },
        orderBy: { isPrimary: "desc" }
      });

      return res.json({ success: true, vehicles });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  public static async addVehicle(req: AuthRequest, res: Response) {
    try {
      const customerId = req.user?.customerId;
      if (!customerId) return res.status(400).json({ success: false, message: "Customer profile missing." });

      const { type, brand, model, year, regNumber, fuelType, isPrimary } = req.body;

      if (!brand || !model || !regNumber) {
        return res.status(400).json({ success: false, message: "Brand, model, and registration number are required." });
      }

      if (isPrimary) {
        await prisma.vehicle.updateMany({
          where: { customerId },
          data: { isPrimary: false }
        });
      }

      const vehicle = await prisma.vehicle.create({
        data: {
          customerId,
          type: type || "FOUR_WHEELER",
          brand,
          model,
          year: Number(year) || new Date().getFullYear(),
          regNumber,
          fuelType: fuelType || "Petrol",
          isPrimary: isPrimary || false
        }
      });

      return res.status(201).json({ success: true, vehicle });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  public static async deleteVehicle(req: AuthRequest, res: Response) {
    try {
      const id = String(req.params.id);
      const customerId = req.user?.customerId;

      await prisma.vehicle.deleteMany({
        where: { id, customerId }
      });

      return res.json({ success: true, message: "Vehicle removed successfully." });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  public static async getActiveBooking(req: AuthRequest, res: Response) {
    try {
      const customerId = req.user?.customerId;
      if (!customerId) return res.status(400).json({ success: false, message: "Customer profile missing." });

      const activeBooking = await prisma.serviceRequest.findFirst({
        where: {
          customerId,
          status: {
            notIn: ["CANCELLED", "NO_MECHANIC_AVAILABLE", "RATED"]
          }
        },
        include: {
          mechanic: {
            include: { user: true }
          },
          vehicle: true,
          serviceType: true,
          additionalCharges: true,
          chatMessages: {
            orderBy: { timestamp: "asc" }
          }
        },
        orderBy: { createdAt: "desc" }
      });

      return res.json({ success: true, booking: activeBooking });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  public static async getHistory(req: AuthRequest, res: Response) {
    try {
      const customerId = req.user?.customerId;
      if (!customerId) return res.status(400).json({ success: false, message: "Customer profile missing." });

      const history = await prisma.serviceRequest.findMany({
        where: { customerId },
        include: {
          mechanic: { include: { user: true } },
          vehicle: true,
          serviceType: true,
          ratings: true
        },
        orderBy: { createdAt: "desc" }
      });

      return res.json({ success: true, history });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  public static async getServiceTypes(req: Request, res: Response) {
    try {
      const serviceTypes = await prisma.serviceType.findMany({
        orderBy: { basePrice: "asc" }
      });
      return res.json({ success: true, serviceTypes });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}
