"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const cloudinary_1 = require("cloudinary");
const stream_1 = require("stream");
class AuthService {
    comparePassword(password, hashedPassword) {
        return __awaiter(this, void 0, void 0, function* () {
            return bcryptjs_1.default.compare(password, hashedPassword);
        });
    }
    uploadFile(file) {
        return __awaiter(this, void 0, void 0, function* () {
            // Upload file to Cloudinary and return the URL
            const result = yield new Promise((resolve, reject) => {
                const uploadStream = cloudinary_1.v2.uploader.upload_stream({ resource_type: "auto" }, (error, result) => {
                    if (error) {
                        return reject(new Error(`Cloudinary upload error: ${error.message}`));
                    }
                    if (!result) {
                        return reject(new Error("Cloudinary upload failed: result is undefined."));
                    }
                    resolve(result.secure_url);
                });
                const readableStream = new stream_1.Readable();
                readableStream.push(file.buffer);
                readableStream.push(null);
                readableStream.pipe(uploadStream);
            });
            return result;
        });
    }
}
exports.AuthService = AuthService;
