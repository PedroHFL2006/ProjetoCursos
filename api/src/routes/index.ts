import { Router } from "express";

import { authRoutes } from "./authRoutes";
import { userRoutes } from "./userRoutes";

const routes = Router();

routes.use("/auth", authRoutes);
routes.use("/usuarios", userRoutes);

routes.get("/health", (_request, response) => {
  response.status(200).json({
    status: "ok",
    message: "API funcionando",
  });
});

export { routes };
