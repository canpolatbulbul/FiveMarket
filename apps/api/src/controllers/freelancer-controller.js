import { query } from "../db/index.js";
import { AppError } from "../middleware/error-handler.js";

/**
 * Get freelancer dashboard statistics
 */
export const getDashboardStats = async (req, res) => {
  try {
    const { decodeUserID } = await import("../utils/hashids.js");
    const freelancer_id = decodeUserID(req.user.userID);

    // Get earnings and balance
    const earningsResult = await query(
      `SELECT 
        f.total_earned,
        COALESCE(SUM(CASE WHEN wr.status = 'completed' THEN wr.amount ELSE 0 END), 0) as total_withdrawn,
        COALESCE(SUM(CASE WHEN wr.status = 'pending' THEN wr.amount ELSE 0 END), 0) as pending_withdrawals
      FROM freelancer f
      LEFT JOIN withdrawal_request wr ON f."userID" = wr.freelancer_id
      WHERE f."userID" = $1
      GROUP BY f."userID", f.total_earned`,
      [freelancer_id]
    );

    const earnings = earningsResult.rows[0] || {
      total_earned: 0,
      total_withdrawn: 0,
      pending_withdrawals: 0,
    };

    const totalEarned = parseFloat(earnings.total_earned) || 0;
    const totalWithdrawn = parseFloat(earnings.total_withdrawn) || 0;
    const pendingWithdrawals = parseFloat(earnings.pending_withdrawals) || 0;
    const availableBalance = totalEarned - totalWithdrawn - pendingWithdrawals;

    // Get service stats
    const serviceStatsResult = await query(
      `SELECT 
        COUNT(*) as total_services,
        COUNT(CASE WHEN is_active = TRUE THEN 1 END) as active_services,
        COUNT(CASE WHEN is_active = FALSE THEN 1 END) as paused_services
      FROM service
      WHERE freelancer_id = $1`,
      [freelancer_id]
    );

    const serviceStats = serviceStatsResult.rows[0];

    // Get order stats
    const orderStatsResult = await query(
      `SELECT 
        COUNT(DISTINCT o.order_id) as total_orders,
        COUNT(DISTINCT CASE WHEN o.status = 'completed' THEN o.order_id END) as completed_orders,
        COUNT(DISTINCT CASE WHEN o.status IN ('pending', 'in_progress', 'delivered') THEN o.order_id END) as active_orders
      FROM service s
      JOIN package p ON s.service_id = p.service_id
      JOIN "order" o ON p.package_id = o.package_id
      WHERE s.freelancer_id = $1`,
      [freelancer_id]
    );

    const orderStats = orderStatsResult.rows[0];

    // Get rating stats
    const ratingStatsResult = await query(
      `SELECT 
        COALESCE(AVG(r.rating), 0) as avg_rating,
        COUNT(r.review_id) as review_count
      FROM service s
      JOIN package p ON s.service_id = p.service_id
      JOIN "order" o ON p.package_id = o.package_id
      JOIN review r ON o.order_id = r.order_id
      WHERE s.freelancer_id = $1`,
      [freelancer_id]
    );

    const ratingStats = ratingStatsResult.rows[0];

    // Get recent earnings (last 30 days)
    const recentEarningsResult = await query(
      `SELECT 
        DATE(o.updated_at) as date,
        SUM(o.total_price) as earnings
      FROM service s
      JOIN package p ON s.service_id = p.service_id
      JOIN "order" o ON p.package_id = o.package_id
      WHERE s.freelancer_id = $1 
        AND o.status = 'completed'
        AND o.updated_at >= NOW() - INTERVAL '30 days'
      GROUP BY DATE(o.updated_at)
      ORDER BY date ASC`,
      [freelancer_id]
    );

    res.json({
      success: true,
      stats: {
        earnings: {
          totalEarned,
          availableBalance,
          totalWithdrawn,
          pendingWithdrawals,
        },
        services: {
          total: parseInt(serviceStats.total_services) || 0,
          active: parseInt(serviceStats.active_services) || 0,
          paused: parseInt(serviceStats.paused_services) || 0,
        },
        orders: {
          total: parseInt(orderStats.total_orders) || 0,
          completed: parseInt(orderStats.completed_orders) || 0,
          active: parseInt(orderStats.active_orders) || 0,
        },
        rating: {
          average: parseFloat(ratingStats.avg_rating).toFixed(1),
          count: parseInt(ratingStats.review_count) || 0,
        },
        recentEarnings: recentEarningsResult.rows.map((row) => ({
          date: row.date,
          earnings: parseFloat(row.earnings),
        })),
      },
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    throw error;
  }
};

/**
 * Get earnings history
 */
export const getEarningsHistory = async (req, res) => {
  try {
    const { decodeUserID } = await import("../utils/hashids.js");
    const freelancer_id = decodeUserID(req.user.userID);
    const { page = 1, limit = 20 } = req.query;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const offset = (pageNum - 1) * limitNum;

    const result = await query(
      `SELECT 
        o.order_id,
        o.total_price as amount,
        o.updated_at as date,
        s.title as service_title,
        p.name as package_name,
        client_user.first_name || ' ' || client_user.last_name as client_name
      FROM service s
      JOIN package p ON s.service_id = p.service_id
      JOIN "order" o ON p.package_id = o.package_id
      JOIN "user" client_user ON o.client_id = client_user."userID"
      WHERE s.freelancer_id = $1 AND o.status = 'completed'
      ORDER BY o.updated_at DESC
      LIMIT $2 OFFSET $3`,
      [freelancer_id, limitNum, offset]
    );

    const countResult = await query(
      `SELECT COUNT(*) as total
      FROM service s
      JOIN package p ON s.service_id = p.service_id
      JOIN "order" o ON p.package_id = o.package_id
      WHERE s.freelancer_id = $1 AND o.status = 'completed'`,
      [freelancer_id]
    );

    res.json({
      success: true,
      earnings: result.rows.map((row) => ({
        orderId: row.order_id,
        amount: parseFloat(row.amount),
        date: row.date,
        serviceTitle: row.service_title,
        packageName: row.package_name,
        clientName: row.client_name,
      })),
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: parseInt(countResult.rows[0].total),
        totalPages: Math.ceil(parseInt(countResult.rows[0].total) / limitNum),
      },
    });
  } catch (error) {
    console.error("Error fetching earnings history:", error);
    throw error;
  }
};

/**
 * Request withdrawal
 */
export const requestWithdrawal = async (req, res) => {
  try {
    const { decodeUserID } = await import("../utils/hashids.js");
    const freelancer_id = decodeUserID(req.user.userID);
    const { amount } = req.body;

    // Validation
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      throw new AppError("Please provide a valid withdrawal amount", 400);
    }

    const withdrawalAmount = parseFloat(amount);

    if (withdrawalAmount < 10) {
      throw new AppError("Minimum withdrawal amount is $10", 400);
    }

    // Get available balance
    const balanceResult = await query(
      `SELECT 
        f.total_earned,
        COALESCE(SUM(CASE WHEN wr.status = 'completed' THEN wr.amount ELSE 0 END), 0) as total_withdrawn,
        COALESCE(SUM(CASE WHEN wr.status = 'pending' THEN wr.amount ELSE 0 END), 0) as pending_withdrawals
      FROM freelancer f
      LEFT JOIN withdrawal_request wr ON f."userID" = wr.freelancer_id
      WHERE f."userID" = $1
      GROUP BY f."userID", f.total_earned`,
      [freelancer_id]
    );

    const balance = balanceResult.rows[0];
    const totalEarned = parseFloat(balance.total_earned) || 0;
    const totalWithdrawn = parseFloat(balance.total_withdrawn) || 0;
    const pendingWithdrawals = parseFloat(balance.pending_withdrawals) || 0;
    const availableBalance = totalEarned - totalWithdrawn - pendingWithdrawals;

    if (withdrawalAmount > availableBalance) {
      throw new AppError(
        `Insufficient balance. Available: $${availableBalance.toFixed(2)}`,
        400
      );
    }

    // Create withdrawal request
    const result = await query(
      `INSERT INTO withdrawal_request (freelancer_id, amount, status, requested_at)
       VALUES ($1, $2, 'pending', NOW())
       RETURNING withdrawal_id, amount, status, requested_at`,
      [freelancer_id, withdrawalAmount]
    );

    res.json({
      success: true,
      message: "Withdrawal request submitted successfully",
      withdrawal: {
        withdrawalId: result.rows[0].withdrawal_id,
        amount: parseFloat(result.rows[0].amount),
        status: result.rows[0].status,
        requestedAt: result.rows[0].requested_at,
      },
    });
  } catch (error) {
    console.error("Error requesting withdrawal:", error);
    throw error;
  }
};

/**
 * Get withdrawal requests
 */
export const getWithdrawals = async (req, res) => {
  try {
    const { decodeUserID } = await import("../utils/hashids.js");
    const freelancer_id = decodeUserID(req.user.userID);

    const result = await query(
      `SELECT 
        withdrawal_id,
        amount,
        status,
        requested_at,
        processed_at,
        notes
      FROM withdrawal_request
      WHERE freelancer_id = $1
      ORDER BY requested_at DESC`,
      [freelancer_id]
    );

    res.json({
      success: true,
      withdrawals: result.rows.map((row) => ({
        withdrawalId: row.withdrawal_id,
        amount: parseFloat(row.amount),
        status: row.status,
        requestedAt: row.requested_at,
        processedAt: row.processed_at,
        notes: row.notes,
      })),
    });
  } catch (error) {
    console.error("Error fetching withdrawals:", error);
    throw error;
  }
};

/**
 * Toggle service active status (pause/reactivate)
 */
export const toggleServiceStatus = async (req, res) => {
  try {
    const { decodeUserID } = await import("../utils/hashids.js");
    const freelancer_id = decodeUserID(req.user.userID);
    const { id } = req.params;

    // Verify service ownership
    const serviceResult = await query(
      `SELECT service_id, is_active, freelancer_id FROM service WHERE service_id = $1`,
      [id]
    );

    if (serviceResult.rows.length === 0) {
      throw new AppError("Service not found", 404);
    }

    const service = serviceResult.rows[0];

    if (parseInt(service.freelancer_id) !== parseInt(freelancer_id)) {
      throw new AppError(
        "You do not have permission to modify this service",
        403
      );
    }

    // Toggle status
    const newStatus = !service.is_active;
    const pausedAt = newStatus ? null : new Date();

    await query(
      `UPDATE service 
       SET is_active = $1, paused_at = $2, updated_at = NOW()
       WHERE service_id = $3`,
      [newStatus, pausedAt, id]
    );

    res.json({
      success: true,
      message: `Service ${newStatus ? "activated" : "paused"} successfully`,
      service: {
        serviceId: id,
        isActive: newStatus,
        pausedAt,
      },
    });
  } catch (error) {
    console.error("Error toggling service status:", error);
    throw error;
  }
};
