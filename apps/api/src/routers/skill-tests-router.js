import express from "express";
import checkAuth from "../middleware/auth-check.js";
import checkClearance from "../middleware/clearance-check.js";
import { ClearanceLevels } from "../utils/roles.js";
import {
  createSkillTest,
  updateSkillTest,
  deleteSkillTest,
  getAllSkillTests,
  getSkillTestDetails,
  getAvailableTests,
  startTest,
  submitTestAttempt,
  getMyAttempts,
  getMyCertifications,
} from "../controllers/skill-tests-controller.js";

const router = express.Router();

// ============================================================================
// Admin Routes - Mounted at /api/skill-tests/admin/...
// ============================================================================

router.post(
  "/admin",
  checkAuth,
  checkClearance(ClearanceLevels.ADMIN),
  createSkillTest
);

router.put(
  "/admin/:id",
  checkAuth,
  checkClearance(ClearanceLevels.ADMIN),
  updateSkillTest
);

router.delete(
  "/admin/:id",
  checkAuth,
  checkClearance(ClearanceLevels.ADMIN),
  deleteSkillTest
);

router.get(
  "/admin",
  checkAuth,
  checkClearance(ClearanceLevels.ADMIN),
  getAllSkillTests
);

router.get(
  "/admin/:id",
  checkAuth,
  checkClearance(ClearanceLevels.ADMIN),
  getSkillTestDetails
);

// ============================================================================
// Freelancer Routes - Mounted at /api/skill-tests/...
// ============================================================================

// GET /api/skill-tests - Browse available tests
router.get("/", checkAuth, getAvailableTests);

// POST /api/skill-tests/:id/start - Start a test
router.post("/:id/start", checkAuth, startTest);

// POST /api/skill-tests/attempts/:attemptId/submit - Submit test
router.post("/attempts/:attemptId/submit", checkAuth, submitTestAttempt);

// GET /api/skill-tests/my-attempts - View attempt history
router.get("/my-attempts", checkAuth, getMyAttempts);

// GET /api/skill-tests/my-certifications - View certifications
router.get("/my-certifications", checkAuth, getMyCertifications);

export default router;
