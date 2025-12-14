import express from "express";
import {
  createOrder,
  getClientOrders,
  getFreelancerOrders,
  getOrderDetails,
  updateOrderStatus,
  uploadDeliverable,
  completeOrder,
  requestRevision,
} from "../controllers/orders-controller.js";
import checkAuth from "../middleware/auth-check.js";
import checkClearance from "../middleware/clearance-check.js";
import { ClearanceLevels } from "../utils/roles.js";
import {
  uploadDeliverable as uploadDeliverableMiddleware,
  handleDeliverableUploadError,
} from "../middleware/upload-deliverable.js";

const router = express.Router();

/**
 * @route   GET /api/orders/client
 * @desc    Get all orders for authenticated client
 * @access  Private (Client only)
 */
router.get(
  "/client",
  checkAuth,
  checkClearance(ClearanceLevels.CLIENT),
  getClientOrders
);

/**
 * @route   GET /api/orders/freelancer
 * @desc    Get all orders for authenticated freelancer's services
 * @access  Private (Freelancer only)
 */
router.get(
  "/freelancer",
  checkAuth,
  checkClearance(ClearanceLevels.FREELANCER),
  getFreelancerOrders
);

/**
 * @route   GET /api/orders/:id
 * @desc    Get detailed information about a specific order
 * @access  Private (Client or Freelancer involved)
 */
router.get("/:id", checkAuth, getOrderDetails);

/**
 * @route   PATCH /api/orders/:id/status
 * @desc    Update order status
 * @access  Private (Client or Freelancer involved)
 */
router.patch("/:id/status", checkAuth, updateOrderStatus);

/**
 * @route   POST /api/orders/:id/deliverable
 * @desc    Upload deliverable for an order
 * @access  Private (Freelancer only)
 */
router.post(
  "/:id/deliverable",
  checkAuth,
  uploadDeliverableMiddleware.single("file"),
  handleDeliverableUploadError,
  uploadDeliverable
);

/**
 * @route   PATCH /api/orders/:id/complete
 * @desc    Complete an order (client accepts delivery)
 * @access  Private (Client only)
 */
router.patch("/:id/complete", checkAuth, completeOrder);

/**
 * @route   POST /api/orders/:id/revision
 * @desc    Request revision for an order
 * @access  Private (Client only)
 */
router.post("/:id/revision", checkAuth, requestRevision);

/**
 * @route   POST /api/orders
 * @desc    Create a new order
 * @access  Private (Client only)
 */
router.post(
  "/",
  checkAuth,
  checkClearance(ClearanceLevels.CLIENT),
  createOrder
);

export default router;
