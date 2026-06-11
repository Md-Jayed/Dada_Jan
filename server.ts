import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Add a generic API health endpoint or API proxies if needed
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Configure Vite as middleware in non-production mode
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);

    // Dynamic wildcard fallback for non-production SPA routing (e.g. reload on /product/xxx doesn't fail with 404)
    app.get("*", async (req, res, next) => {
      const url = req.originalUrl;
      // Skip API and files containing dot extensions
      if (url.startsWith('/api') || url.includes('.')) {
        return next();
      }
      try {
        const fs = await import('fs');
        let template = fs.readFileSync(path.resolve(process.cwd(), "index.html"), "utf-8");
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ "Content-Type": "text/html" }).end(template);
      } catch (e) {
        next(e);
      }
    });
  } else {
    // In production mode, serve compiled assets and route fallback
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server booting and running on http://localhost:${PORT}`);
  });
}

startServer();
