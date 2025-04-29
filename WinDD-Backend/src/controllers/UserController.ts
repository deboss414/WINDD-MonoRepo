import { Request, Response } from 'express';
import { UserService } from '../services/UserService';

const userService = new UserService();

export class UserController {
  async searchUserForParticipant(req: Request, res: Response) {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ message: 'Email is required' });
      }
      
      const result = await userService.findUserByEmail(email);
      res.status(200).json(result);
    } catch (error) {
      console.error('Error in searchUserForParticipant:', error);
      res.status(500).json({ message: 'Error searching for user' });
    }
  }
} 