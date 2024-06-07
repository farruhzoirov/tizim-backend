import express from "express";
import pool from "../utils/db.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import db from "../utils/db.js";

const router = express.Router();

router.post('/employee_login', async (req, res) => {
  const sql = "SELECT * FROM `teacher` WHERE email = ?";
  console.log(req.body)
  try {
    if (!req.body.email || !req.body.password) {
      return res.status(401).json({
        ok: false,
        message: 'Invalid data in employee login'
      })
    }
    const [rows] = await pool.execute(sql, [req.body.email]);
    if (rows.length > 0) {
      const match = await bcrypt.compare(req.body.password, rows[0].password);
      if (match) {
        const email = rows[0].email;
        const token = jwt.sign(
            {role: "employee", email: email, id: rows[0].id},
            "jwt_secret_key",
            {expiresIn: "1d"}
        );
        res.cookie('token', token);
        return res.json({loginStatus: true, id: rows[0].id});
      } else {
        return res.json({loginStatus: false, Error: "Wrong Password"});
      }
    } else {
      return res.json({loginStatus: false, Error: "Wrong email or password"});
    }
  } catch (err) {
    return res.json({loginStatus: false, Error: "Query error"});
  }
});


router.get("/detail/:id", async (req, res) => {
  const id = req.params.id;
  const sql = "SELECT * FROM teacher WHERE id = ?";
  try {
    const [data] = await db.execute(
        `SELECT 
          g.group_name,
          g.lesson_time,
          g.image,
          s.subject_name AS subject_name
       FROM 
          \`groups\` g
       INNER JOIN 
          \`subject\` s ON g.subject_id = s.id 
       INNER JOIN 
          \`teacher\` t ON g.teacher_id = t.id`
    );
    const [rows] = await pool.execute(sql, [id]);
    let teacherInfo = rows;
    let groupInfo = data;
    return res.json([
      teacherInfo, groupInfo
    ]);
  } catch (err) {
    console.log('Getting group info', err);
    return res.json({
      status: false,

    });
  }
});

router.get("/logout", (req, res) => {
  res.clearCookie("token");
  return res.json({Status: true});
});

export default router