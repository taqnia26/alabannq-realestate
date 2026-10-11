import app from "./app";
import { logger } from "./lib/logger";
import { uploadsDir } from "./lib/siteImages";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

try {
  uploadsDir();
} catch {
  logger.error("Image upload is disabled: UPLOADS_DIR must be an absolute path outside the API build output.");
}

app.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");
});
