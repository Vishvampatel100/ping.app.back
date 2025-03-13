
import admin from './firebaseAdmin.js';

const verifyTokenFirebase = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        return res.status(401).json({ error: 'No token provided' });
    }
    //get gearer token
    const token = authHeader.split(' ')[1];
    console.log("------------------------------")
    console.log('Token:', token);
    console.log(req.headers['x-original-url']);
    try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        req.user = decodedToken;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Invalid token' });
    }
};

export default verifyTokenFirebase;
