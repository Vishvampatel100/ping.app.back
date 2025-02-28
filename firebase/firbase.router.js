import express from 'express';
import admin from './firebaseAdmin.js';

const firebaseRouter = express.Router();

firebaseRouter.post('/api/login', async (req, res) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        return res.status(401).json({ error: 'Sorry! No token provided' });
    }
    
    const idToken = authHeader.split(' ')[1];
    try {
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        const token = await admin.auth().createCustomToken(decodedToken.uid);
        res.json({success: true, message: 'Login successful'});
    } catch (error) {
        res.status(401).json({ error: error.message });
        console.log('error:', error.message);
    }
});

export default firebaseRouter;
