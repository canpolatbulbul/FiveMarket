import { query } from "../db/index.js";

/**
 * Get all service categories
 */
export const getAllCategories = async (req, res) => {
  try {
    const result = await query(
      "SELECT category_id, description FROM service_category ORDER BY description ASC"
    );

    res.json({
      categories: result.rows,
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({
      error: "Failed to fetch categories",
      message: "An error occurred while fetching categories",
    });
  }
};
