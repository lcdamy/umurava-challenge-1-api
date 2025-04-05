import Notification from "../models/notificationModel";


export class NoticationSercice {

    async getAllNotifications(filters: { userId: string; status?: string }): Promise<any> {
        try {
            const query: any = { userId: filters.userId };
            if (filters.status) {
                query.status = filters.status;
            }

            const notifications = await Notification.find(query);
            if (!notifications || notifications.length === 0) {
                throw new Error("No notifications found for user");
            }
            notifications.sort((a: any, b: any) => b.timestamp - a.timestamp); // Sort by timestamp in descending order
            return notifications;
        } catch (error) {
            throw new Error(`Error fetching notifications: ${(error as Error).message}`);
        }
    }

    async createNotification(notificationData: any): Promise<any> {
        try {
            const newNotification = await Notification.create(notificationData);
            return newNotification;
        } catch (error) {
            throw new Error(`Error creating notification: ${(error as Error).message}`);
        }
    }

    async updateNotification(notificationId: string, updateData: any): Promise<any> {
        try {
            const updatedNotification = await Notification.findByIdAndUpdate(notificationId, updateData, { new: true });
            if (!updatedNotification) {
                throw new Error("Notification not found");
            }
            return updatedNotification;
        } catch (error) {
            throw new Error(`Error updating notification: ${(error as Error).message}`);
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
            throw new Error(`Error deleting notification: ${(error as Error).message}`);
        }
    }

}