import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";
import adminRoutes from "./routes/admin.routes";
import priceRoutes from "./routes/price.routes";
import transactionRoutes from "./routes/transaction.routes";
import { startPriceSimulator } from "./utils/priceSimulator";
import { startHistoryCleanup } from "./utils/cleanupHistory";

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT as string, 10);
const allowedOrigins = [
  process.env.FRONTEND_URL as string,
  process.env.FRONTEND_DEPLOYED_URL as string,
];

console.log(allowedOrigins);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use(morgan("common"));
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/price", priceRoutes);

app.get("/", (req, res) => {
  res.json({ message: "Nexora API running" });
});

app.listen(PORT, "0.0.0.0", async () => {
  console.log(`Server running on port ${PORT}`);
  await startPriceSimulator();
  startHistoryCleanup();
});
