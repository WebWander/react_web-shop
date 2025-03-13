import User from "../models/user.js";
import { hashSync, compareSync } from "bcrypt";

export const isRegisterUser = async (req, res) => {
  try {
    const {
      username,
      password,
      email
    } = req.body;

    // Check if all required fields are present in req.body
    const requiredFields = [
      "username",
      "password",
      "email"
    ];
    const missingFields = requiredFields.filter((field) => !req.body[field]);

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Required fields missing: ${missingFields.join(", ")}.`,
      });
    }

    // Check if the email or username is already registered
    const existingUsername = await User.findOne({ username });
    const existingEmail = await User.findOne({ email });

    if (existingUsername || existingEmail) {
      return res.status(400).json({
        success: false,
        message: existingUsername
          ? "Username is already registered."
          : "Email is already registered.",
      });
    }

    // Hash the password with hashSync
    const hashedPassword = hashSync(password, 10); // 10 salt rounds

    console.log("Attempting to register user:", username);
    console.log("Request Body:", req.body);

    // Create a new user object with the hashed password
    const newUser = new User({
      username,
      password: hashedPassword, // Store the hashed password
      password: hashedPassword, // Store the hashed password
      email,
      createdAt: new Date(),
    });

    await newUser.save();

    return res.status(201).json({
      success: true,
      message: "Registration successful.",
      redirect: "/login",
    });
  } catch (error) {
    if (error.code === 11000 && error.keyPattern && error.keyPattern.username) {
      return res.status(400).json({
        success: false,
        message: "Username is already registered.",
      });
    }
    console.error("Error during registration:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during registration.",
    });
  }
};

export const isAuthenticatedUser = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (!user || !compareSync(password, user.password)) {
      return res.status(401).json({
        success: false,
        message: "Invalid username or password.",
      });
    }

    // Synchronously compare the plaintext password with the hashed password
    const isPasswordMatched = compareSync(password, user.password);
    if (!isPasswordMatched) {
      return res.status(401).json({
        success: false,
        message: "Invalid username or password.",
      });
    }

    req.session.user = { username: user.username, userId: user._id }; // Set session data
    const userId = user._id;
    console.log("userId:", userId); // Log userId

    res.status(200).json({
      success: true,
      message: "Login successful.",
      user: { username: user.username },
      userId: userId,
      redirect: "/homepage", // Redirect to homepage
    });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({
      success: false,
      message: "Server error during login.",
    });
  }
};


export const getUserInfo = async (req, res) => {
  if (req.session && req.session.user) {
    res.status(200).json({
      success: true,
      user: req.session.user,
    });
  } else {
    res.status(401).json({
      success: false,
      message: "Not authenticated",
    });
  }
};

export const logoutUser = (req, res, next) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Error destroying session:", err);
      res.status(500).json({ success: false, message: "Error logging out" });
    } else {
      res.status(200).json({ success: true, message: "Logout successful" });
    }
  });
};