"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logoutUser = exports.resetPassword = exports.verifyOTP = exports.forgotPassword = exports.loginUser = exports.registerUser = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const generateToken_1 = require("../utils/generateToken");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const sendEmail_1 = require("../utils/sendEmail");
const registerUser = async (req, res) => {
    const { name, email, password } = req.body;
    if (!email || !password || !name) {
        return res.status(400).json({ message: "Please fill in all fields" });
    }
    try {
        const existingUser = await prisma_1.default.user.findUnique({
            where: { email },
        });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }
        const hashedPassword = await bcryptjs_1.default.hash(password, 8);
        const user = await prisma_1.default.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
            },
        });
        const accessToken = (0, generateToken_1.generateTokenAndCookies)(res, user.id, user.role);
        return res.status(201).json({
            success: true,
            data: {
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                },
                accessToken,
            },
        });
    }
    catch (error) {
        console.error("Registration Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};
exports.registerUser = registerUser;
const loginUser = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: "Please fill in all fields" });
    }
    try {
        const user = await prisma_1.default.user.findUnique({
            where: { email: email },
        });
        if (!user) {
            return res.status(400).json({ message: "Invalid credentials" });
        }
        const isPasswordValid = await bcryptjs_1.default.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: "Invalid credentials" });
        }
        const accessToken = (0, generateToken_1.generateTokenAndCookies)(res, user.id, user.role);
        return res.status(200).json({
            success: true,
            message: "User logged in successfully",
            data: {
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                },
                accessToken,
            },
        });
    }
    catch (error) {
        console.error("Login Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};
exports.loginUser = loginUser;
const forgotPassword = async (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ message: "Email is required" });
    }
    try {
        const user = await prisma_1.default.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(200).json({
                success: true,
                message: "If this email exists, an OTP has been sent",
            });
        }
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
        await prisma_1.default.user.update({
            where: { email },
            data: {
                otp,
                otpExpiresAt,
                otpVerified: false,
            },
        });
        await (0, sendEmail_1.sendOTPEmail)(email, otp);
        return res.status(200).json({
            success: true,
            message: "OTP sent to your email",
        });
    }
    catch (error) {
        console.error("Forgot Password Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};
exports.forgotPassword = forgotPassword;
const verifyOTP = async (req, res) => {
    const { email, otp } = req.body;
    if (!email || !otp) {
        return res.status(400).json({ message: "Email and OTP are required" });
    }
    try {
        const user = await prisma_1.default.user.findUnique({ where: { email } });
        if (!user || !user.otp || !user.otpExpiresAt) {
            return res.status(400).json({ message: "Invalid or expired OTP" });
        }
        if (user.otp !== otp) {
            return res.status(400).json({ message: "Invalid OTP" });
        }
        if (new Date() > user.otpExpiresAt) {
            return res.status(400).json({ message: "OTP has expired" });
        }
        await prisma_1.default.user.update({
            where: { email },
            data: { otpVerified: true },
        });
        return res.status(200).json({
            success: true,
            message: "OTP verified successfully",
        });
    }
    catch (error) {
        console.error("Verify OTP Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};
exports.verifyOTP = verifyOTP;
const resetPassword = async (req, res) => {
    const { email, newPassword, confirmPassword } = req.body;
    if (!email || !newPassword || !confirmPassword) {
        return res.status(400).json({ message: "All fields are required" });
    }
    if (newPassword !== confirmPassword) {
        return res.status(400).json({ message: "Passwords do not match" });
    }
    if (newPassword.length < 6) {
        return res
            .status(400)
            .json({ message: "Password must be at least 6 characters" });
    }
    try {
        const user = await prisma_1.default.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }
        if (!user.otpVerified) {
            return res.status(400).json({ message: "OTP not verified" });
        }
        const hashedPassword = await bcryptjs_1.default.hash(newPassword, 8);
        await prisma_1.default.user.update({
            where: { email },
            data: {
                password: hashedPassword,
                otp: null,
                otpExpiresAt: null,
                otpVerified: false,
            },
        });
        return res.status(200).json({
            success: true,
            message: "Password reset successfully",
        });
    }
    catch (error) {
        console.error("Reset Password Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};
exports.resetPassword = resetPassword;
const logoutUser = async (req, res, next) => {
    try {
        res.clearCookie("token", {
            httpOnly: true,
            sameSite: "strict",
            secure: process.env.NODE_ENV === "production",
            path: "/",
        });
        return res.status(200).json({
            success: true,
            message: "User logged out successfully",
        });
    }
    catch (error) {
        console.error("Logout Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};
exports.logoutUser = logoutUser;
