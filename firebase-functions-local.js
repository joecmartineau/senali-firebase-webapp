import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

// In-memory storage for family profiles
let familyProfiles = [];
let profileIdCounter = 1;

// Mock family profiles API endpoints
app.get('/api/children', (req, res) => {
  console.log('GET /api/children called');
  res.json(familyProfiles);
});

app.post('/api/children/create', (req, res) => {
  console.log('POST /api/children/create called with:', req.body);
  const newProfile = {
    id: `profile-${profileIdCounter++}`,
    ...req.body,
    userId: 'demo-user'
  };
  familyProfiles.push(newProfile);
  console.log('Profile created. Total profiles:', familyProfiles.length);
  res.status(201).json(newProfile);
});

app.delete('/api/children/:id/delete', (req, res) => {
  const profileId = req.params.id;
  console.log('DELETE /api/children/:id/delete called for ID:', profileId);
  
  const initialLength = familyProfiles.length;
  familyProfiles = familyProfiles.filter(profile => profile.id !== profileId);
  const deleted = familyProfiles.length < initialLength;
  
  console.log(`Profile deletion ${deleted ? 'successful' : 'failed'}. Remaining profiles:`, familyProfiles.length);
  res.json({ success: deleted });
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