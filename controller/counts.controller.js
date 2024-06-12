import db from '../utils/db.js'

// ------ Helper function ------- //

const executeCountQuery = async (sql, res, label) => {
  try {
    const [result] = await db.execute(sql);

    return res.json({
      Status: true,
      Result: {
        [label]: result[0].count
      }
    });
  } catch (err) {
    return res.json({Status: false, Error: "Query Error: " + err});
  }
};

export const getAdminsCount = async (req, res) => {
  console.log('requested')
  const sql = "SELECT COUNT(id) AS count FROM admin";
  return await executeCountQuery(sql, res, 'admin');
};

export const getEmployeesCount = async (req, res) => {
  const sql = "SELECT COUNT(id) AS count FROM teacher";
  return await executeCountQuery(sql, res, 'teacher');
};

export const getCategoriesCount = async (req, res) => {
  const sql = "SELECT COUNT(id) AS count FROM subject";
  return await executeCountQuery(sql, res, 'subject');
};

export const getStudentsCount = async (req, res) => {
  const sql = "SELECT COUNT(id) AS count FROM student";
  return await executeCountQuery(sql, res, 'student');
};
