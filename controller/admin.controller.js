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
    return res.json({Status: true, Result: result});
  } catch (err) {
    console.log(err)
    return res.json({Status: false, Error: "Query Error"});

  }
}


export const getAdmins = async (req, res) => {
  const sql = "SELECT * FROM admin";
  try {
    const [result] = await db.execute(sql);
    return res.json({Status: true, Result: result});
  } catch (err) {
    return res.json({Status: false, Error: "Query Error" + err});
  }
}


export const adminLogin = async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    const [rows] = await db.query('SELECT * FROM admin WHERE email = ? AND password = ?', [email, password]);
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
    console.log(err)
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
    const category = req.body.category;

    if (!category) {
      return res.status(400).json({
        ok: false,
        message: 'Invalid data'
      })
    }
    const [result] = await db.execute(sql, [req.body.category]);
    return res.json({
      Status: true,
      id: result.id
    });
  } catch (err) {
    return res.json({Status: false, Error: "Query Error"});
  }
}


export const deleteCategory = async (req, res) => {
  try {
    const id = req.params.id;

    if (!id) {
      return res.status(400).json({
        ok: false,
        message: 'Invalid data'
      })
    }

    const sql = "DELETE FROM subject WHERE id = ?";

    const [result] = await db.execute(sql, [id]);
    return res.json({
      Status: true,
      Result: result
    });
  } catch (err) {
    return res.json({Status: false, Error: "Query Error" + err});
  }
}


export const addEmployee = async (req, res) => {
  try {
    const {name, email, password, phone, categoryArr} = req.body;
    let hashedPassword;
    console.log(req.body)
    if (!name || !email || !password || !phone || !Array.isArray(JSON.parse(categoryArr))) {
      return res.status(400).json({
        ok: false,
        message: 'Invalid data in adding employee'
      });
    }
    hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await db.query("INSERT INTO teacher (`name`, `email`, `password`, `image`, `phone_number`) VALUES (?, ?, ?, ?, ?)", [
      name,
      email,
      hashedPassword,
      req.file.filename,
      phone
    ]);

    const teacherId = result.insertId;

    const teacherSubjectsPromises = JSON.parse(categoryArr).map(subjectId => {
      return db.query("INSERT INTO teacher_subjects (`teacher_id`, `subject_id`) VALUES (?, ?)", [
        teacherId,
        subjectId
      ]);
    });

    await Promise.all(teacherSubjectsPromises);

    return res.json({
      Status: true,
      Message: "Employee added successfully"
    });

  } catch (err) {
    console.error('Database query error:', err);
    return res.json({Status: false, Error: "Query Error"});
  }
}


export const getEmployee = async (req, res) => {
  try {
    const sql = "SELECT * FROM teacher";

    const [result] = await db.execute(sql);
    console.log(result)
    return res.json({Status: true, Result: result});

  } catch (err) {
    return res.json({Status: false, Error: err.error});
  }
}


export const getOneEmployee = async (req, res) => {
  const id = req.params.id;
  console.log(id)
  const sql = "SELECT * FROM teacher WHERE id = ?";
  try {
    const [result] = await db.execute(sql, [id]);
    return res.json({Status: true, Result: result});
  } catch (err) {
    return res.json({Status: false, Error: err});
  }
}


export const editEmployee = async (req, res) => {
  try {

    const id = req.params.id;
    const {name, email, phone} = req.body;
    //
    console.log(req.body)
    if (!name && !email && !phone) {
      return res.status(400).json({
        ok: false,
        message: 'Invalid data in adding employee'
      });
    }

    let updates = [];
    let values = [];
    if (email) {
      updates.push('email = ?');
      values.push(email);
    }
    if (name) {
      updates.push('name = ?');
      values.push(name);
    }
    if (phone) {
      updates.push('phone_number = ?');
      values.push(phone);
    }

    const sql = `UPDATE teacher SET ${updates.join(', ')} WHERE id = ?`;
    values.push(id)
    const [result] =  await db.execute(sql, values);

    console.log(result)

    if (!result.affectedRows) {
      res.status(400).json({message: 'Teacher not found.'});
    }
    res.status(200).json({Status:true, message: 'Teacher updated successfully.'});

  } catch (err) {
    return res.status(500).json({
      Status: false,
      Error: "Query Error" + err.error
    });
  }
}


export const deleteEmployee = async (req, res) => {
  const id = req.params.id;
  const sql = "DELETE FROM teacher WHERE id = ?";
  try {
    const [result] = await db.execute(sql, [id]);
    return res.json({Status: true, Result: result});
  } catch (err) {
    return res.json({Status: false, Error: "Query Error" + err});
  }
}


export const logoutAdmin = async (req, res) => {
  await res.clearCookie("token");
  return res.json(
      {
        Status: true
      });
}

