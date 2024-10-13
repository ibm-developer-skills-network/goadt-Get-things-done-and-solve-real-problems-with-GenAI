import express, { Application } from 'express';
import path from 'path';
import coffeeRoutes from './routes/coffeeRoutes';

const app: Application = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON
app.use(express.json());

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
app.use('/api/coffees', coffeeRoutes);

// Handle undefined routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});