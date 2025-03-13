import admin from './firebaseAdmin.js';

const verifyTokenFirebase = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    
    // Log the request headers
    console.log('Request headers:', req.headers);

    if (!authHeader) {
        console.log('No token provided');
        return res.status(401).json({ error: 'No token provided' });
    }
    
    // Log that the token is present
    console.log('Authorization header is present');

    // Extract the Bearer token
    const token = authHeader.split(' ')[1];
    
    // Log the extracted token
    console.log('Extracted token:', token);

    try {
        // Verify the token using Firebase admin
        const decodedToken = await admin.auth().verifyIdToken(token);
        
        // Log the decoded token
        console.log('Decoded token:', decodedToken);

        // Attach the decoded token to the request object
        req.user = decodedToken;
        next();
    } catch (error) {
        // Log the error if token verification fails
        console.log('Error verifying token:', error);
        res.status(401).json({ error: 'Invalid token' });
    }
};

export default verifyTokenFirebase;