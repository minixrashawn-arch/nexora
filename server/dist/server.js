"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const admin_routes_1 = __importDefault(require("./routes/admin.routes"));
const price_routes_1 = __importDefault(require("./routes/price.routes"));
const transaction_routes_1 = __importDefault(require("./routes/transaction.routes"));
const priceSimulator_1 = require("./utils/priceSimulator");
const cleanupHistory_1 = require("./utils/cleanupHistory");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
const allowedOrigins = [process.env.FRONTEND_URL];
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, helmet_1.default)());
app.use(helmet_1.default.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use((0, cors_1.default)({
    origin: allowedOrigins,
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use((0, morgan_1.default)("common"));
app.use((0, cookie_parser_1.default)());
app.use("/api/auth", auth_routes_1.default);
app.use("/api/user", user_routes_1.default);
app.use("/api/transactions", transaction_routes_1.default);
app.use("/api/admin", admin_routes_1.default);
app.use("/api/price", price_routes_1.default);
app.get("/", (req, res) => {
    res.json({ message: "Nexora API running" });
});
app.listen(PORT, async () => {
    console.log(`Server running on port ${PORT}`);
    await (0, priceSimulator_1.startPriceSimulator)();
    (0, cleanupHistory_1.startHistoryCleanup)();
});
