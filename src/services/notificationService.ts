import Notification from "../models/notificationModel";
import WebSocketHandler from "../websocket/webSocketHandler";



export class NoticationSercice {

    private webSocketHandler: WebSocketHandler;

    constructor(webSocketHandler: WebSocketHandler) {
        this.webSocketHandler = webSocketHandler;
    }

    async getAllNotifications(filters: { userId: string; status?: string }): Promise<any> {
        try {
            const query: any = { userId: filters.userId };
            if (filters.status) {
                query.status = filters.status;
            }

            const notifications = await Notification.find(query);
            if (!notifications) {
                throw new Error("No notifications found for user");
            }
            notifications.sort((a: any, b: any) => b.timestamp - a.timestamp); // Sort by timestamp in descending order
            return notifications;
        } catch (error) {
            throw new Error(`Error fetching notifications in service: ${(error as Error).message}`);
        }
    }

    async getNotificationById(notificationId: string): Promise<any> {
        try {
            const notification = await Notification.findById(notificationId);
            if (!notification) {
                throw new Error("Notification not found");
            }
            return notification;
        } catch (error) {
            throw new Error(`Error fetching single notification: ${(error as Error).message}`);
        }
    }

    async createNotification(notificationData: any): Promise<any> {
        try {
            const newNotification = await Notification.create(notificationData);

            this.webSocketHandler.sendMessageToAllClients('New notification created');

            return newNotification;
        } catch (error) {
            throw new Error(`Error creating notification: ${(error as Error).message}`);
        }
    }
    async updateNotification(notificationId: string, status: string): Promise<any> {
        try {
            const updatedNotification = await Notification.findByIdAndUpdate(
                notificationId, // Pass the notificationId directly
                { status }, // Update the status to 'read', 
                { new: true } // Ensure the updated document is returned
            );
            if (!updatedNotification) {
                throw new Error("Notification not found");
            }
            return updatedNotification;
        } catch (error) {
            throw new Error(`Error updating notification in service: ${(error as Error).message}`);
        }
    }


    async deleteNotification(notificationId: string): Promise<any> {
        try {
            const deletedNotification = await Notification.findByIdAndDelete(notificationId);
            if (!deletedNotification) {
                throw new Error("Notification not found");
            }
            return { message: "Notification deleted successfully" };
        } catch (error) {
            throw new Error(`Error deleting notification in service: ${(error as Error).message}`);
        }
    }

    async deleteAllNotifications(userId: string): Promise<any> {
        try {
            const result = await Notification.deleteMany({ userId });
            return { message: `${result.deletedCount} notifications deleted successfully` };
        } catch (error) {
            throw new Error(`Error deleting notifications in service: ${(error as Error).message}`);
        }
    }

    async readAllNotifications(userId: string): Promise<any> {
        try {
            const result = await Notification.updateMany(
                { userId, status: { $ne: "read" } }, // Find notifications that are not already read
                { $set: { status: "read" } } // Update their status to "read"
            );
            return { message: `${result.modifiedCount} notifications marked as read` };
        } catch (error) {
            throw new Error(`Error marking notifications as read in service: ${(error as Error).message}`);
        }
    }

    async unreadAllNotifications(userId: string): Promise<any> {
        console.log("line 106: ", userId);
        try {
            const result = await Notification.updateMany(
                { userId, status: { $ne: "unread" } }, // Find notifications that are not already read
                { $set: { status: "unread" } } // Update their status to "unread"
            );
            return { message: `${result.modifiedCount} notifications marked as unread` };
        } catch (error) {
            throw new Error(`Error marking notifications as unread in service: ${(error as Error).message}`);
        }
    }
}