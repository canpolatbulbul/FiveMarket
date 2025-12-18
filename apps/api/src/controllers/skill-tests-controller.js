import { query } from "../db/index.js";
import { encodeUserID, decodeUserID } from "../utils/hashids.js";
import { AppError } from "../middleware/error-handler.js";

/**
 * Admin: Create a new skill test with questions
 * @access Private (Admin)
 */
export const createSkillTest = async (req, res) => {
  try {
    const { title, description, category_id, pass_percentage, questions } =
      req.body;
    const adminId = decodeUserID(req.user.userID);

    // Validate input
    if (!title || !questions || questions.length === 0) {
      throw new AppError("Title and at least one question are required", 400);
    }

    // Calculate time limit (2 minutes per question)
    const time_limit_minutes = questions.length * 2;

    await query("BEGIN");

    try {
      // Create skill test
      const testResult = await query(
        `INSERT INTO skill_test (title, description, category_id, pass_percentage, time_limit_minutes, created_by)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING test_id`,
        [
          title,
          description,
          category_id || null,
          pass_percentage || 70,
          time_limit_minutes,
          adminId,
        ]
      );

      const testId = testResult.rows[0].test_id;

      // Insert questions
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        await query(
          `INSERT INTO skill_test_question 
           (test_id, question_text, option_a, option_b, option_c, option_d, correct_answer, order_index)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [
            testId,
            q.question_text,
            q.option_a,
            q.option_b,
            q.option_c,
            q.option_d,
            q.correct_answer,
            i + 1,
          ]
        );
      }

      await query("COMMIT");

      res.status(201).json({
        success: true,
        message: "Skill test created successfully",
        testId,
      });
    } catch (error) {
      await query("ROLLBACK");
      throw error;
    }
  } catch (error) {
    console.error("Error creating skill test:", error);
    if (error instanceof AppError) throw error;
    res
      .status(500)
      .json({ error: "Failed to create skill test", message: error.message });
  }
};

/**
 * Admin: Update skill test
 * @access Private (Admin)
 */
export const updateSkillTest = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      category_id,
      pass_percentage,
      questions,
      is_active,
    } = req.body;

    // Calculate new time limit if questions provided
    const time_limit_minutes = questions ? questions.length * 2 : undefined;

    await query("BEGIN");

    try {
      // Update test metadata
      await query(
        `UPDATE skill_test 
         SET title = COALESCE($1, title),
             description = COALESCE($2, description),
             category_id = COALESCE($3, category_id),
             pass_percentage = COALESCE($4, pass_percentage),
             time_limit_minutes = COALESCE($5, time_limit_minutes),
             is_active = COALESCE($6, is_active),
             updated_at = NOW()
         WHERE test_id = $7`,
        [
          title,
          description,
          category_id,
          pass_percentage,
          time_limit_minutes,
          is_active,
          id,
        ]
      );

      // If questions provided, replace all questions
      if (questions && questions.length > 0) {
        // Delete old questions
        await query("DELETE FROM skill_test_question WHERE test_id = $1", [id]);

        // Insert new questions
        for (let i = 0; i < questions.length; i++) {
          const q = questions[i];
          await query(
            `INSERT INTO skill_test_question 
             (test_id, question_text, option_a, option_b, option_c, option_d, correct_answer, order_index)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            [
              id,
              q.question_text,
              q.option_a,
              q.option_b,
              q.option_c,
              q.option_d,
              q.correct_answer,
              i + 1,
            ]
          );
        }
      }

      await query("COMMIT");

      res.json({
        success: true,
        message: "Skill test updated successfully",
      });
    } catch (error) {
      await query("ROLLBACK");
      throw error;
    }
  } catch (error) {
    console.error("Error updating skill test:", error);
    if (error instanceof AppError) throw error;
    res
      .status(500)
      .json({ error: "Failed to update skill test", message: error.message });
  }
};

/**
 * Admin: Delete skill test
 * @access Private (Admin)
 */
export const deleteSkillTest = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if test has attempts
    const attemptsResult = await query(
      "SELECT COUNT(*) FROM test_attempt WHERE test_id = $1",
      [id]
    );

    const hasAttempts = parseInt(attemptsResult.rows[0].count) > 0;

    if (hasAttempts) {
      // Soft delete - set inactive
      await query(
        "UPDATE skill_test SET is_active = false WHERE test_id = $1",
        [id]
      );
      res.json({
        success: true,
        message: "Skill test deactivated (has existing attempts)",
      });
    } else {
      // Hard delete
      await query("DELETE FROM skill_test WHERE test_id = $1", [id]);
      res.json({
        success: true,
        message: "Skill test deleted successfully",
      });
    }
  } catch (error) {
    console.error("Error deleting skill test:", error);
    res
      .status(500)
      .json({ error: "Failed to delete skill test", message: error.message });
  }
};

/**
 * Admin: Get all skill tests with stats
 * @access Private (Admin)
 */
export const getAllSkillTests = async (req, res) => {
  try {
    const { category_id, is_active } = req.query;

    let whereClause = "WHERE 1=1";
    const params = [];

    if (category_id) {
      params.push(category_id);
      whereClause += ` AND st.category_id = $${params.length}`;
    }

    if (is_active !== undefined) {
      params.push(is_active === "true");
      whereClause += ` AND st.is_active = $${params.length}`;
    }

    const testsResult = await query(
      `SELECT 
        st.test_id,
        st.title,
        st.description,
        st.category_id,
        sc.description as category_name,
        st.pass_percentage,
        st.time_limit_minutes,
        st.is_active,
        st.created_at,
        COUNT(DISTINCT stq.question_id) as question_count,
        COUNT(DISTINCT ta.attempt_id) as total_attempts,
        COUNT(DISTINCT CASE WHEN ta.passed = true THEN ta.attempt_id END) as passed_attempts
      FROM skill_test st
      LEFT JOIN service_category sc ON st.category_id = sc.category_id
      LEFT JOIN skill_test_question stq ON st.test_id = stq.test_id
      LEFT JOIN test_attempt ta ON st.test_id = ta.test_id
      ${whereClause}
      GROUP BY st.test_id, sc.description
      ORDER BY st.created_at DESC`,
      params
    );

    res.json({
      success: true,
      tests: testsResult.rows.map((row) => ({
        testId: row.test_id,
        title: row.title,
        description: row.description,
        category_id: row.category_id,
        categoryName: row.category_name,
        passPercentage: row.pass_percentage,
        timeLimitMinutes: row.time_limit_minutes,
        isActive: row.is_active,
        questionCount: parseInt(row.question_count),
        totalAttempts: parseInt(row.total_attempts),
        passedAttempts: parseInt(row.passed_attempts),
        passRate:
          row.total_attempts > 0
            ? (
                (parseInt(row.passed_attempts) / parseInt(row.total_attempts)) *
                100
              ).toFixed(1)
            : 0,
        createdAt: row.created_at,
      })),
    });
  } catch (error) {
    console.error("Error fetching skill tests:", error);
    res
      .status(500)
      .json({ error: "Failed to fetch skill tests", message: error.message });
  }
};

/**
 * Admin: Get skill test details with questions (including answers)
 * @access Private (Admin)
 */
export const getSkillTestDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const testResult = await query(
      `SELECT st.*, sc.description as category_name
       FROM skill_test st
       LEFT JOIN service_category sc ON st.category_id = sc.category_id
       WHERE st.test_id = $1`,
      [id]
    );

    if (testResult.rows.length === 0) {
      throw new AppError("Skill test not found", 404);
    }

    const questionsResult = await query(
      `SELECT * FROM skill_test_question 
       WHERE test_id = $1 
       ORDER BY order_index`,
      [id]
    );

    const test = testResult.rows[0];

    res.json({
      success: true,
      test: {
        testId: test.test_id,
        title: test.title,
        description: test.description,
        category_id: test.category_id,
        categoryName: test.category_name,
        passPercentage: test.pass_percentage,
        timeLimitMinutes: test.time_limit_minutes,
        isActive: test.is_active,
        createdAt: test.created_at,
        questions: questionsResult.rows.map((q) => ({
          questionId: q.question_id,
          questionText: q.question_text,
          optionA: q.option_a,
          optionB: q.option_b,
          optionC: q.option_c,
          optionD: q.option_d,
          correctAnswer: q.correct_answer,
          orderIndex: q.order_index,
        })),
      },
    });
  } catch (error) {
    console.error("Error fetching skill test details:", error);
    if (error instanceof AppError) throw error;
    res.status(500).json({
      error: "Failed to fetch skill test details",
      message: error.message,
    });
  }
};

/**
 * Freelancer: Get available skill tests
 * @access Private (Freelancer)
 */
export const getAvailableTests = async (req, res) => {
  try {
    const { category_id } = req.query;
    const userId = decodeUserID(req.user.userID);

    let whereClause = "WHERE st.is_active = true";
    const params = [userId];

    if (category_id) {
      params.push(category_id);
      whereClause += ` AND st.category_id = $${params.length}`;
    }

    const testsResult = await query(
      `SELECT 
        st.test_id,
        st.title,
        st.description,
        st.category_id,
        sc.description as category_name,
        st.pass_percentage,
        st.time_limit_minutes,
        COUNT(DISTINCT stq.question_id) as question_count,
        COUNT(DISTINCT CASE WHEN ta.passed = false AND ta.submitted_at IS NOT NULL THEN ta.attempt_id END) as failed_attempts,
        MAX(CASE WHEN ta.passed = true THEN ta.score_percent END) as best_score,
        BOOL_OR(ta.passed) as has_passed
      FROM skill_test st
      LEFT JOIN service_category sc ON st.category_id = sc.category_id
      LEFT JOIN skill_test_question stq ON st.test_id = stq.test_id
      LEFT JOIN test_attempt ta ON st.test_id = ta.test_id AND ta.freelancer_id = $1
      ${whereClause}
      GROUP BY st.test_id, sc.description
      ORDER BY st.title`,
      params
    );

    res.json({
      success: true,
      tests: testsResult.rows.map((row) => ({
        testId: row.test_id,
        title: row.title,
        description: row.description,
        category_id: row.category_id,
        categoryName: row.category_name,
        passPercentage: row.pass_percentage,
        timeLimitMinutes: row.time_limit_minutes,
        questionCount: parseInt(row.question_count),
        failedAttempts: parseInt(row.failed_attempts) || 0,
        bestScore: row.best_score ? parseFloat(row.best_score) : null,
        hasPassed: row.has_passed || false,
        canTake: parseInt(row.failed_attempts || 0) < 3 || row.has_passed,
      })),
    });
  } catch (error) {
    console.error("Error fetching available tests:", error);
    res.status(500).json({
      error: "Failed to fetch available tests",
      message: error.message,
    });
  }
};

/**
 * Freelancer: Start taking a test (get questions without answers)
 * @access Private (Freelancer)
 */
export const startTest = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = decodeUserID(req.user.userID);

    // Check if test exists and is active
    const testResult = await query(
      "SELECT * FROM skill_test WHERE test_id = $1 AND is_active = true",
      [id]
    );

    if (testResult.rows.length === 0) {
      throw new AppError("Test not found or inactive", 404);
    }

    const test = testResult.rows[0];

    // Check attempt limit (3 failed attempts max, unless already passed)
    // Only count submitted attempts
    const attemptsResult = await query(
      `SELECT 
        COUNT(CASE WHEN passed = false THEN 1 END) as failed_count,
        BOOL_OR(passed) as has_passed
       FROM test_attempt 
       WHERE freelancer_id = $1 AND test_id = $2 AND submitted_at IS NOT NULL`,
      [userId, id]
    );

    const { failed_count, has_passed } = attemptsResult.rows[0];

    if (parseInt(failed_count) >= 3 && !has_passed) {
      throw new AppError("Maximum attempts reached for this test", 403);
    }

    // Get questions without correct answers
    const questionsResult = await query(
      `SELECT question_id, question_text, option_a, option_b, option_c, option_d, order_index
       FROM skill_test_question 
       WHERE test_id = $1 
       ORDER BY order_index`,
      [id]
    );

    // Calculate attempt number based on submitted attempts only
    const attemptNumberResult = await query(
      "SELECT COALESCE(MAX(attempt_number), 0) + 1 as next_attempt FROM test_attempt WHERE freelancer_id = $1 AND test_id = $2 AND submitted_at IS NOT NULL",
      [userId, id]
    );
    const attemptNumber = attemptNumberResult.rows[0].next_attempt;

    // Create attempt record
    const attemptResult = await query(
      `INSERT INTO test_attempt (freelancer_id, test_id, attempt_number)
       VALUES ($1, $2, $3)
       RETURNING attempt_id`,
      [userId, id, attemptNumber]
    );

    res.json({
      success: true,
      attemptId: attemptResult.rows[0].attempt_id,
      test: {
        testId: test.test_id,
        title: test.title,
        description: test.description,
        passPercentage: test.pass_percentage,
        timeLimitMinutes: test.time_limit_minutes,
        timeLimitSeconds: test.time_limit_minutes * 60,
        attemptNumber,
        questions: questionsResult.rows.map((q) => ({
          questionId: q.question_id,
          questionText: q.question_text,
          optionA: q.option_a,
          optionB: q.option_b,
          optionC: q.option_c,
          optionD: q.option_d,
          orderIndex: q.order_index,
        })),
      },
    });
  } catch (error) {
    console.error("Error starting test:", error);
    if (error instanceof AppError) throw error;
    res
      .status(500)
      .json({ error: "Failed to start test", message: error.message });
  }
};

/**
 * Freelancer: Submit test attempt
 * @access Private (Freelancer)
 */
export const submitTestAttempt = async (req, res) => {
  try {
    const { attemptId } = req.params;
    const { answers, timeTakenSeconds } = req.body;
    const userId = decodeUserID(req.user.userID);

    // Get attempt details
    const attemptResult = await query(
      `SELECT ta.*, st.pass_percentage, st.test_id
       FROM test_attempt ta
       JOIN skill_test st ON ta.test_id = st.test_id
       WHERE ta.attempt_id = $1 AND ta.freelancer_id = $2`,
      [attemptId, userId]
    );

    if (attemptResult.rows.length === 0) {
      throw new AppError("Test attempt not found", 404);
    }

    const attempt = attemptResult.rows[0];

    if (attempt.submitted_at) {
      throw new AppError("Test already submitted", 400);
    }

    // Get correct answers
    const questionsResult = await query(
      "SELECT question_id, correct_answer FROM skill_test_question WHERE test_id = $1",
      [attempt.test_id]
    );

    // Calculate score
    let correctCount = 0;
    const totalQuestions = questionsResult.rows.length;

    questionsResult.rows.forEach((q) => {
      if (answers[q.question_id] === q.correct_answer) {
        correctCount++;
      }
    });

    const scorePercent = (correctCount / totalQuestions) * 100;
    const passed = scorePercent >= attempt.pass_percentage;

    await query("BEGIN");

    try {
      // Update attempt
      await query(
        `UPDATE test_attempt 
         SET submitted_at = NOW(),
             score_percent = $1,
             passed = $2,
             answers_blob = $3,
             time_taken_seconds = $4
         WHERE attempt_id = $5`,
        [
          scorePercent,
          passed,
          JSON.stringify(answers),
          timeTakenSeconds,
          attemptId,
        ]
      );

      let certificateId = null;

      // If passed, create certification
      if (passed) {
        // Check if already has certification
        const existingCert = await query(
          'SELECT certificate_id FROM skill_certification WHERE "userID" = $1 AND test_id = $2',
          [userId, attempt.test_id]
        );

        if (existingCert.rows.length === 0) {
          // Create certificate
          const certResult = await query(
            "INSERT INTO certificate (issued_at) VALUES (CURRENT_DATE) RETURNING certificate_id",
            []
          );
          certificateId = certResult.rows[0].certificate_id;

          // Create skill certification
          await query(
            `INSERT INTO skill_certification (certificate_id, "userID", test_id)
             VALUES ($1, $2, $3)`,
            [certificateId, userId, attempt.test_id]
          );
        }
      }

      await query("COMMIT");

      // Get correct answers for review
      const correctAnswers = {};
      questionsResult.rows.forEach((q) => {
        correctAnswers[q.question_id] = q.correct_answer;
      });

      res.json({
        success: true,
        result: {
          scorePercent: parseFloat(scorePercent.toFixed(2)),
          passed,
          correctCount,
          totalQuestions,
          correctAnswers,
          userAnswers: answers, // Add user's submitted answers
          certificateId,
        },
      });
    } catch (error) {
      await query("ROLLBACK");
      throw error;
    }
  } catch (error) {
    console.error("Error submitting test:", error);
    if (error instanceof AppError) throw error;
    res
      .status(500)
      .json({ error: "Failed to submit test", message: error.message });
  }
};

/**
 * Freelancer: Get my test attempts
 * @access Private (Freelancer)
 */
export const getMyAttempts = async (req, res) => {
  try {
    const userId = decodeUserID(req.user.userID);

    const attemptsResult = await query(
      `SELECT 
        ta.attempt_id,
        ta.test_id,
        st.title as test_title,
        ta.started_at,
        ta.submitted_at,
        ta.score_percent,
        ta.passed,
        ta.attempt_number
      FROM test_attempt ta
      JOIN skill_test st ON ta.test_id = st.test_id
      WHERE ta.freelancer_id = $1
      ORDER BY ta.started_at DESC`,
      [userId]
    );

    res.json({
      success: true,
      attempts: attemptsResult.rows.map((row) => ({
        attemptId: row.attempt_id,
        testId: row.test_id,
        testTitle: row.test_title,
        startedAt: row.started_at,
        submittedAt: row.submitted_at,
        scorePercent: row.score_percent ? parseFloat(row.score_percent) : null,
        passed: row.passed,
        attemptNumber: row.attempt_number,
      })),
    });
  } catch (error) {
    console.error("Error fetching attempts:", error);
    res
      .status(500)
      .json({ error: "Failed to fetch attempts", message: error.message });
  }
};

/**
 * Freelancer: Get my certifications
 * @access Private (Freelancer)
 */
export const getMyCertifications = async (req, res) => {
  try {
    const userId = decodeUserID(req.user.userID);

    const certsResult = await query(
      `SELECT 
        sc.certificate_id,
        st.test_id,
        st.title as test_title,
        st.category_id,
        cat.description as category_name,
        c.issued_at
      FROM skill_certification sc
      JOIN certificate c ON sc.certificate_id = c.certificate_id
      JOIN skill_test st ON sc.test_id = st.test_id
      LEFT JOIN service_category cat ON st.category_id = cat.category_id
      WHERE sc."userID" = $1
      ORDER BY c.issued_at DESC`,
      [userId]
    );

    res.json({
      success: true,
      certifications: certsResult.rows.map((row) => ({
        certificateId: row.certificate_id,
        testId: row.test_id,
        testTitle: row.test_title,
        category_id: row.category_id,
        categoryName: row.category_name,
        issuedAt: row.issued_at,
      })),
    });
  } catch (error) {
    console.error("Error fetching certifications:", error);
    res.status(500).json({
      error: "Failed to fetch certifications",
      message: error.message,
    });
  }
};
