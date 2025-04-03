import bcrypt from "bcryptjs";

export class AuthService {

    async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
        return bcrypt.compare(password, hashedPassword);
    }



}
