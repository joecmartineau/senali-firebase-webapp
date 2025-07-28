import express from "express";
import { setupVite, serveStatic, log } from "./vite";
import { createServer } from "http";
import chatRoutes from "./routes/chat";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Add essential API routes
app.use('/api', chatRoutes);

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'Server is working!' });
});

// Basic auth routes for frontend compatibility
app.post('/api/auth/firebase-signin', (req, res) => {
  res.json({ success: true, user: { hasCompletedProfile: true } });
});

app.get('/api/user/credits', (req, res) => {
  res.json({ credits: 25, totalPurchased: 0 });
});

const httpServer = createServer(app);

(async () => {
  // Setup Vite for development
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, httpServer);
  } else {
    serveStatic(app);
  }

  const port = parseInt(process.env.PORT || '5000', 10);
  httpServer.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();