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
    constructor(webSocketHandler) {
        this.webSocketHandler = webSocketHandler;
    }
    getAllNotifications(filters) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const query = { userId: filters.userId };
                if (filters.status) {
                    query.status = filters.status;
                }
                const notifications = yield notificationModel_1.default.find(query);
                if (!notifications) {
                    throw new Error("No notifications found for user");
                }
                notifications.sort((a, b) => b.timestamp - a.timestamp); // Sort by timestamp in descending order
                return notifications;
            }
            catch (error) {
                throw new Error(`Error fetching notifications in service: ${error.message}`);
            }
        });
    }
    getNotificationById(notificationId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const notification = yield notificationModel_1.default.findById(notificationId);
                if (!notification) {
                    throw new Error("Notification not found");
                }
                return notification;
            }
            catch (error) {
                throw new Error(`Error fetching single notification: ${error.message}`);
            }
        });
    }
    createNotification(notificationData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const newNotification = yield notificationModel_1.default.create(notificationData);
                this.webSocketHandler.sendMessageToAllClients('New notification created');
                return newNotification;
            }
            catch (error) {
                throw new Error(`Error creating notification: ${error.message}`);
            }
        });
    }
    updateNotification(notificationId, status) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const updatedNotification = yield notificationModel_1.default.findByIdAndUpdate(notificationId, // Pass the notificationId directly
                { status }, // Update the status to 'read', 
                { new: true } // Ensure the updated document is returned
                );
                if (!updatedNotification) {
                    throw new Error("Notification not found");
                }
                return updatedNotification;
            }
            catch (error) {
                throw new Error(`Error updating notification in service: ${error.message}`);
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
                throw new Error(`Error deleting notification in service: ${error.message}`);
            }
        });
    }
    deleteAllNotifications(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield notificationModel_1.default.deleteMany({ userId });
                return { message: `${result.deletedCount} notifications deleted successfully` };
            }
            catch (error) {
                throw new Error(`Error deleting notifications in service: ${error.message}`);
            }
        });
    }
    readAllNotifications(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield notificationModel_1.default.updateMany({ userId, status: { $ne: "read" } }, // Find notifications that are not already read
                { $set: { status: "read" } } // Update their status to "read"
                );
                return { message: `${result.modifiedCount} notifications marked as read` };
            }
            catch (error) {
                throw new Error(`Error marking notifications as read in service: ${error.message}`);
            }
        });
    }
    unreadAllNotifications(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield notificationModel_1.default.updateMany({ userId, status: { $ne: "unread" } }, // Find notifications that are not already read
                { $set: { status: "unread" } } // Update their status to "read"
                );
                return { message: `${result.modifiedCount} notifications marked as unread` };
            }
            catch (error) {
                throw new Error(`Error marking notifications as unread in service: ${error.message}`);
            }
        });
    }
}
exports.NoticationSercice = NoticationSercice;
