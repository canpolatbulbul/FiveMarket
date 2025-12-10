import { query } from "../db/index.js";

/**
 * Get featured/trending services
 * Returns top services ordered by reviews and ratings
 */
export const getFeaturedServices = async (req, res) => {
  try {
    // Get services with their packages and categories
    const servicesQuery = `
      SELECT 
        s.service_id,
        s.title,
        s.description,
        s.freelancer_id,
        u.first_name,
        u.last_name,
        MIN(p.price) as min_price,
        COUNT(DISTINCT p.package_id) as package_count,
        COALESCE(AVG(r.rating), 5.0) as avg_rating,
        COUNT(DISTINCT r.review_id) as review_count
      FROM service s
      JOIN "user" u ON s.freelancer_id = u."userID"
      JOIN package p ON s.service_id = p.service_id
      LEFT JOIN "order" o ON p.package_id = o.package_id
      LEFT JOIN review r ON o.order_id = r.order_id
      GROUP BY s.service_id, s.title, s.description, s.freelancer_id, u.first_name, u.last_name
      ORDER BY review_count DESC, avg_rating DESC
      LIMIT 12
    `;

    const result = await query(servicesQuery);

    const services = result.rows.map((row) => ({
      service_id: row.service_id,
      title: row.title,
      description: row.description,
      freelancer_id: row.freelancer_id,
      freelancer_name: `${row.first_name} ${row.last_name}`,
      min_price: parseFloat(row.min_price),
      package_count: parseInt(row.package_count),
      rating: parseFloat(row.avg_rating).toFixed(1),
      reviews: parseInt(row.review_count),
    }));

    res.json({ services });
  } catch (error) {
    console.error("Error fetching featured services:", error);
    res.status(500).json({
      error: "Failed to fetch services",
      message: "An error occurred while fetching featured services",
    });
  }
};

/**
 * Get service by ID with packages, reviews, and freelancer stats
 * Returns comprehensive service information
 */
export const getServiceById = async (req, res) => {
  try {
    const { id } = req.params;

    // Get service details with category
    const serviceQuery = `
      SELECT 
        s.*,
        c.description as category_name,
        u.first_name,
        u.last_name,
        u.email,
        u.created_at as freelancer_joined,
        COALESCE(AVG(r.rating), 0) as avg_rating,
        COUNT(DISTINCT r.review_id) as review_count
      FROM service s
      JOIN "user" u ON s.freelancer_id = u."userID"
      LEFT JOIN package p ON s.service_id = p.service_id
      LEFT JOIN services_in_category sic ON p.package_id = sic.package_id
      LEFT JOIN service_category c ON sic.category_id = c.category_id
      LEFT JOIN "order" o ON p.package_id = o.package_id
      LEFT JOIN review r ON o.order_id = r.order_id
      WHERE s.service_id = $1
      GROUP BY s.service_id, c.description, u.first_name, u.last_name, u.email, u.created_at
    `;

    // Get all packages for this service
    const packagesQuery = `
      SELECT * FROM package
      WHERE service_id = $1
      ORDER BY price ASC
    `;

    // Get reviews with reviewer details
    const reviewsQuery = `
      SELECT 
        r.review_id,
        r.rating,
        r.comment,
        r.submit_time,
        u.first_name,
        u.last_name
      FROM review r
      JOIN "order" o ON r.order_id = o.order_id
      JOIN package p ON o.package_id = p.package_id
      JOIN "user" u ON o.client_id = u."userID"
      WHERE p.service_id = $1
      ORDER BY r.submit_time DESC
    `;

    // Get freelancer statistics
    const freelancerStatsQuery = `
      SELECT 
        COUNT(DISTINCT o.order_id) as total_orders,
        COUNT(DISTINCT CASE WHEN o.status = 'completed' THEN o.order_id END) as completed_orders,
        COALESCE(AVG(r.rating), 0) as overall_rating
      FROM freelancer f
      LEFT JOIN service s ON f."userID" = s.freelancer_id
      LEFT JOIN package p ON s.service_id = p.service_id
      LEFT JOIN "order" o ON p.package_id = o.package_id
      LEFT JOIN review r ON o.order_id = r.order_id
      WHERE f."userID" = (SELECT freelancer_id FROM service WHERE service_id = $1)
      GROUP BY f."userID"
    `;

    const [serviceResult, packagesResult, reviewsResult, statsResult] =
      await Promise.all([
        query(serviceQuery, [id]),
        query(packagesQuery, [id]),
        query(reviewsQuery, [id]),
        query(freelancerStatsQuery, [id]),
      ]);

    if (serviceResult.rows.length === 0) {
      return res.status(404).json({
        error: "Service not found",
        message: "The requested service does not exist",
      });
    }

    const service = serviceResult.rows[0];
    const packages = packagesResult.rows;
    const reviews = reviewsResult.rows.map((review) => ({
      review_id: review.review_id,
      rating: parseInt(review.rating),
      comment: review.comment,
      submit_time: review.submit_time,
      reviewer_name: `${review.first_name} ${review.last_name}`,
    }));

    const stats = statsResult.rows[0] || {
      total_orders: 0,
      completed_orders: 0,
      overall_rating: 0,
    };

    res.json({
      service: {
        service_id: service.service_id,
        title: service.title,
        description: service.description,
        category_name: service.category_name,
        freelancer_id: service.freelancer_id,
        freelancer_name: `${service.first_name} ${service.last_name}`,
        freelancer_email: service.email,
        rating: parseFloat(service.avg_rating).toFixed(1),
        reviews: parseInt(service.review_count),
        created_at: service.created_at,
      },
      packages,
      reviews,
      freelancer_stats: {
        total_orders: parseInt(stats.total_orders),
        completed_orders: parseInt(stats.completed_orders),
        overall_rating: parseFloat(stats.overall_rating).toFixed(1),
        member_since: service.freelancer_joined,
      },
    });
  } catch (error) {
    console.error("Error fetching service:", error);
    res.status(500).json({
      error: "Failed to fetch service",
      message: "An error occurred while fetching service details",
    });
  }
};

/**
 * Search and filter services with pagination
 * Supports: search query, category, price range, rating, delivery time, sorting
 */
export const searchServices = async (req, res) => {
  try {
    const {
      q = "", // Search query
      category, // Category ID
      min, // Min price
      max, // Max price
      rating, // Min rating
      delivery, // Max delivery days
      sort = "popular", // Sort by: popular, newest, price_low, price_high, rating
      page = 1, // Page number
      limit = 20, // Items per page
    } = req.query;

    // Validate and sanitize inputs
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit) || 20));
    const offset = (pageNum - 1) * limitNum;

    // Build WHERE conditions
    const conditions = [];
    const params = [];
    let paramCount = 0;

    // Search query (title or description)
    if (q && q.trim()) {
      paramCount++;
      conditions.push(
        `(s.title ILIKE $${paramCount} OR s.description ILIKE $${paramCount})`
      );
      params.push(`%${q.trim()}%`);
    }

    // Category filter (through services_in_category junction table)
    if (category) {
      paramCount++;
      conditions.push(`EXISTS (
        SELECT 1 FROM package p2 
        JOIN services_in_category sic2 ON p2.package_id = sic2.package_id 
        WHERE p2.service_id = s.service_id AND sic2.category_id = $${paramCount}
      )`);
      params.push(parseInt(category));
    }

    // Price range filter (based on minimum package price)
    if (min) {
      paramCount++;
      conditions.push(`min_price >= $${paramCount}`);
      params.push(parseFloat(min));
    }

    if (max) {
      paramCount++;
      conditions.push(`min_price <= $${paramCount}`);
      params.push(parseFloat(max));
    }

    // Rating filter
    if (rating) {
      paramCount++;
      conditions.push(`avg_rating >= $${paramCount}`);
      params.push(parseFloat(rating));
    }

    // Delivery time filter (based on minimum delivery time)
    if (delivery) {
      paramCount++;
      conditions.push(`min_delivery <= $${paramCount}`);
      params.push(parseInt(delivery));
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    // Determine sort order
    let orderBy;
    switch (sort) {
      case "newest":
        orderBy = "s.created_at DESC";
        break;
      case "price_low":
        orderBy = "min_price ASC";
        break;
      case "price_high":
        orderBy = "min_price DESC";
        break;
      case "rating":
        orderBy = "avg_rating DESC, review_count DESC";
        break;
      case "popular":
      default:
        orderBy = "review_count DESC, avg_rating DESC";
    }

    // Count total matching services
    const countQuery = `
      SELECT COUNT(DISTINCT s.service_id) as total
      FROM (
        SELECT 
          s.service_id,
          MIN(p.price) as min_price,
          MIN(p.delivery_time) as min_delivery,
          COALESCE(AVG(r.rating), 0) as avg_rating,
          COUNT(DISTINCT r.review_id) as review_count
        FROM service s
        JOIN package p ON s.service_id = p.service_id
        LEFT JOIN "order" o ON p.package_id = o.package_id
        LEFT JOIN review r ON o.order_id = r.order_id
        GROUP BY s.service_id
      ) AS service_stats
      JOIN service s ON s.service_id = service_stats.service_id
      ${whereClause}
    `;

    // Get paginated services
    const servicesQuery = `
      SELECT 
        s.service_id,
        s.title,
        s.description,
        STRING_AGG(DISTINCT c.description, ', ') as category_name,
        s.freelancer_id,
        u.first_name,
        u.last_name,
        service_stats.min_price,
        service_stats.min_delivery,
        service_stats.avg_rating,
        service_stats.review_count,
        s.created_at
      FROM (
        SELECT 
          s.service_id,
          MIN(p.price) as min_price,
          MIN(p.delivery_time) as min_delivery,
          COALESCE(AVG(r.rating), 0) as avg_rating,
          COUNT(DISTINCT r.review_id) as review_count
        FROM service s
        JOIN package p ON s.service_id = p.service_id
        LEFT JOIN "order" o ON p.package_id = o.package_id
        LEFT JOIN review r ON o.order_id = r.order_id
        GROUP BY s.service_id
      ) AS service_stats
      JOIN service s ON s.service_id = service_stats.service_id
      JOIN "user" u ON s.freelancer_id = u."userID"
      LEFT JOIN package p ON s.service_id = p.service_id
      LEFT JOIN services_in_category sic ON p.package_id = sic.package_id
      LEFT JOIN service_category c ON sic.category_id = c.category_id
      ${whereClause}
      GROUP BY s.service_id, s.title, s.description, s.freelancer_id, u.first_name, u.last_name, 
               service_stats.min_price, service_stats.min_delivery, service_stats.avg_rating, service_stats.review_count, s.created_at
      ORDER BY ${orderBy}
      LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
    `;

    params.push(limitNum, offset);

    const [countResult, servicesResult] = await Promise.all([
      query(countQuery, params.slice(0, paramCount)),
      query(servicesQuery, params),
    ]);

    const total = parseInt(countResult.rows[0]?.total || 0);
    const totalPages = Math.ceil(total / limitNum);

    const services = servicesResult.rows.map((row) => ({
      service_id: row.service_id,
      title: row.title,
      description: row.description,
      category_name: row.category_name,
      freelancer_id: row.freelancer_id,
      freelancer_name: `${row.first_name} ${row.last_name}`,
      min_price: parseFloat(row.min_price),
      min_delivery: parseInt(row.min_delivery),
      rating: parseFloat(row.avg_rating).toFixed(1),
      reviews: parseInt(row.review_count),
      created_at: row.created_at,
    }));

    res.json({
      services,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages,
        hasNext: pageNum < totalPages,
        hasPrev: pageNum > 1,
      },
    });
  } catch (error) {
    console.error("Error searching services:", error);
    res.status(500).json({
      error: "Failed to search services",
      message: "An error occurred while searching for services",
    });
  }
};
