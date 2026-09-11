"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerController = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class CustomerController {
    static async getVehicles(req, res) {
        try {
            const customerId = req.user?.customerId;
            if (!customerId)
                return res.status(400).json({ success: false, message: "Customer profile missing." });
            const vehicles = await prisma.vehicle.findMany({
                where: { customerId },
                orderBy: { isPrimary: "desc" }
            });
            return res.json({ success: true, vehicles });
        }
        catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }
    static async addVehicle(req, res) {
        try {
            const customerId = req.user?.customerId;
            if (!customerId)
                return res.status(400).json({ success: false, message: "Customer profile missing." });
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
        }
        catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }
    static async deleteVehicle(req, res) {
        try {
            const id = String(req.params.id);
            const customerId = req.user?.customerId;
            await prisma.vehicle.deleteMany({
                where: { id, customerId }
            });
            return res.json({ success: true, message: "Vehicle removed successfully." });
        }
        catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }
    static async getActiveBooking(req, res) {
        try {
            const customerId = req.user?.customerId;
            if (!customerId)
                return res.status(400).json({ success: false, message: "Customer profile missing." });
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
        }
        catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }
    static async getHistory(req, res) {
        try {
            const customerId = req.user?.customerId;
            if (!customerId)
                return res.status(400).json({ success: false, message: "Customer profile missing." });
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
        }
        catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }
    static async getServiceTypes(req, res) {
        try {
            const serviceTypes = await prisma.serviceType.findMany({
                orderBy: { basePrice: "asc" }
            });
            return res.json({ success: true, serviceTypes });
        }
        catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }
}
exports.CustomerController = CustomerController;
