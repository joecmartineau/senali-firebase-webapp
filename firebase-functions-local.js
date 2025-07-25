import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

// Mock family profiles API endpoints
app.get('/api/children', (req, res) => {
  console.log('GET /api/children called');
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
  console.log('POST /api/children/create called with:', req.body);
  const newProfile = {
    id: `demo-${Date.now()}`,
    ...req.body,
    userId: 'demo-user'
  };
  res.status(201).json(newProfile);
});

app.delete('/api/children/:id/delete', (req, res) => {
  console.log('DELETE /api/children/:id/delete called for ID:', req.params.id);
  res.json({ success: true });
});

app.post('/api/chat', (req, res) => {
  const { message } = req.body;
  res.json({
    message: `Hi! I'm Senali. I understand you said: "${message}". How can I support you today?`,
    timestamp: new Date().toISOString()
  });
});

// Start server
const port = 8081;
app.listen(port, '0.0.0.0', () => {
  console.log(`🔥 Firebase Functions emulator running on port ${port}`);
  console.log('API endpoints:');
  console.log('  GET /api/children');
  console.log('  POST /api/children/create');
  console.log('  DELETE /api/children/:id/delete');
  console.log('  POST /api/chat');
});