const jwt = require('jsonwebtoken');

const protect = (req, res, next) =>{
    let token = req.header('Authorization');

    if (!token){
        return res.status(401).json({message: "Access denied. No token provided." });
    }

    try {
        if (token.startsWith('Bearer ')){
            token = token.split(' ')[1];
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;

        next();

    } 
    catch (error){
        res.status(403).json({message: "Invalid or expired token." });
    }
};
const authorizeAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin'){
        next();
    } 
    else{
        res.status(403).json({ 
            message: "Access Denied: This action requires Administrator privileges." 
        });
    }
};

module.exports = {protect,authorizeAdmin};