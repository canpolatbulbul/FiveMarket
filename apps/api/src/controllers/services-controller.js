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
        COUNT(DISTINCT r.review_id) as review_count,
        (
          SELECT pi.file_path 
          FROM portfolio_image pi 
          WHERE pi.service_id = s.service_id 
          ORDER BY pi.display_order 
          LIMIT 1
        ) as portfolio_image,
        (
          SELECT sc.category_id
          FROM services_in_category sic
          JOIN service_category sc ON sic.category_id = sc.category_id
          WHERE sic.service_id = s.service_id
          LIMIT 1
        ) as category_id,
        (
          SELECT sc.description
          FROM services_in_category sic
          JOIN service_category sc ON sic.category_id = sc.category_id
          WHERE sic.service_id = s.service_id
          LIMIT 1
        ) as category_name
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
      starting_price: parseFloat(row.min_price),
      package_count: parseInt(row.package_count),
      rating: parseFloat(row.avg_rating).toFixed(1),
      reviews: parseInt(row.review_count),
      portfolio_image: row.portfolio_image, // First portfolio image or null
      category_id: row.category_id,
      category_name: row.category_name,
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
      LEFT JOIN services_in_category sic ON s.service_id = sic.service_id
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

    // Get portfolio images
    const portfolioImagesQuery = `
      SELECT 
        image_id,
        filename,
        file_path,
        display_order
      FROM portfolio_image
      WHERE service_id = $1
      ORDER BY display_order ASC
    `;

    const [
      serviceResult,
      packagesResult,
      reviewsResult,
      statsResult,
      imagesResult,
    ] = await Promise.all([
      query(serviceQuery, [id]),
      query(packagesQuery, [id]),
      query(reviewsQuery, [id]),
      query(freelancerStatsQuery, [id]),
      query(portfolioImagesQuery, [id]),
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

    const portfolio_images = imagesResult.rows.map((img) => ({
      image_id: img.image_id,
      url: img.file_path,
      display_order: img.display_order,
    }));

    // Get category IDs for this service
    const categoryIdsQuery = `
      SELECT DISTINCT sic.category_id
      FROM services_in_category sic
      WHERE sic.service_id = $1
    `;
    const categoryIdsResult = await query(categoryIdsQuery, [id]);
    const category_ids = categoryIdsResult.rows.map((row) => row.category_id);

    res.json({
      service: {
        service_id: service.service_id,
        title: service.title,
        description: service.description,
        category_name: service.category_name,
        category_ids: category_ids, // Add category IDs array
        freelancer_id: service.freelancer_id,
        freelancer_name: `${service.first_name} ${service.last_name}`,
        freelancer_email: service.email,
        rating: parseFloat(service.avg_rating).toFixed(1),
        reviews: parseInt(service.review_count),
        created_at: service.created_at,
      },
      packages,
      reviews,
      portfolio_images,
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
        JOIN services_in_category sic2 ON s2.service_id = sic2.service_id 
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
        s.created_at,
        (
          SELECT pi.file_path 
          FROM portfolio_image pi 
          WHERE pi.service_id = s.service_id 
          ORDER BY pi.display_order 
          LIMIT 1
        ) as portfolio_image
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
      LEFT JOIN services_in_category sic ON s.service_id = sic.service_id
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
      portfolio_image: row.portfolio_image, // First portfolio image or null
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

/**
 * Create a new service with packages and portfolio images
 * Only accessible to freelancers
 */
export const createService = async (req, res) => {
  try {
    const { title, description, category_ids, packages, addons } = req.body;

    // Decode the hashid userID from JWT to get actual numeric ID
    const { decodeUserID } = await import("../utils/hashids.js");
    const freelancer_id = decodeUserID(req.user.userID);
    const uploadedFiles = req.files || [];

    // Validate required fields
    if (!title || !description || !packages || packages.length === 0) {
      return res.status(400).json({
        error: "Missing required fields",
        message: "Title, description, and at least one package are required",
      });
    }

    // Parse packages if it's a string (from FormData)
    let parsedPackages = packages;
    if (typeof packages === "string") {
      try {
        parsedPackages = JSON.parse(packages);
      } catch (e) {
        return res.status(400).json({
          error: "Invalid packages format",
          message: "Packages must be valid JSON",
        });
      }
    }

    // Parse category_ids if it's a string
    let parsedCategoryIds = category_ids;
    if (typeof category_ids === "string") {
      try {
        parsedCategoryIds = JSON.parse(category_ids);
      } catch (e) {
        return res.status(400).json({
          error: "Invalid category_ids format",
          message: "Category IDs must be valid JSON array",
        });
      }
    }

    // Validate and normalize packages
    for (let i = 0; i < parsedPackages.length; i++) {
      const pkg = parsedPackages[i];

      // Normalize types (FormData sends strings)
      pkg.price =
        typeof pkg.price === "string" ? parseFloat(pkg.price) : pkg.price;
      pkg.delivery_time =
        typeof pkg.delivery_time === "string"
          ? parseInt(pkg.delivery_time)
          : pkg.delivery_time;

      if (
        !pkg.name ||
        typeof pkg.name !== "string" ||
        pkg.name.trim().length < 2
      ) {
        return res.status(400).json({
          error: "Invalid package data",
          message: `Package ${i + 1}: Name must be at least 2 characters`,
        });
      }

      if (isNaN(pkg.price) || pkg.price <= 0) {
        return res.status(400).json({
          error: "Invalid package data",
          message: `Package ${i + 1}: Price must be a positive number`,
        });
      }

      if (
        isNaN(pkg.delivery_time) ||
        pkg.delivery_time <= 0 ||
        !Number.isInteger(pkg.delivery_time)
      ) {
        return res.status(400).json({
          error: "Invalid package data",
          message: `Package ${i + 1}: Delivery time must be a positive integer`,
        });
      }
    }

    // Validate category IDs exist in database
    if (parsedCategoryIds && parsedCategoryIds.length > 0) {
      const categoryCheck = await query(
        `SELECT category_id FROM service_category WHERE category_id = ANY($1::int[])`,
        [parsedCategoryIds]
      );

      if (categoryCheck.rows.length !== parsedCategoryIds.length) {
        return res.status(400).json({
          error: "Invalid category IDs",
          message: "One or more category IDs do not exist",
        });
      }
    }

    // Parse add-ons if provided
    let parsedAddons = [];
    if (addons) {
      if (typeof addons === "string") {
        try {
          parsedAddons = JSON.parse(addons);
        } catch (e) {
          return res.status(400).json({
            error: "Invalid addons format",
            message: "Add-ons must be valid JSON",
          });
        }
      } else {
        parsedAddons = addons;
      }

      // Validate add-ons
      for (let i = 0; i < parsedAddons.length; i++) {
        const addon = parsedAddons[i];

        // Normalize types
        addon.price =
          typeof addon.price === "string"
            ? parseFloat(addon.price)
            : addon.price;
        addon.delivery_days =
          typeof addon.delivery_days === "string"
            ? parseInt(addon.delivery_days)
            : addon.delivery_days;

        if (!addon.name || addon.name.trim().length < 2) {
          return res.status(400).json({
            error: "Invalid add-on data",
            message: `Add-on ${i + 1}: Name must be at least 2 characters`,
          });
        }

        if (isNaN(addon.price) || addon.price < 0) {
          return res.status(400).json({
            error: "Invalid add-on data",
            message: `Add-on ${i + 1}: Price must be a non-negative number`,
          });
        }

        if (isNaN(addon.delivery_days)) {
          return res.status(400).json({
            error: "Invalid add-on data",
            message: `Add-on ${i + 1}: Delivery days must be a number`,
          });
        }
      }
    }

    // Use transaction helper
    const { tx } = await import("../db/tx.js");
    const service_id = await tx(async (client) => {
      // Create service
      const serviceResult = await client.query(
        `INSERT INTO service (freelancer_id, title, description) 
         VALUES ($1, $2, $3) 
         RETURNING service_id`,
        [freelancer_id, title, description]
      );

      const service_id = serviceResult.rows[0].service_id;

      // Create packages
      for (const pkg of parsedPackages) {
        const packageResult = await client.query(
          `INSERT INTO package (service_id, name, description, price, delivery_time, revisions_allowed) 
           VALUES ($1, $2, $3, $4, $5, $6) 
           RETURNING package_id`,
          [
            service_id,
            pkg.name,
            pkg.description,
            pkg.price,
            pkg.delivery_time,
            pkg.revisions_allowed || 0,
          ]
        );
      }

      // Link service to categories (once per service, not per package)
      if (parsedCategoryIds && parsedCategoryIds.length > 0) {
        for (const category_id of parsedCategoryIds) {
          await client.query(
            `INSERT INTO services_in_category (service_id, category_id) 
             VALUES ($1, $2)`,
            [service_id, category_id]
          );
        }
      }

      // Create add-ons
      if (parsedAddons && parsedAddons.length > 0) {
        for (const addon of parsedAddons) {
          await client.query(
            `INSERT INTO service_addon (service_id, name, description, price, delivery_days) 
             VALUES ($1, $2, $3, $4, $5)`,
            [
              service_id,
              addon.name,
              addon.description || null,
              addon.price,
              addon.delivery_days,
            ]
          );
        }
      }

      // Save portfolio images
      if (uploadedFiles.length > 0) {
        for (let i = 0; i < uploadedFiles.length; i++) {
          const file = uploadedFiles[i];
          await client.query(
            `INSERT INTO portfolio_image (service_id, filename, file_path, display_order) 
             VALUES ($1, $2, $3, $4)`,
            [
              service_id,
              file.filename,
              `/uploads/portfolio/${file.filename}`,
              i,
            ]
          );
        }
      }

      return service_id;
    });

    res.status(201).json({
      success: true,
      service_id,
      message: "Service created successfully",
    });
  } catch (error) {
    console.error("Error creating service:", error);
    res.status(500).json({
      error: "Failed to create service",
      message: error.message || "An error occurred while creating the service",
    });
  }
};
/**
 * Get all services for the authenticated freelancer
 * Returns services with stats (orders, ratings, etc.)
 */
export const getMyServices = async (req, res) => {
  try {
    const { decodeUserID } = await import("../utils/hashids.js");
    const freelancer_id = decodeUserID(req.user.userID);

    const servicesQuery = `
      SELECT 
        s.service_id,
        s.title,
        s.description,
        s.created_at,
        COUNT(DISTINCT p.package_id) as package_count,
        MIN(p.price) as min_price,
        COUNT(DISTINCT o.order_id) as total_orders,
        COALESCE(AVG(r.rating), 0) as avg_rating,
        COUNT(DISTINCT r.review_id) as review_count,
        (
          SELECT pi.file_path 
          FROM portfolio_image pi 
          WHERE pi.service_id = s.service_id 
          ORDER BY pi.display_order 
          LIMIT 1
        ) as portfolio_image
      FROM service s
      LEFT JOIN package p ON s.service_id = p.service_id
      LEFT JOIN "order" o ON p.package_id = o.package_id
      LEFT JOIN review r ON o.order_id = r.order_id
      WHERE s.freelancer_id = $1
      GROUP BY s.service_id, s.title, s.description, s.created_at
      ORDER BY s.created_at DESC
    `;

    const result = await query(servicesQuery, [freelancer_id]);

    const services = result.rows.map((row) => ({
      service_id: row.service_id,
      title: row.title,
      description: row.description,
      created_at: row.created_at,
      package_count: parseInt(row.package_count),
      min_price: parseFloat(row.min_price) || 0,
      total_orders: parseInt(row.total_orders),
      avg_rating: parseFloat(row.avg_rating).toFixed(1),
      review_count: parseInt(row.review_count),
      portfolio_image: row.portfolio_image,
    }));

    res.json({ services });
  } catch (error) {
    console.error("Error fetching my services:", error);
    res.status(500).json({
      error: "Failed to fetch services",
      message: "An error occurred while fetching your services",
    });
  }
};

/**
 * Update service (PATCH - partial update)
 * Only the service owner can update
 */
export const updateService = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, packages, category_ids } = req.body;
    const { decodeUserID } = await import("../utils/hashids.js");
    const freelancer_id = decodeUserID(req.user.userID);

    // Verify ownership
    const ownershipCheck = await query(
      "SELECT freelancer_id FROM service WHERE service_id = $1",
      [id]
    );

    if (ownershipCheck.rows.length === 0) {
      return res.status(404).json({
        error: "Service not found",
        message: "The service you're trying to update doesn't exist",
      });
    }

    if (
      parseInt(ownershipCheck.rows[0].freelancer_id) !== parseInt(freelancer_id)
    ) {
      return res.status(403).json({
        error: "Unauthorized",
        message: "You can only update your own services",
      });
    }

    // Use transaction for atomic updates
    const { tx } = await import("../db/tx.js");

    await tx(async (client) => {
      // Update service details if provided
      if (title !== undefined || description !== undefined) {
        const updates = [];
        const values = [];
        let paramCount = 0;

        if (title !== undefined) {
          paramCount++;
          updates.push(`title = $${paramCount}`);
          values.push(title);
        }

        if (description !== undefined) {
          paramCount++;
          updates.push(`description = $${paramCount}`);
          values.push(description);
        }

        if (updates.length > 0) {
          paramCount++;
          values.push(id);

          const updateQuery = `
            UPDATE service 
            SET ${updates.join(", ")}
            WHERE service_id = $${paramCount}
          `;

          await client.query(updateQuery, values);
        }
      }

      // Update packages if provided
      if (packages && Array.isArray(packages)) {
        for (const pkg of packages) {
          if (!pkg.package_id) continue;

          const pkgUpdates = [];
          const pkgValues = [];
          let pkgParamCount = 0;

          if (pkg.name !== undefined) {
            pkgParamCount++;
            pkgUpdates.push(`name = $${pkgParamCount}`);
            pkgValues.push(pkg.name);
          }

          if (pkg.price !== undefined) {
            pkgParamCount++;
            pkgUpdates.push(`price = $${pkgParamCount}`);
            pkgValues.push(pkg.price);
          }

          if (pkg.delivery_time !== undefined) {
            pkgParamCount++;
            pkgUpdates.push(`delivery_time = $${pkgParamCount}`);
            pkgValues.push(pkg.delivery_time);
          }

          if (pkg.description !== undefined) {
            pkgParamCount++;
            pkgUpdates.push(`description = $${pkgParamCount}`);
            pkgValues.push(pkg.description);
          }

          if (pkgUpdates.length > 0) {
            pkgParamCount++;
            pkgValues.push(pkg.package_id);
            pkgParamCount++;
            pkgValues.push(id);

            const pkgUpdateQuery = `
              UPDATE package 
              SET ${pkgUpdates.join(", ")}
              WHERE package_id = $${
                pkgParamCount - 1
              } AND service_id = $${pkgParamCount}
            `;

            await client.query(pkgUpdateQuery, pkgValues);
          }
        }
      }

      // Update categories if provided
      if (category_ids && Array.isArray(category_ids)) {
        // Get all package IDs for this service
        const packagesResult = await client.query(
          "SELECT package_id FROM package WHERE service_id = $1",
          [id]
        );

        const packageIds = packagesResult.rows.map((row) => row.package_id);

        // Delete existing category associations for the service
        await client.query(
          `DELETE FROM services_in_category 
           WHERE service_id = $1`,
          [id]
        );

        // Insert new category associations for the service
        for (const categoryId of category_ids) {
          await client.query(
            `INSERT INTO services_in_category (service_id, category_id) 
             VALUES ($1, $2)
             ON CONFLICT DO NOTHING`,
            [id, categoryId]
          );
        }
      }
    });

    res.json({
      success: true,
      message: "Service updated successfully",
    });
  } catch (error) {
    console.error("Error updating service:", error);
    res.status(500).json({
      error: "Failed to update service",
      message: "An error occurred while updating the service",
    });
  }
};

/**
 * Delete service
 * Only the service owner can delete
 * Cannot delete if service has active orders
 */
export const deleteService = async (req, res) => {
  try {
    const { id } = req.params;
    const { decodeUserID } = await import("../utils/hashids.js");
    const freelancer_id = decodeUserID(req.user.userID);

    // Verify ownership
    const ownershipCheck = await query(
      "SELECT freelancer_id FROM service WHERE service_id = $1",
      [id]
    );

    if (ownershipCheck.rows.length === 0) {
      return res.status(404).json({
        error: "Service not found",
        message: "The service you're trying to delete doesn't exist",
      });
    }

    if (
      parseInt(ownershipCheck.rows[0].freelancer_id) !== parseInt(freelancer_id)
    ) {
      return res.status(403).json({
        error: "Unauthorized",
        message: "You can only delete your own services",
      });
    }

    // Check for active orders
    const activeOrdersCheck = await query(
      `SELECT COUNT(*) as active_count 
       FROM "order" o
       JOIN package p ON o.package_id = p.package_id
       WHERE p.service_id = $1 AND o.status IN ('pending', 'in_progress')`,
      [id]
    );

    if (parseInt(activeOrdersCheck.rows[0].active_count) > 0) {
      return res.status(400).json({
        error: "Cannot delete service",
        message: "This service has active orders and cannot be deleted",
      });
    }

    // Get all portfolio image paths before deleting
    const imagesResult = await query(
      "SELECT file_path FROM portfolio_image WHERE service_id = $1",
      [id]
    );

    // Delete service (cascade will handle packages and images in DB)
    await query("DELETE FROM service WHERE service_id = $1", [id]);

    // Delete actual image files from disk
    if (imagesResult.rows.length > 0) {
      const fs = await import("fs/promises");
      for (const row of imagesResult.rows) {
        const filePath = row.file_path;
        const fullPath = `/app${filePath}`; // /app/uploads/portfolio/filename.jpg

        try {
          await fs.unlink(fullPath);
        } catch (fileError) {
          console.error("Error deleting file:", fileError);
          // Continue even if file deletion fails
        }
      }
    }

    res.json({
      success: true,
      message: "Service deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting service:", error);
    res.status(500).json({
      error: "Failed to delete service",
      message: "An error occurred while deleting the service",
    });
  }
};

/**
 * Delete a portfolio image
 * Only the service owner can delete images
 */
export const deletePortfolioImage = async (req, res) => {
  try {
    const { id, imageId } = req.params;
    const { decodeUserID } = await import("../utils/hashids.js");
    const freelancer_id = decodeUserID(req.user.userID);

    // Verify service ownership
    const ownershipCheck = await query(
      "SELECT freelancer_id FROM service WHERE service_id = $1",
      [id]
    );

    if (ownershipCheck.rows.length === 0) {
      return res.status(404).json({
        error: "Service not found",
      });
    }

    if (
      parseInt(ownershipCheck.rows[0].freelancer_id) !== parseInt(freelancer_id)
    ) {
      return res.status(403).json({
        error: "Unauthorized",
        message: "You can only delete images from your own services",
      });
    }

    // Get image file path before deleting
    const imageResult = await query(
      "SELECT file_path FROM portfolio_image WHERE image_id = $1 AND service_id = $2",
      [imageId, id]
    );

    // Delete the image record
    await query(
      "DELETE FROM portfolio_image WHERE image_id = $1 AND service_id = $2",
      [imageId, id]
    );

    // Delete the actual file from disk
    if (imageResult.rows.length > 0) {
      const filePath = imageResult.rows[0].file_path;
      const fullPath = `/app${filePath}`; // /app/uploads/portfolio/filename.jpg

      const fs = await import("fs/promises");
      try {
        await fs.unlink(fullPath);
      } catch (fileError) {
        console.error("Error deleting file:", fileError);
        // Continue even if file deletion fails
      }
    }

    res.json({
      success: true,
      message: "Image deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting image:", error);
    res.status(500).json({
      error: "Failed to delete image",
    });
  }
};

/**
 * Add new portfolio images to a service
 * Only the service owner can add images
 */
export const addPortfolioImages = async (req, res) => {
  try {
    const { id } = req.params;
    const { decodeUserID } = await import("../utils/hashids.js");
    const freelancer_id = decodeUserID(req.user.userID);

    // Verify service ownership
    const ownershipCheck = await query(
      "SELECT freelancer_id FROM service WHERE service_id = $1",
      [id]
    );

    if (ownershipCheck.rows.length === 0) {
      return res.status(404).json({
        error: "Service not found",
      });
    }

    if (
      parseInt(ownershipCheck.rows[0].freelancer_id) !== parseInt(freelancer_id)
    ) {
      return res.status(403).json({
        error: "Unauthorized",
        message: "You can only add images to your own services",
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        error: "No images provided",
      });
    }

    // Get current max display order
    const maxOrderResult = await query(
      "SELECT COALESCE(MAX(display_order), -1) as max_order FROM portfolio_image WHERE service_id = $1",
      [id]
    );
    let displayOrder = parseInt(maxOrderResult.rows[0].max_order) + 1;

    // Insert new images
    const imagePromises = req.files.map((file) => {
      const filePath = `/uploads/portfolio/${file.filename}`;
      return query(
        "INSERT INTO portfolio_image (service_id, filename, file_path, display_order) VALUES ($1, $2, $3, $4) RETURNING image_id",
        [id, file.filename, filePath, displayOrder++]
      );
    });

    await Promise.all(imagePromises);

    res.json({
      success: true,
      message: `${req.files.length} image(s) added successfully`,
    });
  } catch (error) {
    console.error("Error adding images:", error);
    res.status(500).json({
      error: "Failed to add images",
    });
  }
};
