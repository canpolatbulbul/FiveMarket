import { query } from "../db/index.js";

/**
 * Get add-ons for a specific service
 */
export const getServiceAddons = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT addon_id, service_id, name, description, price, delivery_days
       FROM service_addon
       WHERE service_id = $1
       ORDER BY price ASC`,
      [id]
    );

    res.json({
      success: true,
      addons: result.rows,
    });
  } catch (error) {
    console.error("Error fetching service add-ons:", error);
    res.status(500).json({
      error: "Failed to fetch add-ons",
      message: error.message,
    });
  }
};

/**
 * Get all orders for the authenticated client
 * @access Private (Client only)
 */
export const getClientOrders = async (req, res) => {
  try {
    const { decodeUserID } = await import("../utils/hashids.js");
    const client_id = decodeUserID(req.user.userID);

    const result = await query(
      `SELECT 
        o.order_id,
        o.status,
        o.total_price,
        o.due_time,
        o.project_details,
        o.revisions_used,
        o.created_at,
        s.service_id,
        s.title as service_title,
        s.description as service_description,
        p.package_id,
        p.name as package_name,
        p.revisions_allowed,
        u."userID" as freelancer_id,
        u.first_name as freelancer_first_name,
        u.last_name as freelancer_last_name,
        (
          SELECT json_agg(json_build_object(
            'addon_id', sa.addon_id,
            'name', sa.name,
            'quantity', oa.quantity,
            'price', oa.price_at_purchase
          ))
          FROM order_addon oa
          JOIN service_addon sa ON oa.addon_id = sa.addon_id
          WHERE oa.order_id = o.order_id
        ) as addons
       FROM "order" o
       JOIN package p ON o.package_id = p.package_id
       JOIN service s ON p.service_id = s.service_id
       JOIN freelancer f ON s.freelancer_id = f."userID"
       JOIN "user" u ON f."userID" = u."userID"
       WHERE o.client_id = $1
       ORDER BY o.created_at DESC`,
      [client_id]
    );

    res.json({
      success: true,
      orders: result.rows,
    });
  } catch (error) {
    console.error("Error fetching client orders:", error);
    res.status(500).json({
      error: "Failed to fetch orders",
      message: error.message,
    });
  }
};

/**
 * Get all orders for the authenticated freelancer's services
 * @access Private (Freelancer only)
 */
export const getFreelancerOrders = async (req, res) => {
  try {
    const { decodeUserID } = await import("../utils/hashids.js");
    const freelancer_id = decodeUserID(req.user.userID);

    const result = await query(
      `SELECT 
        o.order_id,
        o.status,
        o.total_price,
        o.due_time,
        o.project_details,
        o.revisions_used,
        o.created_at,
        s.service_id,
        s.title as service_title,
        s.description as service_description,
        p.package_id,
        p.name as package_name,
        p.revisions_allowed,
        u."userID" as client_id,
        u.first_name as client_first_name,
        u.last_name as client_last_name,
        u.email as client_email,
        (
          SELECT json_agg(json_build_object(
            'addon_id', sa.addon_id,
            'name', sa.name,
            'quantity', oa.quantity,
            'price', oa.price_at_purchase
          ))
          FROM order_addon oa
          JOIN service_addon sa ON oa.addon_id = sa.addon_id
          WHERE oa.order_id = o.order_id
        ) as addons
       FROM "order" o
       JOIN package p ON o.package_id = p.package_id
       JOIN service s ON p.service_id = s.service_id
       JOIN client c ON o.client_id = c."userID"
       JOIN "user" u ON c."userID" = u."userID"
       WHERE s.freelancer_id = $1
       ORDER BY o.created_at DESC`,
      [freelancer_id]
    );

    res.json({
      success: true,
      orders: result.rows.map((order) => ({
        ...order,
        client_name: `${order.client_first_name} ${order.client_last_name}`,
      })),
    });
  } catch (error) {
    console.error("Error fetching freelancer orders:", error);
    res.status(500).json({
      error: "Failed to fetch orders",
      message: error.message,
    });
  }
};

/**
 * Get detailed information about a specific order
 * @access Private (Client or Freelancer involved in the order)
 */
export const getOrderDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const { decodeUserID } = await import("../utils/hashids.js");
    const user_id = decodeUserID(req.user.userID);

    // Fetch order with all details
    const result = await query(
      `SELECT 
        o.order_id,
        o.client_id,
        o.status,
        o.total_price,
        o.due_time,
        o.project_details,
        o.revisions_used,
        o.created_at,
        o.updated_at,
        s.service_id,
        s.title as service_title,
        s.description as service_description,
        s.freelancer_id,
        p.package_id,
        p.name as package_name,
        p.description as package_description,
        p.price as package_price,
        p.delivery_time as package_delivery_time,
        p.revisions_allowed,
        client_user."userID" as client_user_id,
        client_user.first_name as client_first_name,
        client_user.last_name as client_last_name,
        client_user.email as client_email,
        freelancer_user."userID" as freelancer_user_id,
        freelancer_user.first_name as freelancer_first_name,
        freelancer_user.last_name as freelancer_last_name,
        freelancer_user.email as freelancer_email,
        conv.conversation_id,
        (
          SELECT json_agg(json_build_object(
            'addon_id', sa.addon_id,
            'name', sa.name,
            'description', sa.description,
            'quantity', oa.quantity,
            'price', oa.price_at_purchase,
            'delivery_days', sa.delivery_days
          ))
          FROM order_addon oa
          JOIN service_addon sa ON oa.addon_id = sa.addon_id
          WHERE oa.order_id = o.order_id
        ) as addons,
        (
          SELECT json_agg(json_build_object(
            'transaction_id', t.transaction_id,
            'amount', t.amount,
            'payment_method', t.payment_method,
            'card_last4', t.card_last4,
            'status', t.status,
            'created_at', t.created_at
          ))
          FROM transaction t
          WHERE t.order_id = o.order_id
        ) as transactions,
        (
          SELECT json_agg(json_build_object(
            'deliverable_id', d.deliverable_id,
            'file_path', d.file_path,
            'file_name', d.file_name,
            'file_size', d.file_size,
            'uploaded_at', d.uploaded_at
          ))
          FROM deliverable d
          WHERE d.order_id = o.order_id
        ) as deliverables,
        (
          SELECT json_agg(json_build_object(
            'revision_id', r.revision_id,
            'reason', r.reason,
            'status', r.status,
            'requested_at', r.requested_at,
            'resolved_at', r.resolved_at
          ))
          FROM revision_request r
          WHERE r.order_id = o.order_id
        ) as revision_requests,
        (
          SELECT json_build_object(
            'review_id', rev.review_id,
            'rating', rev.rating,
            'comment', rev.comment,
            'created_at', rev.created_at
          )
          FROM review rev
          WHERE rev.order_id = o.order_id
        ) as review
       FROM "order" o
       JOIN package p ON o.package_id = p.package_id
       JOIN service s ON p.service_id = s.service_id
       JOIN client c ON o.client_id = c."userID"
       JOIN "user" client_user ON c."userID" = client_user."userID"
       JOIN freelancer f ON s.freelancer_id = f."userID"
       JOIN "user" freelancer_user ON f."userID" = freelancer_user."userID"
       LEFT JOIN conversation conv ON o.order_id = conv.order_id
       WHERE o.order_id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Order not found",
        message: "The requested order does not exist",
      });
    }

    const order = result.rows[0];

    // Authorization check: user must be either the client, the freelancer, or an admin
    // Ensure numeric comparison
    const clientId = parseInt(order.client_id);
    const freelancerId = parseInt(order.freelancer_id);
    const userId = parseInt(user_id);
    const isAdmin = req.user.roles?.includes("admin");

    if (!isAdmin && clientId !== userId && freelancerId !== userId) {
      return res.status(403).json({
        error: "Access denied",
        message: "You do not have permission to view this order",
      });
    }

    // Determine user's role in this order
    const userRole = clientId === userId ? "client" : "freelancer";

    res.json({
      success: true,
      order,
      userRole,
    });
  } catch (error) {
    console.error("Error fetching order details:", error);
    res.status(500).json({
      error: "Failed to fetch order details",
      message: error.message,
    });
  }
};

/**
 * Update order status
 * @access Private (Freelancer for most statuses, Client for some)
 */
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const { decodeUserID } = await import("../utils/hashids.js");
    const user_id = decodeUserID(req.user.userID);

    // Validate status
    const validStatuses = [
      "pending",
      "in_progress",
      "delivered",
      "revision_requested",
      "completed",
      "cancelled",
      "disputed",
    ];

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        error: "Invalid status",
        message: `Status must be one of: ${validStatuses.join(", ")}`,
      });
    }

    // Get current order
    const orderResult = await query(
      `SELECT o.*, s.freelancer_id
       FROM "order" o
       JOIN package p ON o.package_id = p.package_id
       JOIN service s ON p.service_id = s.service_id
       WHERE o.order_id = $1`,
      [id]
    );

    if (orderResult.rows.length === 0) {
      return res.status(404).json({
        error: "Order not found",
        message: "The requested order does not exist",
      });
    }

    const order = orderResult.rows[0];
    const clientId = parseInt(order.client_id);
    const freelancerId = parseInt(order.freelancer_id);
    const userId = parseInt(user_id);

    // Authorization: Check who can update to which status
    const isClient = clientId === userId;
    const isFreelancer = freelancerId === userId;

    if (!isClient && !isFreelancer) {
      return res.status(403).json({
        error: "Access denied",
        message: "You do not have permission to update this order",
      });
    }

    // Status transition rules
    const freelancerStatuses = ["in_progress", "delivered"];
    const clientStatuses = ["completed", "revision_requested"];
    const sharedStatuses = ["cancelled", "disputed"];

    if (
      (isFreelancer &&
        !freelancerStatuses.includes(status) &&
        !sharedStatuses.includes(status)) ||
      (isClient &&
        !clientStatuses.includes(status) &&
        !sharedStatuses.includes(status))
    ) {
      return res.status(403).json({
        error: "Invalid status transition",
        message: "You are not authorized to set this status",
      });
    }

    // Update order status
    const result = await query(
      `UPDATE "order"
       SET status = $1, updated_at = NOW()
       WHERE order_id = $2
       RETURNING *`,
      [status, id]
    );

    res.json({
      success: true,
      order: result.rows[0],
      message: "Order status updated successfully",
    });
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({
      error: "Failed to update order status",
      message: error.message,
    });
  }
};

/**
 * Upload deliverable for an order
 * @access Private (Freelancer only)
 */
export const uploadDeliverable = async (req, res) => {
  try {
    const { id } = req.params;
    const { decodeUserID } = await import("../utils/hashids.js");
    const user_id = decodeUserID(req.user.userID);

    if (!req.file) {
      return res.status(400).json({
        error: "No file uploaded",
        message: "Please select a file to upload",
      });
    }

    // Get order and verify freelancer owns it
    const orderResult = await query(
      `SELECT o.*, s.freelancer_id
       FROM "order" o
       JOIN package p ON o.package_id = p.package_id
       JOIN service s ON p.service_id = s.service_id
       WHERE o.order_id = $1`,
      [id]
    );

    if (orderResult.rows.length === 0) {
      return res.status(404).json({
        error: "Order not found",
        message: "The requested order does not exist",
      });
    }

    const order = orderResult.rows[0];
    const freelancerId = parseInt(order.freelancer_id);
    const userId = parseInt(user_id);

    if (freelancerId !== userId) {
      return res.status(403).json({
        error: "Access denied",
        message:
          "You do not have permission to upload deliverables for this order",
      });
    }

    // Insert deliverable record
    const deliverableResult = await query(
      `INSERT INTO deliverable (order_id, file_path, file_name, file_size)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [id, req.file.path, req.file.originalname, req.file.size]
    );

    // Update order status to delivered
    await query(
      `UPDATE "order" SET status = 'delivered', updated_at = NOW() WHERE order_id = $1`,
      [id]
    );

    res.json({
      success: true,
      deliverable: deliverableResult.rows[0],
      message: "Deliverable uploaded successfully",
    });
  } catch (error) {
    console.error("Error uploading deliverable:", error);
    res.status(500).json({
      error: "Failed to upload deliverable",
      message: error.message,
    });
  }
};

/**
 * Complete an order (client accepts delivery)
 * @access Private (Client only)
 */
export const completeOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, review_text } = req.body;
    const { decodeUserID } = await import("../utils/hashids.js");
    const user_id = decodeUserID(req.user.userID);

    // Validate review data
    if (rating === undefined || rating === null) {
      return res.status(400).json({
        error: "Rating required",
        message: "Please provide a rating for this order",
      });
    }

    // Validate rating (0-5 with 0.5 increments)
    const validRating = parseFloat(rating);
    if (isNaN(validRating) || validRating < 0 || validRating > 5) {
      return res.status(400).json({
        error: "Invalid rating",
        message: "Rating must be between 0 and 5",
      });
    }

    // Check if rating is in 0.5 increments
    if ((validRating * 2) % 1 !== 0) {
      return res.status(400).json({
        error: "Invalid rating",
        message: "Rating must be in 0.5 increments (e.g., 3.5, 4.0, 4.5)",
      });
    }

    // Validate review text
    if (!review_text || typeof review_text !== "string") {
      return res.status(400).json({
        error: "Review required",
        message: "Please provide a written review",
      });
    }

    const trimmedReview = review_text.trim();
    if (trimmedReview.length < 10) {
      return res.status(400).json({
        error: "Review too short",
        message: "Review must be at least 10 characters long",
      });
    }

    if (trimmedReview.length > 1000) {
      return res.status(400).json({
        error: "Review too long",
        message: "Review must be less than 1000 characters",
      });
    }

    // Get order
    const orderResult = await query(
      `SELECT o.*, s.freelancer_id, s.service_id
       FROM "order" o
       JOIN package p ON o.package_id = p.package_id
       JOIN service s ON p.service_id = s.service_id
       WHERE o.order_id = $1`,
      [id]
    );

    if (orderResult.rows.length === 0) {
      return res.status(404).json({
        error: "Order not found",
        message: "The requested order does not exist",
      });
    }

    const order = orderResult.rows[0];
    const clientId = parseInt(order.client_id);
    const userId = parseInt(user_id);

    if (clientId !== userId) {
      return res.status(403).json({
        error: "Access denied",
        message: "You do not have permission to complete this order",
      });
    }

    if (order.status !== "delivered") {
      return res.status(400).json({
        error: "Invalid status",
        message: "Order must be in 'delivered' status to be completed",
      });
    }

    // Check if there's an open dispute for this order
    const disputeCheck = await query(
      `SELECT dispute_id, status FROM dispute_resolution WHERE order_id = $1`,
      [id]
    );

    if (disputeCheck.rows.length > 0) {
      const dispute = disputeCheck.rows[0];
      if (dispute.status === "open" || dispute.status === "under_review") {
        return res.status(400).json({
          error: "Dispute in progress",
          message:
            "Cannot complete order while a dispute is open or under review",
        });
      }
    }

    // Insert review
    await query(
      `INSERT INTO review (order_id, rating, comment, created_at)
       VALUES ($1, $2, $3, NOW())`,
      [id, validRating, trimmedReview]
    );

    // Update order status
    const result = await query(
      `UPDATE "order" SET status = 'completed', updated_at = NOW() WHERE order_id = $1 RETURNING *`,
      [id]
    );

    // Update transaction status to completed (release payment from escrow)
    await query(
      `UPDATE transaction 
       SET status = 'completed', updated_at = NOW() 
       WHERE order_id = $1`,
      [id]
    );

    // Update freelancer earnings
    await query(
      `UPDATE freelancer 
       SET total_earned = total_earned + $1 
       WHERE "userID" = $2`,
      [order.total_price, order.freelancer_id]
    );

    res.json({
      success: true,
      order: result.rows[0],
      message: "Order completed successfully",
    });
  } catch (error) {
    console.error("Error completing order:", error);
    res.status(500).json({
      error: "Failed to complete order",
      message: error.message,
    });
  }
};

/**
 * Request revision for an order
 * @access Private (Client only)
 */
export const requestRevision = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const { decodeUserID } = await import("../utils/hashids.js");
    const user_id = decodeUserID(req.user.userID);

    if (!reason || reason.trim().length === 0) {
      return res.status(400).json({
        error: "Invalid request",
        message: "Revision reason is required",
      });
    }

    // Get order
    const orderResult = await query(
      `SELECT * FROM "order" WHERE order_id = $1`,
      [id]
    );

    if (orderResult.rows.length === 0) {
      return res.status(404).json({
        error: "Order not found",
        message: "The requested order does not exist",
      });
    }

    const order = orderResult.rows[0];
    const clientId = parseInt(order.client_id);
    const userId = parseInt(user_id);

    if (clientId !== userId) {
      return res.status(403).json({
        error: "Access denied",
        message:
          "You do not have permission to request revisions for this order",
      });
    }

    if (order.status !== "delivered") {
      return res.status(400).json({
        error: "Invalid status",
        message: "Order must be in 'delivered' status to request revision",
      });
    }

    // Check if revisions are available
    if (order.revisions_used >= order.revisions_allowed) {
      return res.status(400).json({
        error: "No revisions remaining",
        message: "All revisions have been used for this order",
      });
    }

    // Insert revision request
    await query(
      `INSERT INTO revision_request (order_id, reason, status)
       VALUES ($1, $2, 'pending')`,
      [id, reason.trim()]
    );

    // Update order
    const result = await query(
      `UPDATE "order" 
       SET status = 'revision_requested', 
           revisions_used = revisions_used + 1,
           updated_at = NOW()
       WHERE order_id = $1
       RETURNING *`,
      [id]
    );

    res.json({
      success: true,
      order: result.rows[0],
      message: "Revision requested successfully",
    });
  } catch (error) {
    console.error("Error requesting revision:", error);
    res.status(500).json({
      error: "Failed to request revision",
      message: error.message,
    });
  }
};

/**
 * Create a new order
 * Requires authentication (client role)
 */
export const createOrder = async (req, res) => {
  try {
    const {
      package_id,
      project_details,
      addon_selections,
      payment_method,
      card_last4,
    } = req.body;

    // Decode user ID
    const { decodeUserID } = await import("../utils/hashids.js");
    const client_id = decodeUserID(req.user.userID);

    // Validate required fields
    if (!package_id || !project_details) {
      return res.status(400).json({
        error: "Missing required fields",
        message: "Package ID and project details are required",
      });
    }

    // Get package details
    const packageResult = await query(
      `SELECT p.*, s.freelancer_id, s.title as service_title
       FROM package p
       JOIN service s ON p.service_id = s.service_id
       WHERE p.package_id = $1`,
      [package_id]
    );

    if (packageResult.rows.length === 0) {
      return res.status(404).json({
        error: "Package not found",
        message: "The selected package does not exist",
      });
    }

    const pkg = packageResult.rows[0];

    // Calculate total price and delivery time
    let total_price = parseFloat(pkg.price);
    let delivery_days = parseInt(pkg.delivery_time);

    // Validate and process add-ons
    const validatedAddons = [];
    if (addon_selections && addon_selections.length > 0) {
      for (const selection of addon_selections) {
        const addonResult = await query(
          `SELECT * FROM service_addon 
           WHERE addon_id = $1 AND service_id = $2`,
          [selection.addon_id, pkg.service_id]
        );

        if (addonResult.rows.length === 0) {
          return res.status(400).json({
            error: "Invalid add-on",
            message: `Add-on ${selection.addon_id} does not belong to this service`,
          });
        }

        const addon = addonResult.rows[0];
        const quantity = parseInt(selection.quantity) || 1;

        total_price += parseFloat(addon.price) * quantity;
        delivery_days += parseInt(addon.delivery_days) * quantity;

        validatedAddons.push({
          addon_id: addon.addon_id,
          quantity,
          price: addon.price,
        });
      }
    }

    // Ensure minimum 1 day delivery
    delivery_days = Math.max(1, delivery_days);

    // Calculate due time
    const due_time = new Date();
    due_time.setDate(due_time.getDate() + delivery_days);

    // Use transaction
    const { tx } = await import("../db/tx.js");
    const result = await tx(async (client) => {
      // Create order
      const orderResult = await client.query(
        `INSERT INTO "order" (client_id, package_id, status, total_price, due_time, project_details, revisions_used)
         VALUES ($1, $2, 'pending', $3, $4, $5, 0)
         RETURNING order_id`,
        [client_id, package_id, total_price, due_time, project_details]
      );

      const order_id = orderResult.rows[0].order_id;

      // Insert add-ons
      for (const addon of validatedAddons) {
        await client.query(
          `INSERT INTO order_addon (order_id, addon_id, quantity, price_at_purchase)
           VALUES ($1, $2, $3, $4)`,
          [order_id, addon.addon_id, addon.quantity, addon.price]
        );
      }

      // Record transaction (payment held in escrow)
      await client.query(
        `INSERT INTO transaction (order_id, amount, payment_method, card_last4, status)
         VALUES ($1, $2, $3, $4, 'pending')`,
        [order_id, total_price, payment_method || "card", card_last4 || null]
      );

      // Create conversation for this order (only if it doesn't exist)
      const conversationCheck = await client.query(
        `SELECT conversation_id FROM conversation WHERE order_id = $1`,
        [order_id]
      );

      if (conversationCheck.rows.length === 0) {
        await client.query(
          `INSERT INTO conversation (order_id)
           VALUES ($1)`,
          [order_id]
        );
      }

      return { order_id, total_price, due_time };
    });

    res.status(201).json({
      success: true,
      order_id: result.order_id,
      message: "Order created successfully",
      total_price: result.total_price,
      due_time: result.due_time,
    });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({
      error: "Failed to create order",
      message: error.message,
    });
  }
};
/**
 * Get all orders (Admin only)
 * @access Private (Admin)
 */
export const getAllOrders = async (req, res) => {
  try {
    const { status } = req.query;

    let queryText = `
      SELECT 
        o.order_id,
        o.status,
        o.total_price,
        o.due_time,
        o.placed_time,
        o.project_details,
        o.revisions_used,
        o.created_at,
        s.service_id,
        s.title as service_title,
        p.package_id,
        p.name as package_name,
        p.revisions_allowed,
        client_user.first_name as client_first_name,
        client_user.last_name as client_last_name,
        freelancer_user.first_name as freelancer_first_name,
        freelancer_user.last_name as freelancer_last_name
      FROM "order" o
      JOIN package p ON o.package_id = p.package_id
      JOIN service s ON p.service_id = s.service_id
      JOIN "user" client_user ON o.client_id = client_user."userID"
      JOIN "user" freelancer_user ON s.freelancer_id = freelancer_user."userID"
    `;

    const params = [];
    if (status) {
      queryText += ` WHERE o.status = $1`;
      params.push(status);
    }

    queryText += ` ORDER BY o.placed_time DESC`;

    const result = await query(queryText, params);

    res.json({
      success: true,
      orders: result.rows,
    });
  } catch (error) {
    console.error("Error fetching all orders:", error);
    res.status(500).json({
      error: "Failed to fetch orders",
      message: error.message,
    });
  }
};
