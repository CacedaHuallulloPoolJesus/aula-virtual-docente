import { config } from "dotenv";
import path from "path";

config({
  path: path.join(process.cwd(), ".env"),
  override: true,
  quiet: true,
});
