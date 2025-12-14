import { query } from "../db/index.js";
import { encodeUserID } from "../utils/hashids.js";

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
        f.total_earned,
        COUNT(DISTINCT o.order_id) as total_orders
      FROM freelancer f
      JOIN "user" u ON f."userID" = u."userID"
      LEFT JOIN service s ON s.freelancer_id = f."userID"
      LEFT JOIN package p ON p.service_id = s.service_id
      LEFT JOIN "order" o ON o.package_id = p.package_id AND o.status = 'completed'
      GROUP BY f."userID", u.first_name, u.last_name, f.total_earned
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
          totalEarned: parseFloat(earner.total_earned) || 0,
          totalOrders: parseInt(earner.total_orders) || 0,
        })),
        popularCategories: popularCategoriesResult.rows.map((cat) => ({
          categoryId: cat.category_id,
          name: cat.description,
          orderCount: parseInt(cat.order_count) || 0,
          totalRevenue: parseFloat(cat.total_revenue) || 0,
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
