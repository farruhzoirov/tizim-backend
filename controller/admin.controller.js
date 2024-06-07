import db from '../utils/db.js'
import jwt from 'jsonwebtoken';
import multer from "multer";
import path from "path";
import bcrypt from "bcrypt";


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "Public/Images");
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + "_" + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({storage});

export const getGroups = async (req, res) => {
  const sql = "SELECT * FROM `groups`";
  try {
    const [result] = await db.execute(sql);
    return res.json({ Status: true, Result: result });
  } catch (err) {
    console.log(err)
    return res.json({ Status: false, Error: "Query Error" });

  }
}



export const getAdmins = async (req, res) => {
  const sql = "SELECT * FROM admin";
  try {
    const [result] = await db.execute(sql);
    return res.json({ Status: true, Result: result });
  } catch (err) {
    return res.json({ Status: false, Error: "Query Error" + err });
  }
}



export const adminLogin = async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    const [rows] = await db.execute('SELECT * FROM admin WHERE email = ? AND password = ?', [email, password]);
    console.log(rows)
    if (rows.length > 0) {
      const email = rows[0].email;
      const token = jwt.sign({role: "admin", email, id: rows[0].id}, "jwt_secret_key", {expiresIn: "1d"});
      res.cookie('token', token);
      return res.json({loginStatus: true});
    } else {
      return res.json({loginStatus: false, Error: "Wrong email or password"});
    }
  } catch (err) {
    return res.json({loginStatus: false, Error: "Query error"});
  }
}


export const getCategories = async (req, res) => {
  const sql = "SELECT * FROM subject";
  try {
    const [result] = await db.execute(sql);
    return res.json({Status: true, Result: result});
  } catch (err) {
    return res.json({Status: false, Error: "Query Error"});
  }
}


export const addCategory = async (req, res) => {
  const sql = "INSERT INTO subject (`subject_name`) VALUES (?)";
  try {
    const [result] = await db.execute(sql, [req.body.category]);
    return res.json({Status: true, id: result.id});
  } catch (err) {
    return res.json({Status: false, Error: "Query Error"});
  }
}


export const deleteCategory = async (req, res) => {
  const id = req.params.id;
  const sql = "DELETE FROM category WHERE id = ?";
  try {
    const [result] = await db.execute(sql, [id]);
    return res.json({ Status: true, Result: result });
  } catch (err) {
    return res.json({ Status: false, Error: "Query Error" + err });
  }
}


export const addEmployee = async (req, res) => {
  if (!req.body.name || !req.body.email || !req.body.password || !req.body.phone || !Array.isArray(req.body.categoryArr)) {
    return res.status(401).json({
      ok: false,
      message: 'Invalid data in adding employee'
    });
  }

  const {name, email, password, phone, categoryArr} = req.body;
  let hashedPassword;

  try {
    hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await db.query("INSERT INTO teacher (`name`, `email`, `password`, `image`, `phone_number`) VALUES (?, ?, ?, ?, ?)", [
      name,
      email,
      hashedPassword,
      req.file.filename,
      phone
    ]);

    const teacherId = result.insertId;

    const teacherSubjectsPromises = categoryArr.map(subjectId => {
      return db.query("INSERT INTO teacher_subjects (`teacher_id`, `subject_id`) VALUES (?, ?)", [
        teacherId,
        subjectId
      ]);
    });

    await Promise.all(teacherSubjectsPromises);

    return res.json({Status: true, Message: "Employee added successfully"});

  } catch (err) {
    console.error('Database query error:', err);
    return res.json({Status: false, Error: "Query Error"});
  }
}


export const getEmployee = async (req, res) => {
  const sql = "SELECT * FROM teacher";
  try {
    const [result] = await db.execute(sql);
    return res.json({ Status: true, Result: result });
  } catch (err) {
    return res.json({ Status: false, Error: "Query Error" });
  }
}


export const getOneEmployee = async (req, res) => {
  const id = req.params.id;
  const sql = "SELECT * FROM employee WHERE id = ?";
  try {
    const [result] = await db.execute(sql, [id]);
    return res.json({Status: true, Result: result});
  } catch (err) {
    return res.json({Status: false, Error: "Query Error"});
  }
}


export const editEmployee = async (req, res) => {
  const id = req.params.id;
  const sql = `UPDATE employee SET name = ?, email = ?, salary = ?, address = ?, category_id = ? WHERE id = ?`;
  const values = [
    req.body.name,
    req.body.email,
    req.body.salary,
    req.body.address,
    req.body.category_id
  ];
  try {
    const [result] = await db.execute(sql, [...values, id]);
    return res.json({ Status: true, Result: result });
  } catch (err) {
    return res.json({ Status: false, Error: "Query Error" + err });
  }
}


export const deleteEmployee = async (req, res) => {
  const id = req.params.id;
  const sql = "DELETE FROM teacher WHERE id = ?";
  try {
    const [result] = await db.execute(sql, [id]);
    return res.json({ Status: true, Result: result });
  } catch (err) {
    return res.json({ Status: false, Error: "Query Error" + err });
  }
}



