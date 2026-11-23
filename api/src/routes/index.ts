import { Router } from "express";

import { authRoutes } from "./authRoutes";

const routes = Router();

routes.use("/auth", authRoutes);

routes.get("/health", (_request, response) => {
  response.status(200).json({
    status: "ok",
    message: "API funcionando",
  });
});

export { routes };
