const User = require("../models/User");
const jwt = require("jsonwebtoken");
const { sendOTPEmail } = require("../utils/email");
const bcrypt = require("bcryptjs")
const OTP = require("../models/OTP")


const generateToken = (id ,role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, {
        expiresIn: "7d",
    });
}


// Function to register a new user
exports.registerUser = async (req, res) => {
    const { name, email, password } = req.body;
    let userExists = await User.findOne({ email });
    if (userExists) {
        return res.status(400).json({ message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    try {
        const user = await User.create({ name, email, password: hashedPassword,role: 'user',isVerified : false });

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        console.log(`otp for ${email}: ${otp}`);
        await OTP.create({email, otp, action:'account_verification'})
        await sendOTPEmail(email,otp,'account_verification');

        res.status(201).json({
            message: "user registered successfully,please check your email to verify the otp",
            email : user.email
        })
        

    } catch (error) {
        res.status(500).json({ message: "Error registering user",error: error.message });
    }
};

exports.loginUser = async (req, res) => {
    const { email, password } = req.body;

    let user = await User.findOne({ email });
    if (!user) {
        return res.status(400).json({ message: "Invalid email or password,Please signup first" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(400).json({ message: "Invalid email or password" });
    }

    if(!user.isVerified && user.role === 'user'){
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        // console.log(`otp for ${email}: ${otp}`);
        await OTP.deleteMany({email, action:'account_verification'}) // Delete any existing OTPs for this email and action
        await OTP.create({email, otp, action:'account_verification'})
        await sendOTPEmail(email,otp,'account_verification');
        return res.status(400).json({
            message: "Account not verified, please check your email for the OTP",
            needsVerification: true
        });
    }

    // Generate JWT token (assuming you have a function for this)
    // const token = generateToken(user._id);
    // res.json({ token });
    res.status(200).json({ message: "Login successful" ,
        user :{
            _id : user._id,
            name : user.name,
            email : user.email,
            role : user.role,
            token: generateToken(user._id, user.role),
            isVerified : user.isVerified
        }
    });
}

//Verify OTP
exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const otpRecord = await OTP.findOne({ email, otp, action: "account_verification" });

    if (!otpRecord) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // FIXED: Updated the USER model (not OTP) and added { new: true }
    const user = await User.findOneAndUpdate(
      { email },
      { isVerified: true },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Delete used OTP
    await OTP.deleteMany({ email, action: "account_verification" });

    return res.status(200).json({
      message: "OTP verified successfully, your account is now verified",
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id, user.role),
    });
  } catch (error) {
    console.error("Verify OTP Error:", error.message);
    return res.status(500).json({ message: "Error verifying OTP", error: error.message });
  }
};


// exports.verifyOtp = async (req, res) => {
//     const { email, otp } = req.body;
//     const otpRecord = await OTP.findOne({ email, otp, action: 'account_verification' });

//     if (!otpRecord) {
//         return res.status(400).json({ message: "Invalid or expired OTP" });
//     }
    
//     const user = await OTP.findOneAndUpdate({email},{isVerified : true})
//     await OTP.deleteMany({ email, action: 'account_verification' });
//     res.json({
//         message: "OTP verified successfully, your account is now verified",
//         _id : user._id,
//         name : user.name,
//         email : user.email,
//         role : user.role,
//         token: generateToken(user._id, user.role)
//     })
// };