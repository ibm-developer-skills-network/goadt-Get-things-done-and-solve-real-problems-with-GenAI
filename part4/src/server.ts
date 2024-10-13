import cron from 'node-cron';
import express, { Application } from 'express';
import path from 'path';
import coffeeRoutes from './routes/coffeeRoutes';
import adminRoutes from './routes/adminRoutes';

import bodyParser from 'body-parser';

import { runScanImageGraphState } from './graph';

const app: Application = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));

// Middleware to parse JSON
app.use(express.json());

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
app.use('/api/coffees', coffeeRoutes);

// Admin Routes
app.use('/admin', adminRoutes);

// Handle undefined routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});

const checkSale = async () => {
  console.log('Task is running every minute');
  const initialInput = {};
  await runScanImageGraphState(initialInput);
}

// Schedule a task to run every minute
cron.schedule('* * * * *', checkSale);
