import { query } from "../db/index.js";
import { encodeUserID } from "../utils/hashids.js";
import { AppError } from "../middleware/error-handler.js";

/**
 * Get admin dashboard statistics
 * @access Private (Admin)
 */
export const getDashboardStats = async (req, res) => {
  try {
    // Top 5 Earners
    const topEarnersResult = await query(`
      SELECT 
        f."userID",
        u.first_name,
        u.last_name,
        u.created_at as member_since,
        f.total_earned,
        COUNT(DISTINCT o.order_id) as total_orders,
        COALESCE(AVG(r.rating), 0) as avg_rating,
        COUNT(DISTINCT r.review_id) as review_count
      FROM freelancer f
      JOIN "user" u ON f."userID" = u."userID"
      LEFT JOIN service s ON s.freelancer_id = f."userID"
      LEFT JOIN package p ON p.service_id = s.service_id
      LEFT JOIN "order" o ON o.package_id = p.package_id AND o.status = 'completed'
      LEFT JOIN review r ON r.order_id = o.order_id
      GROUP BY f."userID", u.first_name, u.last_name, u.created_at, f.total_earned
      ORDER BY f.total_earned DESC
      LIMIT 5
    `);

    // Popular Categories (by order count)
    const popularCategoriesResult = await query(`
      SELECT 
        sc.category_id,
        sc.description,
        COUNT(DISTINCT o.order_id) as order_count,
        SUM(o.total_price) as total_revenue
      FROM service_category sc
      LEFT JOIN services_in_category sic ON sic.category_id = sc.category_id
      LEFT JOIN service s ON s.service_id = sic.service_id
      LEFT JOIN package p ON p.service_id = s.service_id
      LEFT JOIN "order" o ON o.package_id = p.package_id
      GROUP BY sc.category_id, sc.description
      ORDER BY order_count DESC
      LIMIT 5
    `);

    // Top Rated Services (by average rating)
    const topRatedServicesResult = await query(`
      SELECT 
        s.service_id,
        s.title,
        u.first_name,
        u.last_name,
        AVG(r.rating) as avg_rating,
        COUNT(r.review_id) as review_count
      FROM service s
      JOIN "user" u ON s.freelancer_id = u."userID"
      JOIN package p ON p.service_id = s.service_id
      JOIN "order" o ON o.package_id = p.package_id
      JOIN review r ON r.order_id = o.order_id
      GROUP BY s.service_id, s.title, u.first_name, u.last_name
      HAVING COUNT(r.review_id) >= 1
      ORDER BY avg_rating DESC, review_count DESC
      LIMIT 5
    `);

    // Recent Activity (last 10 orders)
    const recentActivityResult = await query(`
      SELECT 
        o.order_id,
        o.status,
        o.total_price,
        o.placed_time,
        s.title as service_title,
        client_user.first_name as client_first_name,
        client_user.last_name as client_last_name,
        freelancer_user.first_name as freelancer_first_name,
        freelancer_user.last_name as freelancer_last_name
      FROM "order" o
      JOIN package p ON o.package_id = p.package_id
      JOIN service s ON p.service_id = s.service_id
      JOIN "user" client_user ON o.client_id = client_user."userID"
      JOIN "user" freelancer_user ON s.freelancer_id = freelancer_user."userID"
      ORDER BY o.placed_time DESC
      LIMIT 10
    `);

    // Revenue Overview
    const revenueResult = await query(`
      SELECT 
        COUNT(*) as total_transactions,
        SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END) as completed_revenue,
        SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) as pending_revenue,
        SUM(CASE WHEN status = 'refunded' THEN amount ELSE 0 END) as refunded_amount
      FROM transaction
    `);

    // User Growth (last 30 days)
    const userGrowthResult = await query(`
      SELECT 
        COUNT(*) as new_users_this_month,
        COUNT(CASE WHEN created_at >= NOW() - INTERVAL '7 days' THEN 1 END) as new_users_this_week
      FROM "user"
      WHERE created_at >= NOW() - INTERVAL '30 days'
    `);

    // Total counts
    const totalUsersResult = await query(
      `SELECT COUNT(*) as total FROM "user"`
    );
    const totalOrdersResult = await query(
      `SELECT COUNT(*) as total FROM "order"`
    );
    const activeDisputesResult = await query(`
      SELECT COUNT(*) as total 
      FROM dispute_resolution 
      WHERE status IN ('open', 'under_review')
    `);

    res.json({
      success: true,
      stats: {
        totals: {
          users: parseInt(totalUsersResult.rows[0].total),
          orders: parseInt(totalOrdersResult.rows[0].total),
          activeDisputes: parseInt(activeDisputesResult.rows[0].total),
        },
        topEarners: topEarnersResult.rows.map((earner) => ({
          userID: encodeUserID(earner.userID),
          name: `${earner.first_name} ${earner.last_name}`,
          memberSince: earner.member_since,
          totalEarned: parseFloat(earner.total_earned) || 0,
          totalOrders: parseInt(earner.total_orders) || 0,
          avgRating: parseFloat(earner.avg_rating).toFixed(1),
          reviewCount: parseInt(earner.review_count) || 0,
        })),
        popularCategories: popularCategoriesResult.rows.map((cat) => ({
          categoryId: cat.category_id,
          name: cat.description,
          orderCount: parseInt(cat.order_count) || 0,
          totalRevenue: parseFloat(cat.total_revenue) || 0,
        })),
        topRatedServices: topRatedServicesResult.rows.map((service) => ({
          serviceId: service.service_id,
          title: service.title,
          freelancerName: `${service.first_name} ${service.last_name}`,
          avgRating: parseFloat(service.avg_rating).toFixed(1),
          reviewCount: parseInt(service.review_count),
        })),
        recentActivity: recentActivityResult.rows.map((activity) => ({
          orderId: activity.order_id,
          status: activity.status,
          totalPrice: parseFloat(activity.total_price),
          placedTime: activity.placed_time,
          serviceTitle: activity.service_title,
          clientName: `${activity.client_first_name} ${activity.client_last_name}`,
          freelancerName: `${activity.freelancer_first_name} ${activity.freelancer_last_name}`,
        })),
        revenue: {
          totalTransactions:
            parseInt(revenueResult.rows[0].total_transactions) || 0,
          completedRevenue:
            parseFloat(revenueResult.rows[0].completed_revenue) || 0,
          pendingRevenue:
            parseFloat(revenueResult.rows[0].pending_revenue) || 0,
          refundedAmount:
            parseFloat(revenueResult.rows[0].refunded_amount) || 0,
        },
        userGrowth: {
          newUsersThisMonth:
            parseInt(userGrowthResult.rows[0].new_users_this_month) || 0,
          newUsersThisWeek:
            parseInt(userGrowthResult.rows[0].new_users_this_week) || 0,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({
      error: "Failed to fetch dashboard statistics",
      message: error.message,
    });
  }
};

/**
 * Get all withdrawal requests
 * @access Private (Admin)
 */
export const getAllWithdrawals = async (req, res) => {
  try {
    const { status = "all" } = req.query;

    let statusFilter = "";
    const params = [];

    if (status !== "all") {
      statusFilter = "WHERE wr.status = $1";
      params.push(status);
    }

    const withdrawalsResult = await query(
      `SELECT 
        wr.withdrawal_id, wr.freelancer_id, wr.amount, wr.status,
        wr.requested_at, wr.processed_at,
        u.first_name, u.last_name, u.email,
        f.total_earned, f.total_withdrawn
      FROM withdrawal_request wr
      JOIN "user" u ON wr.freelancer_id = u."userID"
      JOIN freelancer f ON wr.freelancer_id = f."userID"
      ${statusFilter}
      ORDER BY wr.requested_at DESC`,
      params
    );

    const countResult = await query(`
      SELECT 
        COUNT(*) FILTER (WHERE status = 'pending') as pending_count,
        COUNT(*) FILTER (WHERE status = 'approved') as approved_count,
        COUNT(*) FILTER (WHERE status = 'rejected') as rejected_count,
        COUNT(*) as total_count
      FROM withdrawal_request
    `);

    res.json({
      success: true,
      withdrawals: withdrawalsResult.rows.map((row) => ({
        withdrawalId: row.withdrawal_id,
        freelancerId: encodeUserID(row.freelancer_id),
        freelancerName: `${row.first_name} ${row.last_name}`,
        freelancerEmail: row.email,
        amount: parseFloat(row.amount),
        status: row.status,
        requestedAt: row.requested_at,
        processedAt: row.processed_at,
        totalEarned: parseFloat(row.total_earned),
        totalWithdrawn: parseFloat(row.total_withdrawn),
      })),
      counts: {
        pending: parseInt(countResult.rows[0].pending_count) || 0,
        approved: parseInt(countResult.rows[0].approved_count) || 0,
        rejected: parseInt(countResult.rows[0].rejected_count) || 0,
        total: parseInt(countResult.rows[0].total_count) || 0,
      },
    });
  } catch (error) {
    console.error("Error fetching withdrawals:", error);
    res.status(500).json({
      error: "Failed to fetch withdrawal requests",
      message: error.message,
    });
  }
};

/**
 * Process withdrawal request (approve/reject)
 * @access Private (Admin)
 */
export const processWithdrawal = async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body;

    if (!action || !["approve", "reject"].includes(action)) {
      throw new AppError("Invalid action. Must be 'approve' or 'reject'", 400);
    }

    const withdrawalResult = await query(
      `SELECT * FROM withdrawal_request WHERE withdrawal_id = $1`,
      [id]
    );

    if (withdrawalResult.rows.length === 0) {
      throw new AppError("Withdrawal request not found", 404);
    }

    const withdrawal = withdrawalResult.rows[0];

    if (withdrawal.status !== "pending") {
      throw new AppError(
        `Withdrawal request already ${withdrawal.status}`,
        400
      );
    }

    if (action === "approve") {
      await query("BEGIN");

      try {
        await query(
          `UPDATE withdrawal_request 
           SET status = 'approved', processed_at = NOW()
           WHERE withdrawal_id = $1`,
          [id]
        );

        await query(
          `UPDATE freelancer 
           SET total_withdrawn = total_withdrawn + $1
           WHERE "userID" = $2`,
          [withdrawal.amount, withdrawal.freelancer_id]
        );

        // Create money_transaction for audit trail
        await query(
          `INSERT INTO money_transaction (amount, receiver_iban, sender_iban)
           VALUES ($1, 'PENDING', 'PLATFORM')`,
          [withdrawal.amount]
        );

        await query("COMMIT");

        res.json({
          success: true,
          message: "Withdrawal approved successfully",
          withdrawal: {
            withdrawalId: id,
            status: "approved",
            amount: parseFloat(withdrawal.amount),
            processedAt: new Date(),
          },
        });
      } catch (error) {
        await query("ROLLBACK");
        throw error;
      }
    } else {
      await query(
        `UPDATE withdrawal_request 
         SET status = 'rejected', processed_at = NOW()
         WHERE withdrawal_id = $1`,
        [id]
      );

      res.json({
        success: true,
        message: "Withdrawal rejected",
        withdrawal: {
          withdrawalId: id,
          status: "rejected",
          amount: parseFloat(withdrawal.amount),
          processedAt: new Date(),
        },
      });
    }
  } catch (error) {
    console.error("Error processing withdrawal:", error);
    if (error instanceof AppError) throw error;
    res.status(500).json({
      error: "Failed to process withdrawal request",
      message: error.message,
    });
  }
};
