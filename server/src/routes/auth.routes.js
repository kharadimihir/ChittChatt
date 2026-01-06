import express from "express"
import { createUser, loginUser, updateHandle, updateUserLocation } from "../controllers/auth.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

// POST /api/auth/signup
router.post("/signup", createUser);

router.post("/login", loginUser);

// Protected routes
router.get("/me", authMiddleware, (req, res) => {
    res.json({
      message: "Protected route accessed",
      user: {
        id: req.user._id,
        email: req.user.email,
        handle: req.user.handle,
      },
    });
});

// Update handle (Protected routes)
router.put("/handle", authMiddleware, updateHandle);

router.patch("/users/location", authMiddleware, updateUserLocation)

export default router;