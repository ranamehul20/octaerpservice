import schedule from 'node-schedule';
import { generateBills, findOverdueMaintenanceBills } from '../controllers/MaintenanceController.js';
import { MaintenanceBill } from '../models/MaintenanceBill.js';
import { UserDetails } from '../models/UserDetailsModel.js';
import { sendMaintainceDueEmail } from '../utils/mailConfig.js';
import { sendMaintainceDueNotification } from '../utils/notificationConfig.js';

// Schedule the task to run on the 1st of every month at midnight
const billGenerateJob = schedule.scheduleJob('0 0 1 * *', async () => {
    console.log('Job 1: Running maintenance bill generation job on the 1st of every month');
    await generateBills();
});

// Schedule the task to find overdue maintenance bills daily at midnight
const runOverDueTask = schedule.scheduleJob('0 0 * * *', async () => {
    console.log('Job 2: Running Check Maintenance Amount Penalty job daily');
    await findOverdueMaintenanceBills();
});

// Schedule the task to send maintenance notifications daily at 9 AM
const maintenanceNotification = schedule.scheduleJob('0 9 * * *', async () => {
    console.log('Job 3: Running send maintenance notifications at 9 AM job daily');
    const today = new Date();
    const startDate = new Date(today);
    const endDate = new Date(today);
    startDate.setDate(today.getDate() + 1);
    endDate.setDate(today.getDate() + 2);
    
    try {
        const maintenances = await MaintenanceBill.find({
            status: 'pending',
            dueDate: { $gte: startDate, $lte: endDate },
        }).populate('userId').populate('houseNumber');

        for (const maintenance of maintenances) {
            const details = await UserDetails.findOne({ userId: maintenance.userId._id });
            await sendMaintainceDueEmail(
                maintenance.userId.email,
                `${details.firstName} ${details.lastName}`,
                maintenance.dueDate.toDateString()
            );
            await sendMaintainceDueNotification(maintenance);
        }
    } catch (error) {
        console.error('Error checking due dates:', error);
    }
});

// Export a function to initialize all tasks
export const runTask = async () => {
    console.log('Scheduled tasks initialized successfully');
};
