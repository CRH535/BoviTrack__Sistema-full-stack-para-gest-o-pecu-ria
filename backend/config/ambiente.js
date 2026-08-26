const dotenv = require("dotenv");

dotenv.config();

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET não foi configurado no arquivo .env");
}

