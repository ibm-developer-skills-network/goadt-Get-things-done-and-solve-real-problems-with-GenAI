import cron from 'node-cron';
import express, { Application } from 'express';
import path from 'path';
import coffeeRoutes from './routes/coffeeRoutes';
import { runScanImageGraph } from './graph';


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


import { setCoffeePrice } from './controllers/coffeeController';


// Schedule a task to run every minute
cron.schedule('* * * * *', async () => {
    console.log('Task is running every minute');
    const results = await runScanImageGraph();

    console.log("RESULTS ARE");
    console.log(results);

    if (results.numPeople > 20) {
      console.log("More than 20 people found - initiating sale");
      setCoffeePrice(0.7);
    }
});



