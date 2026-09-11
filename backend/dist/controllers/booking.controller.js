"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingController = void 0;
const client_1 = require("@prisma/client");
const matching_service_js_1 = require("../services/matching.service.js");
const socket_service_js_1 = require("../services/socket.service.js");
const prisma = new client_1.PrismaClient();
const ALLOWED_TRANSITIONS = {
    CREATED: ["SEARCHING", "CANCELLED"],
    SEARCHING: ["ACCEPTED", "CANCELLED", "NO_MECHANIC_AVAILABLE"],
    MATCHED: ["ACCEPTED", "CANCELLED"],
    ACCEPTED: ["EN_ROUTE", "CANCELLED"],
    EN_ROUTE: ["ARRIVED", "CANCELLED"],
    ARRIVED: ["SERVICING", "CANCELLED"],
    SERVICING: ["COMPLETED", "CANCELLED"],
    COMPLETED: ["PAYMENT_PENDING", "PAID"],
    PAYMENT_PENDING: ["PAID"],
    PAID: ["RATED"],
    RATED: [],
    CANCELLED: [],
    NO_MECHANIC_AVAILABLE: []
};
class BookingController {
    static async createBooking(req, res) {
        try {
            let customerId = req.user?.customerId;
            if (!customerId && req.user?.userId) {
                let cust = await prisma.customer.findFirst({ where: { userId: req.user.userId } });
                if (!cust) {
                    cust = await prisma.customer.create({
                        data: { userId: req.user.userId, defaultAddress: "Anna Nagar West, Chennai" }
                    });
                }
                customerId = cust.id;
            }
            if (!customerId)
                return res.status(400).json({ success: false, message: "Customer profile required." });
            const { vehicleId, serviceTypeId, customerLat, customerLng, customerAddress, issueDescription, aiDiagnosisJson, priority } = req.body;
            // Safe fallback resolution for vehicle
            let vehicle = vehicleId ? await prisma.vehicle.findUnique({ where: { id: String(vehicleId) } }) : null;
            if (!vehicle) {
                vehicle = await prisma.vehicle.findFirst({ where: { customerId } });
                if (!vehicle) {
                    vehicle = await prisma.vehicle.create({
                        data: {
                            customerId,
                            type: "FOUR_WHEELER",
                            brand: "Honda",
                            model: "City i-VTEC",
                            year: 2022,
                            regNumber: "TN 07 CX 4589",
                            fuelType: "Petrol",
                            isPrimary: true
                        }
                    });
                }
            }
            // Safe fallback resolution for service type
            let serviceType = serviceTypeId ? await prisma.serviceType.findUnique({ where: { id: String(serviceTypeId) } }) : null;
            if (!serviceType) {
                serviceType = await prisma.serviceType.findFirst();
                if (!serviceType) {
                    return res.status(404).json({ success: false, message: "No roadside service types available." });
                }
            }
            const bookingCode = `MC-${Math.floor(100000 + Math.random() * 900000)}`;
            let onlineMechanics = await prisma.mechanic.findMany({
                where: { isOnline: true, isVerified: true },
                include: {
                    user: true,
                    requests: {
                        where: { status: { in: ["ACCEPTED", "EN_ROUTE", "ARRIVED", "SERVICING"] } }
                    }
                }
            });
            if (onlineMechanics.length === 0) {
                onlineMechanics = await prisma.mechanic.findMany({
                    where: { isVerified: true },
                    include: {
                        user: true,
                        requests: {
                            where: { status: { in: ["ACCEPTED", "EN_ROUTE", "ARRIVED", "SERVICING"] } }
                        }
                    }
                });
            }
            const lat = customerLat !== undefined ? Number(customerLat) : 13.0827;
            const lng = customerLng !== undefined ? Number(customerLng) : 80.2707;
            const matches = onlineMechanics
                .map(mech => matching_service_js_1.MatchingService.calculateMatchScore({ ...mech, _count: { requests: mech.requests.length } }, { customerLat: lat, customerLng: lng, serviceCategoryKey: serviceType.key }))
                .filter((m) => m !== null)
                .sort((a, b) => b.matchScore - a.matchScore);
            const bestMatch = matches.length > 0 ? matches[0] : null;
            const isUrgent = priority === "URGENT";
            const newRequest = await prisma.serviceRequest.create({
                data: {
                    bookingCode,
                    customerId,
                    vehicleId: vehicle.id,
                    serviceTypeId: serviceType.id,
                    priority: isUrgent ? "URGENT" : "NORMAL",
                    customerLat: lat,
                    customerLng: lng,
                    customerAddress: customerAddress || "Anna Nagar West, Chennai",
                    issueDescription: issueDescription || (isUrgent ? "🚨 EMERGENCY SOS Roadside Assistance" : "Roadside Assistance Request"),
                    aiDiagnosisJson: aiDiagnosisJson ? JSON.stringify(aiDiagnosisJson) : null,
                    baseAmount: serviceType.basePrice,
                    extraChargesAmount: 0,
                    totalAmount: serviceType.basePrice,
                    status: "SEARCHING",
                    statusHistory: {
                        create: { status: "SEARCHING", note: `Roadside assistance requested (${isUrgent ? "URGENT" : "NORMAL"})` }
                    }
                },
                include: {
                    vehicle: true,
                    serviceType: true,
                    customer: { include: { user: true } }
                }
            });
            let targetMechanicIds = matches.map(m => m.mechanicId);
            if (targetMechanicIds.length === 0 || isUrgent) {
                targetMechanicIds = onlineMechanics.map(m => m.id);
            }
            socket_service_js_1.SocketService.notifyMechanicsNewRequest(targetMechanicIds, {
                request: newRequest,
                booking: newRequest,
                bestMatch,
                priority: newRequest.priority
            });
            return res.status(201).json({
                success: true,
                booking: newRequest,
                bestMatch,
                matchedMechanicsCount: Math.max(matches.length, onlineMechanics.length)
            });
        }
        catch (error) {
            console.error("Error creating booking:", error);
            return res.status(500).json({ success: false, message: error.message });
        }
    }
    static async acceptBooking(req, res) {
        try {
            const mechanicId = req.user?.mechanicId;
            const requestId = String(req.params.id);
            if (!mechanicId)
                return res.status(403).json({ success: false, message: "Only verified mechanics can accept jobs." });
            const updatedRequest = await prisma.$transaction(async (tx) => {
                const current = await tx.serviceRequest.findUnique({
                    where: { id: requestId }
                });
                if (!current) {
                    throw new Error("Request not found.");
                }
                if (current.status !== "SEARCHING" && current.status !== "CREATED") {
                    throw new Error("ALREADY_ASSIGNED");
                }
                if (current.mechanicId && current.mechanicId !== mechanicId) {
                    throw new Error("ALREADY_ASSIGNED");
                }
                const accepted = await tx.serviceRequest.update({
                    where: { id: requestId },
                    data: {
                        mechanicId,
                        status: "ACCEPTED",
                        statusHistory: {
                            create: { status: "ACCEPTED", note: "Job accepted by mechanic" }
                        }
                    },
                    include: {
                        mechanic: { include: { user: true } },
                        customer: { include: { user: true } },
                        vehicle: true,
                        serviceType: true
                    }
                });
                return accepted;
            });
            socket_service_js_1.SocketService.notifyBookingStatusUpdate(requestId, {
                status: "ACCEPTED",
                booking: updatedRequest
            });
            return res.json({ success: true, message: "Job accepted successfully!", booking: updatedRequest });
        }
        catch (error) {
            if (error.message === "ALREADY_ASSIGNED") {
                return res.status(409).json({ success: false, message: "Booking already accepted by another mechanic." });
            }
            return res.status(500).json({ success: false, message: error.message });
        }
    }
    static async updateStatus(req, res) {
        try {
            const requestId = String(req.params.id);
            const { status, note } = req.body;
            const booking = await prisma.serviceRequest.findUnique({ where: { id: requestId } });
            if (!booking)
                return res.status(404).json({ success: false, message: "Booking not found." });
            const allowedNext = ALLOWED_TRANSITIONS[booking.status] || [];
            if (!allowedNext.includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: `Invalid state transition from ${booking.status} to ${status}. Allowed: [${allowedNext.join(", ")}]`
                });
            }
            const updated = await prisma.serviceRequest.update({
                where: { id: requestId },
                data: {
                    status: String(status),
                    statusHistory: {
                        create: { status: String(status), note: note || `Status updated to ${status}` }
                    }
                },
                include: {
                    mechanic: { include: { user: true } },
                    customer: { include: { user: true } },
                    vehicle: true,
                    serviceType: true,
                    additionalCharges: true
                }
            });
            socket_service_js_1.SocketService.notifyBookingStatusUpdate(requestId, {
                status,
                booking: updated
            });
            return res.json({ success: true, booking: updated });
        }
        catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }
    static async addExtraCharge(req, res) {
        try {
            const requestId = String(req.params.id);
            const { title, description, amount } = req.body;
            if (!title || !amount) {
                return res.status(400).json({ success: false, message: "Title and amount are required." });
            }
            const charge = await prisma.additionalCharge.create({
                data: {
                    serviceRequestId: requestId,
                    title: String(title),
                    description: description ? String(description) : null,
                    amount: Number(amount),
                    status: "PENDING"
                }
            });
            socket_service_js_1.SocketService.notifyBookingStatusUpdate(requestId, {
                type: "ADDITIONAL_CHARGE_ADDED",
                charge
            });
            return res.status(201).json({ success: true, charge });
        }
        catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }
    static async respondExtraCharge(req, res) {
        try {
            const chargeId = String(req.params.chargeId);
            const { approved } = req.body;
            const charge = await prisma.additionalCharge.update({
                where: { id: chargeId },
                data: { status: approved ? "APPROVED" : "DECLINED" }
            });
            if (approved) {
                const booking = await prisma.serviceRequest.findUnique({
                    where: { id: charge.serviceRequestId },
                    include: { additionalCharges: { where: { status: "APPROVED" } } }
                });
                if (booking) {
                    const totalExtra = booking.additionalCharges.reduce((sum, c) => sum + c.amount, 0);
                    await prisma.serviceRequest.update({
                        where: { id: booking.id },
                        data: {
                            extraChargesAmount: totalExtra,
                            totalAmount: booking.baseAmount + totalExtra
                        }
                    });
                }
            }
            socket_service_js_1.SocketService.notifyBookingStatusUpdate(charge.serviceRequestId, {
                type: "ADDITIONAL_CHARGE_RESPONSE",
                charge
            });
            return res.json({ success: true, charge });
        }
        catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }
    static async cancelBooking(req, res) {
        try {
            const requestId = String(req.params.id);
            const { reason } = req.body;
            const booking = await prisma.serviceRequest.update({
                where: { id: requestId },
                data: {
                    status: "CANCELLED",
                    statusHistory: {
                        create: { status: "CANCELLED", note: reason ? String(reason) : "Cancelled by customer" }
                    }
                }
            });
            socket_service_js_1.SocketService.notifyBookingStatusUpdate(requestId, {
                status: "CANCELLED",
                booking
            });
            return res.json({ success: true, message: "Booking cancelled successfully." });
        }
        catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }
    static async processPayment(req, res) {
        try {
            const requestId = String(req.params.id);
            const { method } = req.body;
            const booking = await prisma.serviceRequest.findUnique({ where: { id: requestId } });
            if (!booking)
                return res.status(404).json({ success: false, message: "Booking not found." });
            const transactionId = `TXN-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
            const payment = await prisma.payment.create({
                data: {
                    serviceRequestId: requestId,
                    transactionId,
                    amount: booking.totalAmount,
                    method: method ? String(method) : "UPI Demo",
                    status: "PAID"
                }
            });
            const updatedBooking = await prisma.serviceRequest.update({
                where: { id: requestId },
                data: {
                    paymentStatus: "PAID",
                    paymentMethod: method ? String(method) : "UPI Demo",
                    status: "PAID",
                    statusHistory: {
                        create: { status: "PAID", note: `Payment completed via ${method || "UPI Demo"}` }
                    }
                }
            });
            socket_service_js_1.SocketService.notifyBookingStatusUpdate(requestId, {
                status: "PAID",
                payment,
                booking: updatedBooking
            });
            return res.json({ success: true, payment, booking: updatedBooking });
        }
        catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }
    static async submitRating(req, res) {
        try {
            const requestId = String(req.params.id);
            const { stars, feedbackTags, reviewText } = req.body;
            const customerId = req.user?.customerId;
            const booking = await prisma.serviceRequest.findUnique({ where: { id: requestId } });
            if (!booking || !booking.mechanicId) {
                return res.status(400).json({ success: false, message: "Invalid booking or missing mechanic." });
            }
            if (booking.status !== "PAID" && booking.status !== "COMPLETED") {
                return res.status(400).json({ success: false, message: "Only completed and paid bookings can be rated." });
            }
            const existingRating = await prisma.rating.findUnique({
                where: { serviceRequestId: requestId }
            });
            if (existingRating) {
                return res.status(409).json({ success: false, message: "You have already submitted a rating for this service." });
            }
            const rating = await prisma.rating.create({
                data: {
                    serviceRequestId: requestId,
                    customerId: customerId,
                    mechanicId: booking.mechanicId,
                    stars: Number(stars) || 5,
                    feedbackTagsJson: JSON.stringify(feedbackTags || ["Fast Service", "Professional"]),
                    reviewText: reviewText ? String(reviewText) : null
                }
            });
            const mechanicRatings = await prisma.rating.findMany({
                where: { mechanicId: booking.mechanicId }
            });
            const avgRating = mechanicRatings.reduce((sum, r) => sum + r.stars, 0) / mechanicRatings.length;
            await prisma.mechanic.update({
                where: { id: booking.mechanicId },
                data: {
                    rating: Math.round(avgRating * 10) / 10,
                    totalRatings: mechanicRatings.length
                }
            });
            const updatedBooking = await prisma.serviceRequest.update({
                where: { id: requestId },
                data: {
                    status: "RATED",
                    statusHistory: {
                        create: { status: "RATED", note: `Rated ${stars} stars` }
                    }
                }
            });
            socket_service_js_1.SocketService.notifyBookingStatusUpdate(requestId, {
                status: "RATED",
                rating,
                booking: updatedBooking
            });
            return res.json({ success: true, rating, booking: updatedBooking });
        }
        catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }
}
exports.BookingController = BookingController;
