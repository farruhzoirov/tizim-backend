import db from '../utils/db.js'


export const addGroup = async (req, res) => {
  try {
    const { group_name, subjectId, teacherId, lessonTime, lesson_days, room } = req.body;
    console.log(req.body);
    if (!group_name || !subjectId || !teacherId || !lessonTime || !Array.isArray(JSON.parse(lesson_days)) || !room) {
      return res.status(400).json({
        ok: false,
        message: 'Invalid data in adding group'
      });
    }
    if (!req.file) {
      return res.status(400).json({
        ok: false,
        message: 'File is required'
      })
    }
    const image = req.file.filename;

    const [groupResult] = await db.execute(
      "INSERT INTO `groups` (group_name, subject_id, teacher_id, lesson_time, image, room) VALUES (?, ?, ?, ?, ?, ?)",
      [group_name, subjectId, teacherId, lessonTime, image, room]
    );
    const groupId = groupResult.insertId;

    const groupDaysPromises = JSON.parse(lesson_days).map(dayId => {
      return db.execute("INSERT INTO lessons_group_days (group_id, day_id) VALUES (?, ?)", [
        groupId,
        dayId
      ]);
    });

    await Promise.all(groupDaysPromises);

    return res.json({
      Status: true, Message: "Group added successfully" });

  } catch (err) {
    console.error('Database query error:', err);
    return res.status(500).json({ Status: false, Error: "Query Error" });
  }
}



export const getGroups = async (req, res) => {
  try {
    const [data] = await db.execute(
        `SELECT 
        g.id,
        g.room,
        g.group_name,
        g.lesson_time,
        g.image,
        t.name AS teacher_name,
        s.subject_name AS subject_name,
        GROUP_CONCAT(ld.day_name) AS day_names
     FROM 
        \`groups\` g
     LEFT JOIN 
        \`teacher\` t ON g.teacher_id = t.id
     LEFT JOIN 
        \`subject\` s ON g.subject_id = s.id
     LEFT JOIN 
        \`lessons_group_days\` lgd ON g.id = lgd.group_id
     LEFT JOIN 
        \`lessons_days\` ld ON lgd.day_id = ld.id
     GROUP BY 
        g.id,
        g.room,
        g.group_name,
        g.lesson_time,
        g.image,
        t.name,
        s.subject_name;`
    );
    const processedData = data.map(group => ({
      ...group,
      day_names: group.day_names ? group.day_names.split(',') : []  // Handle null `day_names`
    }));

    console.log(processedData)
    return res.status(200).json({ Status: true, data: processedData });
  } catch (e) {
    console.log('Database query error:', e);
    return res.status(500).json({ Status: false, Error: "Query Error" });
  }
}

export const getOneGroup = async (req, res) => {
  try {
    const id = req.params.id;
    // const sql = `SELECT * FROM \`groups\` WHERE id = ?`;
    // const [result] = await db.execute(sql, [id]);

    const [data] = await db.execute(
        `SELECT 
        g.id,
        g.room,
        g.group_name,
        g.lesson_time,
        t.id AS teacher_id,
        t.name AS teacher_name,
        GROUP_CONCAT(ld.id) AS day_names
     FROM 
        \`groups\` g
     INNER JOIN 
        \`teacher\` t ON g.teacher_id = t.id
     INNER JOIN 
        \`subject\` s ON g.subject_id = s.id
     INNER JOIN 
        \`lessons_group_days\` lgd ON g.id = lgd.group_id
     INNER JOIN 
        \`lessons_days\` ld ON lgd.day_id = ld.id
     WHERE 
        g.id = ?
     GROUP BY 
        g.id,
        g.room, 
        g.group_name,
        g.lesson_time,
        t.name,
        t.id;`,
        [id]
    );

    const processedData = data.map(({ day_names, ...group }) => ({
      ...group,
      lesson_days: day_names ? day_names.split(',') : []  // Split the day names into an array or return an empty array
    }));


    res.json({Status: true, data: processedData});

  } catch (err) {
    console.log(err)
    res.status(500).json({
      ok:false,
      message: 'Server side error'
    })
  }
}





export const deleteGroup = async (req, res) => {
  try {
    const id = req.params.id;

    // Confirm the ID exists before attempting to delete
    const checkSql = `SELECT id FROM \`groups\` WHERE id = ?`;
    const [checkResult] = await db.execute(checkSql, [id]);

    if (!checkResult.length) {
      return res.status(404).json({
        ok: false,
        message: 'Group not found.'
      });
    }

    // Proceed with deletion
    const deleteSql = `DELETE FROM \`groups\` WHERE id = ?`;
    const [deleteResult] = await db.execute(deleteSql, [id]);

    if (deleteResult.affectedRows > 0) {
      return res.status(200).json({
        ok: true,
        Status: true,
        message: 'Group deleted successfully'
      });
    }

    res.status(404).json({
      ok: false,
      message: 'Group was not found.'
    });

  } catch (err) {
    return res.status(500).json({
      ok: false,
      status: false,
      message: 'Server side error'
    });
  }
};



export const editGroup = async (req, res) => {
  try {
    const id = req.params.id;
    const { group_name, teacher_id, subject_id, lesson_time, room,  lesson_days } = req.body;
    console.log(req.body)
    if (!group_name && !teacher_id && !subject_id && !lesson_time && !room  && !lesson_days) {
      return res.status(400).json({
        ok: false,
        message: 'Invalid data in updating group'
      });
    }

    let updates = [];
    let values = [];
    if (group_name) {
      updates.push('group_name = ?');
      values.push(group_name);
    }
    if (teacher_id) {
      updates.push('teacher_id = ?');
      values.push(teacher_id);
    }
    if (subject_id) {
      updates.push('subject_id = ?');
      values.push(subject_id);
    }
    if (lesson_time) {
      updates.push('lesson_time = ?');
      values.push(lesson_time);
    }
    if (room) {
      updates.push('room = ?');
      values.push(room);
    }


    const updateGroupSql = `UPDATE \`groups\` SET ${updates.join(', ')} WHERE id = ?`;
    values.push(id);

    const [updateResult] = await db.execute(updateGroupSql, values);

    if (!updateResult.affectedRows) {
      return res.status(404).json({ message: 'Group not found.' });
    }

    if (lesson_days && lesson_days.length > 0) {
      const deleteDaysSql = `DELETE FROM \`lessons_group_days\` WHERE group_id = ?`;
      await db.execute(deleteDaysSql, [id]);

      const insertDaysSql = `INSERT INTO \`lessons_group_days\` (group_id, day_id) VALUES (?, ?)`;
      for (const day_id of lesson_days) {
        await db.execute(insertDaysSql, [id, day_id]);
      }
    }
    return res.status(200).json({ Status: true, message: 'Group updated successfully.' });
  } catch (err) {
    console.error('Error updating group:', err);
    return res.status(500).json({
      Status: false,
      Error: "Query Error: " + err.message
    });
  }
}



