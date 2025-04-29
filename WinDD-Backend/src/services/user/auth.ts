import { User } from '../../models/user';
import { compare, hash } from 'bcrypt';
import { sign, verify } from 'jsonwebtoken';
import { config } from '../../config';

class AuthService {
  async login(email: string, password: string) {
    try {
      console.log('AuthService: Attempting login for email:', email);
      
      // Find user by email
      const user = await User.findOne({ email });
      console.log('AuthService: User found:', !!user);
      
      if (!user) {
        console.log('AuthService: User not found for email:', email);
        throw new Error('User not found');
      }

      // Compare passwords
      const isValid = await compare(password, user.password);
      console.log('AuthService: Password valid:', isValid);
      
      if (!isValid) {
        console.log('AuthService: Invalid password for email:', email);
        throw new Error('Invalid password');
      }

      // Generate token
      const token = sign({ userId: user._id }, config.JWT_SECRET, { expiresIn: '24h' });
      console.log('AuthService: Token generated successfully');
      
      return { 
        token, 
        user: { 
          id: user._id, 
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          phoneNumber: user.phoneNumber
        } 
      };
    } catch (error: any) {
      console.error('AuthService: Login error:', {
        email,
        error: error.message,
        stack: error.stack
      });
      throw error;
    }
  }

  async register(email: string, password: string, firstName?: string, lastName?: string) {
    try {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        throw new Error('User already exists');
      }

      const hashedPassword = await hash(password, 10);
      const user = new User({ 
        email, 
        password: hashedPassword,
        firstName,
        lastName
      });
      await user.save();

      const token = sign({ userId: user._id }, config.JWT_SECRET, { expiresIn: '24h' });
      return { 
        token, 
        user: { 
          id: user._id, 
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          phoneNumber: user.phoneNumber
        } 
      };
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  async logout(token: string) {
    // In a real application, you might want to add the token to a blacklist
    // or implement token invalidation logic here
    return true;
  }
}

export const authService = new AuthService(); 