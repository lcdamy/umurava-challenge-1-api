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
exports.NoticationSercice = void 0;
const notificationModel_1 = __importDefault(require("../models/notificationModel"));
class NoticationSercice {
    getAllNotifications(filters) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const query = { userId: filters.userId };
                if (filters.status) {
                    query.status = filters.status;
                }
                const notifications = yield notificationModel_1.default.find(query);
                if (!notifications || notifications.length === 0) {
                    throw new Error("No notifications found for user");
                }
                notifications.sort((a, b) => b.timestamp - a.timestamp); // Sort by timestamp in descending order
                return notifications;
            }
            catch (error) {
                throw new Error(`Error fetching notifications: ${error.message}`);
            }
        });
    }
    createNotification(notificationData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const newNotification = yield notificationModel_1.default.create(notificationData);
                return newNotification;
            }
            catch (error) {
                throw new Error(`Error creating notification: ${error.message}`);
            }
        });
    }
    updateNotification(notificationId, updateData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const updatedNotification = yield notificationModel_1.default.findByIdAndUpdate(notificationId, updateData, { new: true });
                if (!updatedNotification) {
                    throw new Error("Notification not found");
                }
                return updatedNotification;
            }
            catch (error) {
                throw new Error(`Error updating notification: ${error.message}`);
            }
        });
    }
    deleteNotification(notificationId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const deletedNotification = yield notificationModel_1.default.findByIdAndDelete(notificationId);
                if (!deletedNotification) {
                    throw new Error("Notification not found");
                }
                return { message: "Notification deleted successfully" };
            }
            catch (error) {
                throw new Error(`Error deleting notification: ${error.message}`);
            }
        });
    }
}
exports.NoticationSercice = NoticationSercice;
