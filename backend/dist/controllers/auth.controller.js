"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = require("@prisma/client");
const env_js_1 = require("../config/env.js");
const prisma = new client_1.PrismaClient();
class AuthController {
    static async register(req, res) {
        try {
            const { email, password, name, phone, role, bio, skills } = req.body;
            if (!email || !password || !name) {
                return res.status(400).json({ success: false, message: "Email, password, and name are required." });
            }
            const existingUser = await prisma.user.findUnique({ where: { email } });
            if (existingUser) {
                return res.status(400).json({ success: false, message: "User with this email already exists." });
            }
            const hashedPassword = await bcryptjs_1.default.hash(password, 10);
            const userRole = role === "MECHANIC" ? "MECHANIC" : "CUSTOMER";
            const user = await prisma.user.create({
                data: {
                    email,
                    password: hashedPassword,
                    name,
                    phone: phone || null,
                    role: userRole,
                    ...(userRole === "CUSTOMER"
                        ? { customer: { create: { defaultAddress: "Default Location" } } }
                        : {
                            mechanic: {
                                create: {
                                    bio: bio || "Certified Vehicle Mechanic",
                                    skillsJson: JSON.stringify(skills || ["General Service", "Battery", "Tyre"]),
                                    isOnline: true,
                                    isVerified: true // Auto-verify demo mechanics for seamless viva demo
                                }
                            }
                        })
                },
                include: {
                    customer: true,
                    mechanic: true
                }
            });
            const token = jsonwebtoken_1.default.sign({
                userId: user.id,
                role: user.role,
                email: user.email,
                customerId: user.customer?.id,
                mechanicId: user.mechanic?.id
            }, env_js_1.ENV.JWT_SECRET, { expiresIn: "7d" });
            return res.status(201).json({
                success: true,
                message: "Registration successful.",
                token,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    phone: user.phone,
                    customerId: user.customer?.id,
                    mechanicId: user.mechanic?.id
                }
            });
        }
        catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }
    static async login(req, res) {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                return res.status(400).json({ success: false, message: "Email and password are required." });
            }
            const user = await prisma.user.findUnique({
                where: { email },
                include: {
                    customer: true,
                    mechanic: true
                }
            });
            if (!user) {
                return res.status(401).json({ success: false, message: "Invalid email or password." });
            }
            const isMatch = await bcryptjs_1.default.compare(password, user.password);
            if (!isMatch) {
                return res.status(401).json({ success: false, message: "Invalid email or password." });
            }
            const token = jsonwebtoken_1.default.sign({
                userId: user.id,
                role: user.role,
                email: user.email,
                customerId: user.customer?.id,
                mechanicId: user.mechanic?.id
            }, env_js_1.ENV.JWT_SECRET, { expiresIn: "7d" });
            return res.json({
                success: true,
                token,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    phone: user.phone,
                    avatar: user.avatar,
                    customerId: user.customer?.id,
                    mechanicId: user.mechanic?.id,
                    mechanicInfo: user.mechanic ? {
                        isOnline: user.mechanic.isOnline,
                        isVerified: user.mechanic.isVerified,
                        rating: user.mechanic.rating,
                        experienceYears: user.mechanic.experienceYears
                    } : undefined
                }
            });
        }
        catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }
    static async getMe(req, res) {
        try {
            if (!req.user)
                return res.status(401).json({ success: false, message: "Not authenticated" });
            const user = await prisma.user.findUnique({
                where: { id: req.user.userId },
                include: {
                    customer: {
                        include: { vehicles: true }
                    },
                    mechanic: true
                }
            });
            if (!user)
                return res.status(404).json({ success: false, message: "User not found" });
            return res.json({
                success: true,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    phone: user.phone,
                    avatar: user.avatar,
                    customerId: user.customer?.id,
                    mechanicId: user.mechanic?.id,
                    vehicles: user.customer?.vehicles || [],
                    mechanicInfo: user.mechanic
                }
            });
        }
        catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }
}
exports.AuthController = AuthController;
