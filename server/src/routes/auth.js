const express = require("express");
const bcrypt = require("bcryptjs");

const {
    createUser,
    findUserByEmail,
    publicUser,
} = require("../lib/store");

const { signToken } = require("../lib/jwt");
const { sendError } = require("../lib/errors");

const router = express.Router();

router.post("/register",async(req,res) => {
    const { email,password,displayName} = req.body || {};

    if(!email || !password || !displayName){ //bỏ trống
        return sendError (
            res,
            400,
            "VALIDATION_ERROR",
            "email,password,displayName are required"
        );
    }

    if(findUserByEmail(email)){ //trùng email
        return sendError (res,400,"VALIDATION_ERROR","Email already registered")
    }

    const passwordHash = await bcrypt.hash(String(password),10);
    const user = createUser({ //ghi user vào map
        email,
        passwordHash,
        displayName: String(displayName),
    });
    const token = signToken(user.id);

    return res.status(201).json({
        user: publicUser(user),
        token,
    });
});

// ---LOGIN ---
router.post("/login",async(req,res)=>{
    const{email,password} = req.body || {};

    if(!email || !password){
        return sendError (
            res,
            400,
            "VALIDATION_ERROR",
            "email and password are required"
        );
    }
    const user = findUserByEmail(email);
    if(!user){
        return sendError(res,401, "UNAUTHORIZED", "Invalid email or password");
    }
    const ok = await bcrypt.compare(String(password),user.passwordHash); //gõ lại password comapre
    if(!ok){
        return sendError(res, 401, "UNAUTHORIZED", "Invalid email or password");
    }
    const token = signToken(user.id);
    return res.json({ //trả về user và token
        user: publicUser(user),
        token,
  });
});
const {authMiddleware} = require("../middleware/auth");
    router.get("/me",authMiddleware,(req,res) => { 
        return res.json({ user: req.user });
    });
module.exports = router;