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
exports.UserSercice = void 0;
const userModel_1 = __importDefault(require("../models/userModel")); // Adjust the import path as necessary
const subscribersModel_1 = __importDefault(require("../models/subscribersModel"));
const challengeModel_1 = __importDefault(require("../models/challengeModel"));
class UserSercice {
    createUser(userData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield userModel_1.default.create(userData);
                return user;
            }
            catch (error) {
                throw new Error(`Error creating user: ${error.message}`);
            }
        });
    }
    getUserById(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield userModel_1.default.findById(userId);
                if (!user) {
                    throw new Error('User not found');
                }
                return user;
            }
            catch (error) {
                throw new Error(`Error fetching user by ID: ${error.message}`);
            }
        });
    }
    getUserByEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield userModel_1.default.findOne({ email });
                if (!user) {
                    throw new Error('User not found');
                }
                return user;
            }
            catch (error) {
                throw new Error(`Error fetching user by email: ${error.message}`);
            }
        });
    }
    updateUser(userId, updateData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield userModel_1.default.findByIdAndUpdate(userId, updateData, { new: true });
                if (!user) {
                    throw new Error('User not found');
                }
                return user;
            }
            catch (error) {
                throw new Error(`Error updating user: ${error.message}`);
            }
        });
    }
    deleteUser(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield userModel_1.default.findByIdAndDelete(userId);
                if (!user) {
                    throw new Error('User not found');
                }
                return user;
            }
            catch (error) {
                throw new Error(`Error deleting user: ${error.message}`);
            }
        });
    }
    getAdmins() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const admins = yield userModel_1.default.find({ userRole: 'admin', status: 'active' });
                return admins;
            }
            catch (error) {
                throw new Error(`Error fetching admins: ${error.message}`);
            }
        });
    }
    getWebsiteData() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const [totalUsers, totalChallenges, totalSubscribers] = yield Promise.all([
                    userModel_1.default.countDocuments(),
                    challengeModel_1.default.countDocuments(),
                    subscribersModel_1.default.countDocuments()
                ]);
                return {
                    usersCount: totalUsers + totalSubscribers,
                    challengeCount: totalChallenges,
                    year: 2,
                    countriesCount: 1
                };
            }
            catch (error) {
                throw new Error(`Error fetching website data: ${error.message}`);
            }
        });
    }
}
exports.UserSercice = UserSercice;
