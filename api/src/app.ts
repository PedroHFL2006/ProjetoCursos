import cors from "cors";
import express from "express";
import swaggerUi from "swagger-ui-express";

import { swaggerDocument } from "./config/swagger";
import { errorHandler } from "./middlewares/errorHandler";
import { routes } from "./routes";

const app = express();

app.use(cors());
app.use(express.json());

// Documentação Swagger interativa em /docs
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use(routes);
app.use(errorHandler);

export { app };
