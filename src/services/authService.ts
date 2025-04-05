import bcrypt from "bcryptjs";
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from "stream";

export class AuthService {

    async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
        return bcrypt.compare(password, hashedPassword);
    }



    async uploadFile(file: Express.Multer.File): Promise<string> {
        // Upload file to Cloudinary and return the URL
        const result = await new Promise<string>((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream({ resource_type: "auto" }, (error, result) => {
                if (error) {
                    return reject(new Error(`Cloudinary upload error: ${error.message}`));
                }
                if (!result) {
                    return reject(new Error("Cloudinary upload failed: result is undefined."));
                }
                resolve(result.secure_url);
            });
            const readableStream = new Readable();
            readableStream.push(file.buffer);
            readableStream.push(null);
            readableStream.pipe(uploadStream);
        });
        return result;
    }



}
