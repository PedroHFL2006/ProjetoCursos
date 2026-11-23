import { Router } from "express";

const routes = Router();

routes.get("/health", (_request, response) => {
  response.status(200).json({
    status: "ok",
    message: "API funcionando",
  });
});

export { routes };
