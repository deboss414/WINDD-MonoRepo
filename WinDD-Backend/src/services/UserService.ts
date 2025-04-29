import { User, IUser } from '../models/user';
import { Types } from 'mongoose';

interface UserSearchResult {
  exists: boolean;
  user?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  message?: string;
}

// Define the shape of a lean user document
interface LeanUserDocument {
  _id: Types.ObjectId;
  email: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class UserService {
  async findUserByEmail(email: string): Promise<UserSearchResult> {
    try {
      // Get the document without mongoose methods
      const user = await User.findOne({ email }).lean<LeanUserDocument>();
      
      if (!user) {
        return {
          exists: false,
          message: "User needs to be registered first"
        };
      }

      // Now TypeScript knows the exact shape of user
      return {
        exists: true,
        user: {
          _id: user._id.toString(),
          firstName: user.firstName || 'Unknown',
          lastName: user.lastName || 'User',
          email: user.email
        }
      };
    } catch (error: any) {
      console.error('Error searching for user:', error);
      throw new Error('Error searching for user');
    }
  }
} 