import express from 'express';
import { getCoffees, getCoffeeById, processOrder } from '../controllers/coffeeController';

const router = express.Router();

// Get all coffees
router.get('/', getCoffees);

// Get a single coffee by ID
router.get('/:id', getCoffeeById);

// Process an order
router.post('/orders', processOrder);

export default router;