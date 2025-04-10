import moment from "moment";
import { success, errors, validation,maintainanceAmount } from "../utils/common.js";
import { ChangeLogs } from "../models/ChangeLogs.js";
import axios from "axios";
import { MaintenanceBill } from "../models/MaintenanceBill.js";
import {Payment} from "../models/Payment.js";
import Schema from "mongoose";
import crypto from "crypto";

export const createOrder = async (req, res, next) => {
    try {
        // Define the API endpoint and credentials
        const API_URL = process.env.RAZORPAY_ORDER_URL;
        const keyId = process.env.RAZORPAY_KEY_ID;
        const keySecret = process.env.RAZORPAY_SECRET_KEY;
        const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");
        const AUTHORIZATION = "Basic "+auth;
        const maintaince = await MaintenanceBill.findById(Schema.Types.ObjectId.createFromHexString(req.params.id)).populate('userId').populate('houseNumber').populate('societyId');
        if (!maintaince) {
          // await session.commitTransaction();
          res.status(500).json(errors("Maintenance details not found", res.statusCode));
          return next();
        }
        console.log("maintaince",maintaince);
        if(maintaince.status=="paid"){
            res.status(500).json(errors("Maintenance already paid", res.statusCode));
            return next();
        }
        let totalAmount=maintainanceAmount(maintaince);
        const razorpayFee = (totalAmount*process.env.RAZORPAY_FEE_PERCENT)/100;
        const gstOnFee = (razorpayFee*process.env.RAZORPAY_GST_PERCENT)/100;
        totalAmount= totalAmount+razorpayFee + gstOnFee;
  
        // Define the payload
        const data = {
            amount: totalAmount * 100, // Amount in smallest currency unit (e.g., paise for INR)
            currency: "INR",
            transfers: [
                {
                    account: maintaince.societyId.razorpayData.accountId,
                    amount: totalAmount * 100,
                    currency: "INR",
                    notes: {
                        branch: maintaince.societyId.name,
                        name: maintaince.societyId.contactPerson.name,
                    },
                    linked_account_notes: ["branch"],
                    on_hold: 0,
                },
            ],
        };

        // Make the POST request
        console.log("api url",API_URL);
        console.log("data",data);
        const response = await axios.post(API_URL, data, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: AUTHORIZATION,
                },
            });
            console.log("Order Created Successfully:", response.data);
                maintaince.razorpayOrderId=response.data.id;
                console.log("maintaince",maintaince);
                await maintaince.save();
                res
                .status(200)
                .json(success("Order Created Successfully", response.data, res.statusCode));
                return next();
    } catch (error) {
        console.error("Error Creating Order:", error.response?.data || error.message);
        res.status(500).json(errors(error.message, res.statusCode));
        return next(error);
    }
};

export const confirmPayment = async (req,res,next) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature,maintaince_id } = req.body;

        // Validate if all required fields are present
        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({ message: "Missing required payment details" });
        }
        const maintaince = await MaintenanceBill.findById(Schema.Types.ObjectId.createFromHexString(maintaince_id)).populate('userId').populate('houseNumber').populate('societyId');
        if (!maintaince) {
          // await session.commitTransaction();
          res.status(500).json(errors("Maintenance details not found", res.statusCode));
          return next();
        }
        if(maintaince.status=="paid"){
          res.status(500).json(errors("Maintenance already paid", res.statusCode));
          return next();
        }
        if(maintaince.razorpayOrderId!=razorpay_order_id){
          res.status(500).json(errors("Maintenance details not found", res.statusCode));
          return next();
        }

        console.log("maintaince",maintaince);

        const keySecret = process.env.RAZORPAY_SECRET_KEY;

        // Generate expected signature
        const generatedSignature = crypto
            .createHmac("sha256", keySecret)
            .update(razorpay_order_id + "|" + razorpay_payment_id)
            .digest("hex");

        // Compare with the received signature
        if (generatedSignature !== razorpay_signature) {
            return res.status(400).json({ message: "Invalid payment signature" });
        }

        let totalAmount=maintainanceAmount(maintaince);
        const razorpayFee = (totalAmount*process.env.RAZORPAY_FEE_PERCENT)/100;
        const gstOnFee = (razorpayFee*process.env.RAZORPAY_GST_PERCENT)/100;
        totalAmount= totalAmount+razorpayFee + gstOnFee;

        const payment = new Payment({
            maintenanceBillId: maintaince._id, 
            userId:maintaince.userId, 
            amountPaid: totalAmount, 
            paymentStatus: "success", 
            paymentMode: "online",
            razorpayOrderId:razorpay_order_id,
            razorpayPaymentId:razorpay_payment_id
        });
        await payment.save();
        
        // Update payment status in database
        maintaince.status="paid";
        maintaince.paymentId=payment._id;
        await maintaince.save();
        return res.status(200).json({ message: "Payment verified successfully" });
    } catch (error) {
        console.log("Error verifying payment:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const payMaintenanceCash = async (req, res) => {
    try {
        const { maintenanceBillId, amountPaid } = req.body;
        const userId=req.user._id;
        // Validate request
        if (!maintenanceBillId || !amountPaid) {
            return res.status(400).json(errors("Missing required fields",res.statusCode));
        }

        // Find the maintenance bill
        const bill = await MaintenanceBill.findById(maintenanceBillId);
        if (!bill) {
            return res.status(400).json(errors("Maintenance bill not found",res.statusCode));
        }

        // Check if the bill is already paid
        if (bill.status === "paid") {
            return res.status(400).json(errors("Bill is already paid",res.statusCode));
        }

        // Ensure the paid amount matches the bill amount
        if (amountPaid !== bill.totalAmount) {
            return res.status(400).json(errors("Incorrect payment amount",res.statusCode));
        }

        // Create a payment record
        const payment = new Payment({
            maintenanceBillId,
            userId,
            amountPaid,
            paymentMode: "cash",
            paymentStatus: "success",
        });
        await payment.save();

        // Update bill status to paid
        bill.status = "paid";
        bill.paymentId = payment._id;
        await bill.save();

        return res.status(200).json({
            success: true,
            message: "Maintenance fee paid successfully via cash",
            payment,
        });
    } catch (error) {
        console.error("Error processing cash payment:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};