import "dotenv/config";

import { validateJwtConfig } from "./config/jwt";
import { app } from "./app";

const port = Number(process.env.PORT) || 3000;

validateJwtConfig();

app.listen(port, () => {
  console.log(`API iniciada na porta ${port}`);
});
