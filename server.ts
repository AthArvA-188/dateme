import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API routes FIRST
  app.post("/api/notify", async (req, res) => {
    const { activity, date, time, dressCode, dietary } = req.body;
    const webhookUrl = process.env.WEBHOOK_URL;
    
    console.log("Received proposal notification:", req.body);

    if (webhookUrl) {
      try {
        await fetch(webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content: `🎉 **New Date Proposal Accepted!** 🎉\n\n**Activity:** ${activity}\n**When:** ${date} @ ${time}\n**Dress Code:** ${dressCode}\n**Notes:** ${dietary || 'None'}`
          })
        });
      } catch (e) {
        console.error("Failed to send webhook", e);
      }
    }

    res.json({ success: true });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    // Express v4 wildcard
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
