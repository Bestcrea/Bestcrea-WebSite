/**
 * Passenger / Hostinger entry for Next.js.
 *
 * Build:  npm ci && npx prisma generate && npm run build
 * Start:  NODE_ENV=production node server.js
 *
 * On Hostinger Node.js (Passenger), set Application startup file to: server.js
 * and configure environment variables in the panel (see DEPLOY.md).
 */
const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");

const dev = process.env.NODE_ENV !== "production";
const hostname = process.env.HOST || process.env.HOSTNAME || "0.0.0.0";
const port = Number(process.env.PORT || 3000);

// Passenger injects a global when present.
const passenger = global.PhusionPassenger;
const usePassenger = typeof passenger !== "undefined";

if (usePassenger) {
  passenger.configure({ autoInstall: false });
}

const app = next({
  dev,
  hostname: usePassenger ? "localhost" : hostname,
  port: usePassenger ? 0 : port,
  dir: __dirname,
});
const handle = app.getRequestHandler();

app
  .prepare()
  .then(() => {
    const server = createServer(async (req, res) => {
      try {
        const parsedUrl = parse(req.url, true);
        await handle(req, res, parsedUrl);
      } catch (error) {
        console.error("server.js error", req.url, error);
        res.statusCode = 500;
        res.end("internal server error");
      }
    });

    if (usePassenger) {
      server.listen("passenger", () => {
        console.log("> Bestcrea ready (Passenger)");
      });
    } else {
      server.listen(port, hostname, () => {
        console.log(`> Bestcrea ready on http://${hostname}:${port}`);
      });
    }
  })
  .catch((error) => {
    console.error("Failed to start Next.js server", error);
    process.exit(1);
  });
