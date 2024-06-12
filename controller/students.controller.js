import db from '../utils/db.js'


export const getAllStudents = async (req, res) => {
  try {
    const sql = `SELECT * FROM students`;
    const [result] = await db.execute(sql)

    if (!result.affectedRows) {
      return res.status(200).send({
        ok: false,
        Status: false,
        message: "No students found",
        data: []
      })
    }
    res.status(200).json({
      Status: true,
      data: result,
      message: 'All students'
    })


  } catch (err) {
    console.log('Getting students from database' + err)
    res.status(500).json({
      ok: false,
      Status: false,
      message: 'Server side error'
    })
  }
}


export const getStudentsByGroupId = async (req, res) => {
  const groupId = req.params.id;
  console.log(groupId);

  const sql = `
    SELECT 
      s.id,
      s.name,
      s.lastname,
      s.email,
      s.phone_number,
      s.group_id,
      g.group_name
    FROM 
      \`students\` s
    INNER JOIN 
      \`groups\` g ON s.group_id = g.id
    WHERE 
      s.group_id = ?
  `;

  try {
    const [result] = await db.execute(sql, [groupId]);
    if (!result.length) {
      return res.status(404).json({Status: false, message: 'No students found for this group.'});
    }

     res.status(200).json({Status: true, Result: result});
  } catch (err) {
    console.error('Error fetching students:', err);
    return res.status(500).json({Status: false, Error: err.message});
  }
}



