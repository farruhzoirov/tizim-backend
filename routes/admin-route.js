import express from 'express';

const router = express.Router();
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import multer from 'multer';
import path from 'path';

// Middleware setup
router.use(cookieParser());

import {
  adminLogin,
  getCategories,
  addCategory,
  addEmployee,
  getAdmins,
  getEmployee,
  getOneEmployee,
  editEmployee,
  deleteEmployee,
  getGroups,
  deleteCategory
} from "../controller/admin.controller.js";

// Create a MySQL connection db
import db from '../utils/db.js';

// Image upload configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "Public/Images");
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + "_" + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({storage});


// Admin login
router.post('/adminlogin', adminLogin);

// Get all categories
router.get('/category', getCategories);


// Get all categories
router.get('/get-groups', getGroups);

// Delete category by ID
router.delete('/delete_category/:id', deleteCategory);

// Add new category
router.post('/add_category', addCategory);


// Add new employee
router.post("/add-employee", upload.single('image'), addEmployee);
// Get all employees
router.get('/employee', getEmployee);

// Get employee by ID
router.get("/employee/:id", getOneEmployee);

// Edit employee by ID
router.put("/edit_employee/:id", editEmployee);

// Delete employee by ID
router.delete('/delete_employee/:id', deleteEmployee);




// Get all admin records
router.get("/admin_records", getAdmins);










// Logout
router.get("/logout", (req, res) => {
  res.clearCookie("token");
  return res.json(
      {
        Status: true
      });
});


export default router
