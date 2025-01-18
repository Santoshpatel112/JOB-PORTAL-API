import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import connectDB from './utils/db.js';
import userRouter from './Routes/user.route.js';
import companyRouter from './Routes/company.route.js';
import jobRoute from './Routes/job.Routes.js';
import applicationRoute from './Routes/application.Route.js';

dotenv.config({});
const app = express();

// middleware
app.use(cors());
app.use(cookieParser()); /// to store the data on the frontend
app.use(express.urlencoded({extended:true}));
app.use(express.json()); 

app.get('/', (req, res) => {
    res.json({ message: 'Hello from backend' });
});

// routes
app.use('/api/v1/user', userRouter);

// http://localhost:8000/api/v1/user/register
// http://localhost:8000/api/v1/user/login
// http://localhost:8000/api/v1/user/logout
// http://localhost:8000/api/v1/user/profile/updateprofile

// database connection
app.use('/api/v1/company', companyRouter);

app.use('/api/v1/job', jobRoute);

app.use('/api/v1/application',applicationRoute);
connectDB();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
