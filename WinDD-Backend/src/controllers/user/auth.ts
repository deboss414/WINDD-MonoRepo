import { Request, Response } from 'express';
import { authService } from '../../services/user/auth';

class AuthController {
  async login(req: Request, res: Response) {
    try {
      console.log('Login request received:', { email: req.body.email });
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ 
          error: 'Email and password are required',
          code: 'MISSING_CREDENTIALS'
        });
      }

      const result = await authService.login(email, password);
      console.log('Login successful for email:', email);
      res.json(result);
    } catch (error: any) {
      console.error('Login error:', {
        email: req.body.email,
        error: error.message,
        stack: error.stack
      });
      
      res.status(401).json({ 
        error: error.message || 'Invalid credentials',
        code: 'INVALID_CREDENTIALS'
      });
    }
  }

  async register(req: Request, res: Response) {
    try {
      console.log('Register request received:', req.body);
      const { email, password, name } = req.body;
      const result = await authService.register(email, password, name);
      console.log('Registration successful:', result);
      res.json(result);
    } catch (error) {
      console.error('Registration error:', error);
      res.status(400).json({ error: 'Registration failed' });
    }
  }

  async logout(req: Request, res: Response) {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (token) {
        await authService.logout(token);
      }
      res.json({ message: 'Logged out successfully' });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({ error: 'Logout failed' });
    }
  }
}

export const authController = new AuthController(); 