import { Request, Response } from 'express';
import { runCoffeeMessageGraph } from '../graph';

// Mock data for coffees
const coffees = [
  { id: 1, name: 'Espresso', price: 3 },
  { id: 2, name: 'Latte', price: 4 },
  { id: 3, name: 'Cappuccino', price: 4.5 },
  { id: 4, name: 'Americano', price: 3.5 }
];

// Set the coffee prices
export const setCoffeePrice = (amount = 1) => {
  coffees[0].price = 3 * amount;
  coffees[1].price = 4 * amount;
  coffees[2].price = 4.5 * amount;
  coffees[3].price = 3.5 * amount;
};

// Get all coffees
export const getCoffees = (req: Request, res: Response) => {
  res.json(coffees);
};

// Get coffee by ID
export const getCoffeeById = (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const coffee = coffees.find(c => c.id === id);
  if (coffee) {
    res.json(coffee);
  } else {
    res.status(404).json({ message: 'Coffee not found' });
  }
};

// Process an order
export const processOrder = async (req: Request, res: Response) => {
  const order = req.body;

  console.log('Received Order:', order);

  const graphOutput = await runCoffeeMessageGraph(order);

  console.log('OUTPUT:', graphOutput);

  // Respond with order confirmation and the generated message
  res.status(200).json({
    message: graphOutput.message,
    orderId: Math.floor(Math.random() * 1000000), // Mock order 
  });
};