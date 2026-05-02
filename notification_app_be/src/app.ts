import express from "express";
import { requestLogger } from "./middleware/requestLogger";
import { errorHandler } from "./middleware/errorHandler";
import notificationRoutes from "./routes/notification.routes";

const app = express();

app.use(express.json());
app.use(requestLogger);

app.use("/notifications", notificationRoutes);

app.use(errorHandler);

export default app;
