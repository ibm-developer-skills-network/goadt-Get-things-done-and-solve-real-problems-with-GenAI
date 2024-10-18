import { Request, Response } from 'express';

// Mock data for coffees
const coffees = [
  { id: 1, name: 'Espresso', price: 3 },
  { id: 2, name: 'Latte', price: 4 },
  { id: 3, name: 'Cappuccino', price: 4.5 },
  { id: 4, name: 'Americano', price: 3.5 }
];

// Get all coffees
export const getCoffees = (req: Request, res: Response) => {
  res.json(coffees);
};

// Set the coffee prices
export const setCoffeePrice = (amount = 1) => {
  coffees[0].price = 3 * amount;
  coffees[1].price = 4 * amount;
  coffees[2].price = 4.5 * amount;
  coffees[3].price = 3.5 * amount;
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
export const processOrder = (req: Request, res: Response) => {
  const order = req.body;

  // Here you would typically process the order,
  // e.g., save it to a database, perform validations, etc.
  // Since this is a mocked app, we'll assume it's always successful.

  console.log('Received Order:', order);

  res.status(200).json({
    message: 'Order processed successfully',
    orderId: Math.floor(Math.random() * 1000000) // Mock order ID
  });
};