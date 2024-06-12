import path from 'path';

import cookieParser from 'cookie-parser';

import express from 'express';

const router = express.Router();

import multer from 'multer';

// Middleware setup
router.use(cookieParser());


// Validators

import adminLoginValidator from '../validators/admin-login.validator.js'


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
  deleteCategory,
  logoutAdmin
} from "../controller/admin.controller.js";


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
router.post('/admin-login', adminLoginValidator, adminLogin);

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
router.post("/edit_employee/:id", editEmployee);

// Delete employee by ID
router.delete('/delete_employee/:id', deleteEmployee);


// Get all admin records
router.get("/admin_records", getAdmins);


// Logout
router.get("/logout", logoutAdmin);


export default router
