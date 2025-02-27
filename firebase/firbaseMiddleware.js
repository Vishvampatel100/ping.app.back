
import admin from './firebaseAdmin.js';

const verifyTokenFirebase = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    //get gearer token
    const token = authHeader.split(' ')[1];
    try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        req.user = decodedToken;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Invalid token' });
    }
};

export default verifyTokenFirebase;
