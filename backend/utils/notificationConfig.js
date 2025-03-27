import { Notification } from '../models/Notification.js';
import firebaseApp from '../utils/firebaseConfig.js';

export const sendMaintainceDueNotification = async (maintaince) => {
    const deviceTokens = [];
    const notificationReq = new Notification({
        title: 'Maintenance Due Reminder',
        description: `This is a reminder that your maintenance dues are due on ${maintaince.dueDate.toDateString()}.\n\nPlease ensure timely payment.\n\nThank you!`,
        fcmToken: maintaince.userId.fcmToken ?? '',
        category: "Maintenance",
        refId: maintaince._id,
        userId: maintaince.userId._id,
        createdBy: req.user._id,
    });
    await notificationReq.save();
    deviceTokens.push(maintaince.userId.fcmToken);
    const message = {
        notification: {
            title: 'Maintenance Due Reminder',
            body: `This is a reminder that your maintenance dues are due on ${maintaince.dueDate.toDateString()}.\n\nPlease ensure timely payment.\n\nThank you!`,
        },
        tokens: deviceTokens,
    };
    const response = await firebaseApp.messaging().sendEachForMulticast(message);
    console.log("Successfully sent message:", response);
};