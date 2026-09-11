"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminController = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class AdminController {
    static async getDashboardStats(req, res) {
        try {
            const totalUsers = await prisma.user.count();
            const totalCustomers = await prisma.customer.count();
            const totalMechanics = await prisma.mechanic.count();
            const verifiedMechanics = await prisma.mechanic.count({ where: { isVerified: true } });
            const pendingMechanics = await prisma.mechanic.count({ where: { isVerified: false } });
            const totalBookings = await prisma.serviceRequest.count();
            const activeBookings = await prisma.serviceRequest.findMany({
                where: { status: { in: ["CREATED", "SEARCHING", "MATCHED", "ACCEPTED", "EN_ROUTE", "ARRIVED", "SERVICING"] } },
                include: {
                    customer: { include: { user: true } },
                    mechanic: { include: { user: true } },
                    serviceType: true,
                    vehicle: true
                }
            });
            const payments = await prisma.payment.findMany({
                where: { status: "PAID" }
            });
            const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);
            return res.json({
                success: true,
                stats: {
                    totalUsers,
                    totalCustomers,
                    totalMechanics,
                    verifiedMechanics,
                    pendingMechanics,
                    totalBookings,
                    activeBookingsCount: activeBookings.length,
                    totalRevenue
                },
                activeBookings
            });
        }
        catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }
    static async getMechanics(req, res) {
        try {
            const mechanics = await prisma.mechanic.findMany({
                include: { user: true, _count: { select: { requests: true } } },
                orderBy: { isVerified: "asc" }
            });
            return res.json({ success: true, mechanics });
        }
        catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }
    static async verifyMechanic(req, res) {
        try {
            const id = String(req.params.id);
            const { isVerified } = req.body;
            const mechanic = await prisma.mechanic.update({
                where: { id },
                data: { isVerified: Boolean(isVerified) },
                include: { user: true }
            });
            return res.json({ success: true, mechanic });
        }
        catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }
    static async getAllBookings(req, res) {
        try {
            const bookings = await prisma.serviceRequest.findMany({
                include: {
                    customer: { include: { user: true } },
                    mechanic: { include: { user: true } },
                    serviceType: true,
                    vehicle: true,
                    payments: true
                },
                orderBy: { createdAt: "desc" }
            });
            return res.json({ success: true, bookings });
        }
        catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }
}
exports.AdminController = AdminController;
