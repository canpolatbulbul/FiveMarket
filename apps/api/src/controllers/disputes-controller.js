import { query } from "../db/index.js";

/**
 * Create a new dispute
 * @access Private (Client or Freelancer)
 */
export const createDispute = async (req, res) => {
  try {
    const { order_id, description } = req.body;

    // Decode user ID
    const { decodeUserID } = await import("../utils/hashids.js");
    const user_id = decodeUserID(req.user.userID);

    // Validate required fields
    if (!order_id || !description) {
      return res.status(400).json({
        error: "Missing required fields",
        message: "Order ID and description are required",
      });
    }

    // Get order details and verify user is part of the order
    const orderResult = await query(
      `SELECT o.*, p.service_id
       FROM "order" o
       JOIN package p ON o.package_id = p.package_id
       JOIN service s ON p.service_id = s.service_id
       WHERE o.order_id = $1`,
      [order_id]
    );

    if (orderResult.rows.length === 0) {
      return res.status(404).json({
        error: "Order not found",
        message: "The specified order does not exist",
      });
    }

    const order = orderResult.rows[0];
    const clientId = parseInt(order.client_id);
    const freelancerId = parseInt(order.freelancer_id);
    const userId = parseInt(user_id);

    // Check if user is part of this order
    if (clientId !== userId && freelancerId !== userId) {
      return res.status(403).json({
        error: "Access denied",
        message: "You are not authorized to create a dispute for this order",
      });
    }

    // Check if order status allows dispute
    const validStatuses = ["delivered", "in_progress", "revision_requested"];
    if (!validStatuses.includes(order.status)) {
      return res.status(400).json({
        error: "Invalid order status",
        message: `Cannot create dispute for order with status '${order.status}'`,
      });
    }

    // Check if dispute already exists for this order
    const existingDispute = await query(
      `SELECT dispute_id FROM dispute_resolution WHERE order_id = $1`,
      [order_id]
    );

    if (existingDispute.rows.length > 0) {
      return res.status(400).json({
        error: "Dispute already exists",
        message: "A dispute has already been created for this order",
      });
    }

    // Create dispute
    const disputeResult = await query(
      `INSERT INTO dispute_resolution (order_id, description, status)
       VALUES ($1, $2, 'open')
       RETURNING *`,
      [order_id, description.trim()]
    );

    // Update order status to disputed
    await query(
      `UPDATE "order" SET status = 'disputed', updated_at = NOW() WHERE order_id = $1`,
      [order_id]
    );

    res.status(201).json({
      success: true,
      dispute: disputeResult.rows[0],
      message: "Dispute created successfully",
    });
  } catch (error) {
    console.error("Error creating dispute:", error);
    res.status(500).json({
      error: "Failed to create dispute",
      message: error.message,
    });
  }
};

/**
 * Get dispute details
 * @access Private (Dispute parties or Admin)
 */
export const getDisputeDetails = async (req, res) => {
  try {
    const { id } = req.params;

    // Decode user ID
    const { decodeUserID } = await import("../utils/hashids.js");
    const user_id = decodeUserID(req.user.userID);

    // Get dispute with order and user details
    const result = await query(
      `SELECT 
        d.*,
        o.status as order_status,
        o.total_price,
        o.placed_time,
        o.due_time,
        s.title as service_title,
        p.name as package_name,
        client_user.first_name as client_first_name,
        client_user.last_name as client_last_name,
        freelancer_user.first_name as freelancer_first_name,
        freelancer_user.last_name as freelancer_last_name,
        o.client_id,
        s.freelancer_id
       FROM dispute_resolution d
       JOIN "order" o ON d.order_id = o.order_id
       JOIN package p ON o.package_id = p.package_id
       JOIN service s ON p.service_id = s.service_id
       JOIN "user" client_user ON o.client_id = client_user."userID"
       JOIN "user" freelancer_user ON s.freelancer_id = freelancer_user."userID"
       WHERE d.dispute_id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Dispute not found",
        message: "The specified dispute does not exist",
      });
    }

    const dispute = result.rows[0];
    const clientId = parseInt(dispute.client_id);
    const freelancerId = parseInt(dispute.freelancer_id);
    const userId = parseInt(user_id);

    // Check authorization (must be dispute party or admin)
    const isParty = clientId === userId || freelancerId === userId;
    const isAdmin = req.user.clearance >= 3; // Admin clearance level

    if (!isParty && !isAdmin) {
      return res.status(403).json({
        error: "Access denied",
        message: "You are not authorized to view this dispute",
      });
    }

    res.json({
      success: true,
      dispute,
    });
  } catch (error) {
    console.error("Error fetching dispute details:", error);
    res.status(500).json({
      error: "Failed to fetch dispute details",
      message: error.message,
    });
  }
};

/**
 * Get user's disputes
 * @access Private
 */
export const getUserDisputes = async (req, res) => {
  try {
    // Decode user ID
    const { decodeUserID } = await import("../utils/hashids.js");
    const user_id = decodeUserID(req.user.userID);

    // Get all disputes where user is client or freelancer
    const result = await query(
      `SELECT 
        d.*,
        o.status as order_status,
        o.total_price,
        s.title as service_title,
        p.name as package_name,
        CASE 
          WHEN o.client_id = $1 THEN 'client'
          ELSE 'freelancer'
        END as user_role
       FROM dispute_resolution d
       JOIN "order" o ON d.order_id = o.order_id
       JOIN package p ON o.package_id = p.package_id
       JOIN service s ON p.service_id = s.service_id
       WHERE o.client_id = $1 OR s.freelancer_id = $1
       ORDER BY d.creation_time DESC`,
      [user_id]
    );

    res.json({
      success: true,
      disputes: result.rows,
    });
  } catch (error) {
    console.error("Error fetching user disputes:", error);
    res.status(500).json({
      error: "Failed to fetch disputes",
      message: error.message,
    });
  }
};

/**
 * Get all disputes (Admin only)
 * @access Private (Admin)
 */
export const getAllDisputes = async (req, res) => {
  try {
    const { status } = req.query;

    // Build query
    let queryText = `
      SELECT 
        d.*,
        o.status as order_status,
        o.total_price,
        s.title as service_title,
        p.name as package_name,
        client_user.first_name as client_first_name,
        client_user.last_name as client_last_name,
        freelancer_user.first_name as freelancer_first_name,
        freelancer_user.last_name as freelancer_last_name
       FROM dispute_resolution d
       JOIN "order" o ON d.order_id = o.order_id
       JOIN package p ON o.package_id = p.package_id
       JOIN service s ON p.service_id = s.service_id
       JOIN "user" client_user ON o.client_id = client_user."userID"
       JOIN "user" freelancer_user ON s.freelancer_id = freelancer_user."userID"
    `;

    const params = [];
    if (status) {
      queryText += ` WHERE d.status = $1`;
      params.push(status);
    }

    queryText += ` ORDER BY d.creation_time DESC`;

    const result = await query(queryText, params);

    res.json({
      success: true,
      disputes: result.rows,
    });
  } catch (error) {
    console.error("Error fetching all disputes:", error);
    res.status(500).json({
      error: "Failed to fetch disputes",
      message: error.message,
    });
  }
};

/**
 * Update dispute status (Admin only)
 * @access Private (Admin)
 */
export const updateDisputeStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, resolution_notes } = req.body;

    // Validate status
    const validStatuses = ["open", "under_review", "resolved", "rejected"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        error: "Invalid status",
        message:
          "Status must be one of: open, under_review, resolved, rejected",
      });
    }

    // Get current dispute
    const disputeResult = await query(
      `SELECT d.*, o.status as order_status
       FROM dispute_resolution d
       JOIN "order" o ON d.order_id = o.order_id
       WHERE d.dispute_id = $1`,
      [id]
    );

    if (disputeResult.rows.length === 0) {
      return res.status(404).json({
        error: "Dispute not found",
        message: "The specified dispute does not exist",
      });
    }

    const dispute = disputeResult.rows[0];

    // Get order details for payment processing
    const orderDetails = await query(
      `SELECT o.*, s.freelancer_id, o.total_price
       FROM "order" o
       JOIN package p ON o.package_id = p.package_id
       JOIN service s ON p.service_id = s.service_id
       WHERE o.order_id = $1`,
      [dispute.order_id]
    );

    const order = orderDetails.rows[0];

    // Update dispute status
    await query(
      `UPDATE dispute_resolution 
       SET status = $1, updated_at = NOW() 
       WHERE dispute_id = $2`,
      [status, id]
    );

    // Handle order status and payment based on dispute resolution
    if (status === "resolved") {
      // Dispute resolved in favor of freelancer - release payment

      // Update transaction to completed (release payment from escrow)
      await query(
        `UPDATE transaction 
         SET status = 'completed', updated_at = NOW() 
         WHERE order_id = $1`,
        [dispute.order_id]
      );

      // Update freelancer earnings
      await query(
        `UPDATE freelancer 
         SET total_earned = total_earned + $1 
         WHERE "userID" = $2`,
        [order.total_price, order.freelancer_id]
      );

      // Update order status to delivered (dispute resolved, work accepted)
      await query(
        `UPDATE "order" 
         SET status = 'delivered', updated_at = NOW() 
         WHERE order_id = $1`,
        [dispute.order_id]
      );
    } else if (status === "rejected") {
      // Dispute rejected - refund client

      // Update transaction to refunded
      await query(
        `UPDATE transaction 
         SET status = 'refunded', updated_at = NOW() 
         WHERE order_id = $1`,
        [dispute.order_id]
      );

      // Update order status to cancelled (dispute rejected, order cancelled)
      await query(
        `UPDATE "order" 
         SET status = 'cancelled', updated_at = NOW() 
         WHERE order_id = $1`,
        [dispute.order_id]
      );
    }

    res.json({
      success: true,
      message: "Dispute status updated successfully",
    });
  } catch (error) {
    console.error("Error updating dispute status:", error);
    res.status(500).json({
      error: "Failed to update dispute status",
      message: error.message,
    });
  }
};
