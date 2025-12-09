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
 * Get service by ID with packages
 * Returns detailed service information including all packages
 */
export const getServiceById = async (req, res) => {
  try {
    const { id } = req.params;

    const serviceQuery = `
      SELECT 
        s.*,
        u.first_name,
        u.last_name,
        u.email,
        COALESCE(AVG(r.rating), 0) as avg_rating,
        COUNT(DISTINCT r.review_id) as review_count
      FROM service s
      JOIN "user" u ON s.freelancer_id = u."userID"
      LEFT JOIN package p ON s.service_id = p.service_id
      LEFT JOIN "order" o ON p.package_id = o.package_id
      LEFT JOIN review r ON o.order_id = r.order_id
      WHERE s.service_id = $1
      GROUP BY s.service_id, u.first_name, u.last_name, u.email
    `;

    const packagesQuery = `
      SELECT * FROM package
      WHERE service_id = $1
      ORDER BY price ASC
    `;

    const [serviceResult, packagesResult] = await Promise.all([
      query(serviceQuery, [id]),
      query(packagesQuery, [id]),
    ]);

    if (serviceResult.rows.length === 0) {
      return res.status(404).json({
        error: "Service not found",
        message: "The requested service does not exist",
      });
    }

    const service = serviceResult.rows[0];
    const packages = packagesResult.rows;

    res.json({
      service: {
        ...service,
        freelancer_name: `${service.first_name} ${service.last_name}`,
        rating: parseFloat(service.avg_rating).toFixed(1),
        reviews: parseInt(service.review_count),
      },
      packages,
    });
  } catch (error) {
    console.error("Error fetching service:", error);
    res.status(500).json({
      error: "Failed to fetch service",
      message: "An error occurred while fetching service details",
    });
  }
};
