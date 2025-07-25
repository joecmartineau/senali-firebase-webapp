import express from 'express';
import path from 'path';
import cors from 'cors';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

// Enable CORS for all routes
app.use(cors());

// Parse JSON bodies
app.use(express.json());

// Serve static files from dist/public
app.use(express.static(path.join(__dirname, 'dist/public')));

// Mock API endpoints for local development
app.get('/api/children', (req, res) => {
  // Return demo family profiles
  res.json([
    {
      id: 'demo-1',
      childName: 'Emma',
      age: '8',
      relationshipToUser: 'child',
      medicalDiagnoses: 'ADHD',
      userId: 'demo-user'
    },
    {
      id: 'demo-2', 
      childName: 'Jake',
      age: '5',
      relationshipToUser: 'child',
      medicalDiagnoses: 'Autism',
      userId: 'demo-user'
    }
  ]);
});

app.post('/api/children/create', (req, res) => {
  const newProfile = {
    id: `demo-${Date.now()}`,
    ...req.body,
    userId: 'demo-user'
  };
  console.log('Created profile:', newProfile);
  res.status(201).json(newProfile);
});

app.delete('/api/children/:id/delete', (req, res) => {
  console.log('Deleted profile:', req.params.id);
  res.json({ success: true });
});

app.post('/api/chat', (req, res) => {
  const { message } = req.body;
  res.json({
    message: `Hi! I'm Senali, your AI parenting coach. I understand you said: "${message}". How can I support you today?`,
    timestamp: new Date().toISOString()
  });
});

// Serve index.html for all other routes (SPA routing)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/public/index.html'));
});

app.listen(port, '0.0.0.0', () => {
  console.log(`🔥 Senali running on http://localhost:${port}`);
  console.log('📱 Open this URL to test the app locally');
});