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

// Credit purchase endpoint for Play Store
app.post('/api/purchase/credits', (req, res) => {
  try {
    const { productId, purchaseToken, credits, platform } = req.body;
    
    // Get credits amount from product ID
    const productCreditsMap: { [key: string]: number } = {
      'com.senali.credits.100': 100,
      'com.senali.credits.500': 500, 
      'com.senali.credits.1000': 1000
    };
    const productCredits = productCreditsMap[productId] || credits;
    
    console.log(`🛒 ${platform} purchase: ${productId} for ${productCredits} credits`);
    
    // In production, validate purchase token with Google Play Developer API
    if (purchaseToken && platform === 'android_playstore') {
      console.log('Validating purchase token:', purchaseToken);
      // TODO: Implement Google Play purchase verification
    }
    
    // For now, simulate successful purchase
    const newCreditsTotal = 25 + productCredits; // Starting credits + purchased
    
    res.json({ 
      success: true, 
      newCreditsTotal,
      purchasedCredits: productCredits
    });
  } catch (error) {
    console.error('❌ Purchase error:', error);
    res.status(500).json({ error: 'Purchase failed' });
  }
});

// Purchase verification endpoint
app.post('/api/purchase/verify', (req, res) => {
  try {
    const { productId, purchaseToken, orderId, packageName } = req.body;
    
    console.log('🔍 Verifying purchase:', { productId, orderId, packageName });
    
    // In production, this would verify with Google Play Developer API
    // For now, simulate successful verification
    res.json({ 
      success: true,
      verified: true 
    });
  } catch (error) {
    console.error('❌ Verification error:', error);
    res.status(500).json({ error: 'Verification failed' });
  }
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