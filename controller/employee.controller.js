import db from '../utils/db.js'
import jwt from 'jsonwebtoken';
import bcrypt from "bcrypt";

export const employeeLogin = async (req, res) => {
  const sql = "SELECT * FROM `teacher` WHERE email = ?";
  try {
    if (!req.body.email || !req.body.password) {
      return res.status(401).json({
        ok: false,
        message: 'Invalid data in employee login'
      })
    }
    const [rows] = await db.execute(sql, [req.body.email]);
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
}


export const getOneEmployee = async (req, res) => {
  const id = req.params.id;
  const sql = "SELECT * FROM teacher WHERE id = ?";
  try {
    const [data] = await db.execute(
        `SELECT 
        g.id,
        g.room,
        g.group_name,
        g.lesson_time,
        g.image,
        s.subject_name AS subject_name,
        GROUP_CONCAT(ld.day_name ORDER BY ld.day_name) AS day_names
     FROM 
        \`groups\` g
     INNER JOIN 
        \`subject\` s ON g.subject_id = s.id 
     INNER JOIN 
        \`teacher\` t ON g.teacher_id = t.id
     INNER JOIN 
        \`lessons_group_days\` lgd ON g.id = lgd.group_id
     INNER JOIN 
        \`lessons_days\` ld ON lgd.day_id = ld.id
     GROUP BY 
        g.id,
        g.room,
        g.group_name,
        g.lesson_time,
        g.image,
        s.subject_name;`
    );

    const [rows] = await db.execute(sql, [id]);

    const processedData = data.map(group => ({
      ...group,
      day_names: group.day_names ? group.day_names.split(',') : []  // Split the day names into an array or return an empty array
    }));
    let groupInfo
    if(!rows) {
      return groupInfo = [];
    }

    let teacherInfo = rows;
    groupInfo = processedData
    return res.json([
      teacherInfo, groupInfo
    ]);
  } catch (err) {
    console.log('Getting group info', err);
    return res.json({
      status: false,

    });
  }
}


export const employeeLogout = async (req, res) => {
  await res.clearCookie("token");
  return res.json({Status: true});
}