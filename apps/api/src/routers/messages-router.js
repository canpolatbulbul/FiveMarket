import express from "express";
import {
  getConversations,
  getConversationDetails,
  sendMessage,
} from "../controllers/messages-controller.js";
import checkAuth from "../middleware/auth-check.js";

const router = express.Router();

/**
 * @route   GET /api/conversations
 * @desc    Get all conversations for authenticated user
 * @access  Private
 */
router.get("/", checkAuth, getConversations);

/**
 * @route   GET /api/conversations/:id
 * @desc    Get conversation details with messages
 * @access  Private (Client or Freelancer involved)
 */
router.get("/:id", checkAuth, getConversationDetails);

/**
 * @route   POST /api/conversations/:id/messages
 * @desc    Send a message in a conversation
 * @access  Private (Client or Freelancer involved)
 */
router.post("/:id/messages", checkAuth, sendMessage);

export default router;
