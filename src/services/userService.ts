import User from '../models/userModel'; // Adjust the import path as necessary

export class UserSercice {

    async createUser(userData: any): Promise<any> {
        try {
            const user = await User.create(userData);
            return user;
        } catch (error) {
            throw new Error(`Error creating user: ${(error as Error).message}`);
        }
    }

    async getUserById(userId: string): Promise<any> {
        try {
            const user = await User.findById(userId);
            if (!user) {
                throw new Error('User not found');
            }
            return user;
        } catch (error) {
            throw new Error(`Error fetching user by ID: ${(error as Error).message}`);
        }
    }

    async getUserByEmail(email: string): Promise<any> {
        try {
            const user = await User.findOne({ email });
            if (!user) {
                throw new Error('User not found');
            }
            return user;
        } catch (error) {
            throw new Error(`Error fetching user by email: ${(error as Error).message}`);
        }
    }

    async updateUser(userId: string, updateData: any): Promise<any> {
        try {
            const user = await User.findByIdAndUpdate(userId, updateData, { new: true });
            if (!user) {
                throw new Error('User not found');
            }
            return user;
        } catch (error) {
            throw new Error(`Error updating user: ${(error as Error).message}`);
        }
    }

    async deleteUser(userId: string): Promise<any> {
        try {
            const user = await User.findByIdAndDelete(userId);
            if (!user) {
                throw new Error('User not found');
            }
            return user;
        } catch (error) {
            throw new Error(`Error deleting user: ${(error as Error).message}`);
        }
    }

    async getAdmins(): Promise<any> {
        try {
            const admins = await User.find({ userRole: 'admin', status: 'active' });
            return admins;
        } catch (error) {
            throw new Error(`Error fetching admins: ${(error as Error).message}`);
        }
    }
}