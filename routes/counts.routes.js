import express from 'express';

const router = express.Router();

import {
  getAdminsCount,
  getCategoriesCount,
  getEmployeesCount,
  getStudentsCount
} from "../controller/counts.controller.js";

// Get admins count
router.get("/admin_count", getAdminsCount);

// Get employees count
router.get("/employee_count", getEmployeesCount);

// Get categories count
router.get("/category_count", getCategoriesCount);

// Get students count
router.get("/students_count", getStudentsCount);



export default router;
