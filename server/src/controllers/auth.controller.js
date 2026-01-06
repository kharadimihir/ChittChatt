import bcrypt from "bcryptjs";
import User from "../models/User.model.js";
import { generateToken } from "../utils/jwt.js";


// SignUp Logic
export const createUser = async (req, res) => {
  try {
    const { email, password, confirmPassword } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    if (password != confirmPassword) {
      return res.status(400).json({
        message: "Password must be same",
      });
    }

    // Check if user already exist
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        message: "User already exists",
      });
    }

    const user = await User.create({
      email,
      password,
    });

    res.status(201).json({
      message: "User created successfully",
      user: {
        id: user._id,
        email: user.email,
        handle: user.handle,
      },
    });
  } catch (error) {
    console.error("Create user error:", error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};


// Login logic

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // compare password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" })
    }

    // Generate tokens
    const token = generateToken({
      userId: user._id,
    })

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        email: user.email,
        handle: user.handle,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Update handle

export const updateHandle = async (req, res) => {
  try {
    const { handle } = req.body;
    const user = req.user;

    if (!handle || handle.trim().length < 3) {
      return res.status(400).json({
        message: "Handle must be at least 3 characters long",
      });
    }
    
    // Optional: ensure handle uniqueness
    const existingHandle = await User.findOne({ handle });
    if (existingHandle && existingHandle._id.toString() !== user._id.toString()) {
      return res.status(409).json({
        message: "Handle already taken",
      });
    }

    user.handle = handle;
    await user.save();

    res.status(200).json({
      message: "Handle updated successfully",
      user: {
        id: user._id,
        email: user.email,
        handle: user.handle,
      },
    });
  } catch (error) {
    console.error("Handle update error:", error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};


// Update user location

export const updateUserLocation = async (req, res) => {
  try {
    const { lat, lng } = req.body;
    const user = req.user;

    if (typeof lat !== "number" || typeof lng !== "number") {
      return res.status(400).json({
        message: "Valid latitude and longitude are required",
      });
    }

    user.location = { lat, lng };
    await user.save();

    res.status(200).json({
      message: "User location updated successfully",
    })
  } catch (error) {
    console.error("Update location error:", error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
}

