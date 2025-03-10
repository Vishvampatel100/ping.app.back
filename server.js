import express from 'express';
import { connectDB } from './mongoConfig/db.js';
import profileRouter from './routes/profile.route.js';
import postRouter from './routes/post.route.js';
import channelRouter from './routes/channel.route.js';
import attachmentRouter from './routes/attachment.route.js';
import cors from 'cors';
import validateApiKey from './apiKey/authMiddleware.js';
import cookieParser from 'cookie-parser';
import firebaseRouter from './firebase/firbase.router.js';
import verifyTokenFirebase from './firebase/firbaseMiddleware.js';
import dotenv from 'dotenv';
dotenv.config();


const app = express();
const PORT =  process.env.PORT || 8080;

// Allow all origins (Change this for security)
const corsOptions = {
    origin: [process.env.localURL, 
            process.env.productionURL], 
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed methods
    allowedHeaders: ['Content-Type', 'Authorization', 'api-key'], // Allowed headers
};

app.use(cors(corsOptions));

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.use('/', firebaseRouter);

app.use(verifyTokenFirebase);

app.use(validateApiKey);

app.use ("/api/profiles", profileRouter);
app.use ("/api/posts", postRouter);
app.use ("/api/channels", channelRouter);
app.use ("/api/attachments", attachmentRouter);


app.get('/', (req, res) => {
    res.send('Jai Swaminarayan');
    });

app.listen(PORT, () => {
    connectDB();
    console.log('Server is running on port http://localhost:' + PORT);
    });
