import path from 'path';
import { Request, Response } from 'express';
import { getScanImageGraphState, updateScanImageGraphState, runScanImageGraphState } from '../graph';


export const admin = async (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'admin.html'));
};

export const confirmSale = async (req: Request, res: Response) => {
  const { salePercentage } = req.body;

  await updateScanImageGraphState({ salePercentage });
  await runScanImageGraphState();

  console.log('SALE ON');
  res.status(200).json({});
};

export const cancelSale = async (req: Request, res: Response) => {
  await updateScanImageGraphState({ salePercentage: 0 });
  await runScanImageGraphState();

  console.log('SALE OFF');
  res.status(200).json({});
};

export const saleInfo = async (req: Request, res: Response) => {
  const currState = await getScanImageGraphState();

  if (currState.createdAt && currState.next.includes('stepStartSale')) {
    res.status(200).json(currState.values);
  } else {
    res.status(404).json({message: 'no sale found'});
  }
};
