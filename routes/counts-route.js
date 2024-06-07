import {Router} from 'express';
const router = Router();
import db from '../utils/db.js';


// Get admin count
router.get("/admin_count", async (req, res) => {
  const sql = "SELECT COUNT(id) AS admin FROM admin";
  try {
    const [result] = await db.execute(sql);
    return res.json({Status: true, Result: result});
  } catch (err) {
    return res.json({Status: false, Error: "Query Error" + err});
  }
});

// Get employee count
router.get("/employee_count", async (req, res) => {
  const sql = "SELECT COUNT(id) AS teacher FROM teacher";
  try {
    const [result] = await db.execute(sql);
    return res.json({Status: true, Result: result});
  } catch (err) {
    return res.json({Status: false, Error: "Query Error" + err});
  }
});

// Get category count
router.get("/category_count", async (req, res) => {
  const sql = "SELECT COUNT(id) AS subject FROM subject";
  try {
    const [result] = await db.execute(sql);
    return res.json({Status: true, Result: result});
  } catch (err) {
    return res.json({Status: false, Error: "Query Error" + err});
  }
});

// Get category count
router.get("/students_count", async (req, res) => {
  const sql = "SELECT COUNT(id) AS student FROM student";
  try {
    const [result] = await db.execute(sql);
    return res.json({Status: true, Result: result});
  } catch (err) {
    return res.json({Status: false, Error: "Query Error" + err});
  }
});


// Get total salary of employees
router.get("/salary_count", async (req, res) => {
  const sql = "SELECT SUM(salary) AS salaryOFEmp FROM employee";
  try {
    const [result] = await db.execute(sql);
    return res.json({Status: true, Result: result});
  } catch (err) {
    return res.json({Status: false, Error: "Query Error" + err});
  }
});