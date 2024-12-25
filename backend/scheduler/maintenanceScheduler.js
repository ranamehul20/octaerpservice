import cron  from 'node-cron';
import {generateBills,findOverdueMaintenanceBills} from '../controllers/MaintenanceController.js';

// Schedule the task to run on the 1st of every month at midnight
export const runTask = () =>{
    cron.schedule('0 0 1 * *', async () => {
        console.log('Running maintenance bill generation job on the 1st of every month');
        
        // Call the controller method to generate maintenance bills
        await generateBills();
    },{
        timezone: "Asia/Kolkata"  // Replace with your timezone
    });
      
};

// Schedule the task to run on the 1st of every month at midnight
export const runOverDueTask = () =>{
    cron.schedule('0 0 * * *', async () => {
        console.log('Running Check Maintainace Amount Panelty job on the every day once per day');
        
        // Call the controller method to generate maintenance bills
        await findOverdueMaintenanceBills();
    },{
        timezone: "Asia/Kolkata"  // Replace with your timezone
    });
      
};