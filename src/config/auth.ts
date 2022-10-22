import dotenv from "dotenv"
import { resolve } from "path";

dotenv.config({ path: resolve(__dirname, "..", "..", ".env") });

export default {
  jwt: {
    secret: process.env.JWT_SECRET as string,
    expiresIn: '1d'
  }
}
