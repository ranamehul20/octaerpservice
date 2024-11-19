import express from 'express';
import dotenv from 'dotenv';
dotenv.config();
import {connectDB} from "./db/mongoClient.js";
import UserRoute from "./routes/UserRoutes.js";
import SocietyRoute from "./routes/SocietyRoutes.js";
import SettingRoutes from "./routes/SettingsRoutes.js";
import BlockRoutes from "./routes/BlockRoutes.js";
import HouseRoutes from "./routes/HouseRoutes.js";
import MemberRoutes from "./routes/MemberRoutes.js";
import MaintenanceRoute from "./routes/MaintenanceRoutes.js";
import NoticeRoutes from "./routes/NoticeRoutes.js";
import cors from "cors";
import helmet from "helmet";
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import winston  from 'winston';
import cookieParser from 'cookie-parser';
import {runTask} from './scheduler/maintenanceScheduler.js';

const PORT  = process.env.PORT || 3001 ;
const app = express();
app.use(cookieParser());
//middlewares
// app.use(cors());

// Simulate __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logger = winston.createLogger({
    level: process.env.NODE_ENV === 'production' ? 'error' : 'debug',
    format: winston.format.json(),
    transports: [
      new winston.transports.Console(),
      new winston.transports.File({ filename: 'combined.log' }),
    ],
});

// Serve static files from the React frontend build
// app.use(express.static(path.join(__dirname, '../frontend/build')));

app.use(cors({
    origin: 'http://localhost:3000', // Specify your frontend origin
    credentials: true, // Allow credentials (cookies, authorization headers, etc.)
}));

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(helmet());
// adding morgan to log HTTP requests
app.use(morgan('combined'));

//Database Connection
connectDB();

//Routes
app.use("/api/auth",UserRoute);
app.use("/api/societies",SocietyRoute);
app.use("/api/houses", HouseRoutes);
app.use("/api/blocks", BlockRoutes);
app.use("/api/config",SettingRoutes);
app.use("/api/members",MemberRoutes);
app.use("/api/maintenance",MaintenanceRoute);
app.use("/api/notices",NoticeRoutes);

// Handle React routing, return index.html file from the build
// app.get('*', (req, res) => {
//     res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
// });

// Schedule routes
runTask();
//listen to the port
app.listen(PORT, ()=> {
console.log(`listening to port ${PORT}`);
// setTimeout(function () {
//   process.send('ready');
// }, 1000);
})