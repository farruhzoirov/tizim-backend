import express from 'express';

const router = express.Router();
import db from '../utils/db.js';

import multer from 'multer';
import path from 'path';


// Image upload configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "Public/groups");
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + "_" + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({storage});


router.post("/add-group", upload.single('image'), async (req, res) => {
  try {
    const {group_name, subjectId, teacherId, lessonTime, lesson_days, room} = req.body;

    if (!group_name || !subjectId || !teacherId || !lessonTime || !Array.isArray(lesson_days)) {
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

    const groupDaysPromises = lesson_days.map(dayId => {
      return db.execute("INSERT INTO lessons_group_days (group_id, day_id) VALUES (?, ?)", [
        groupId,
        dayId
      ]);
    });

    await Promise.all(groupDaysPromises);

    return res.json({Status: true, Message: "Group added successfully"});

  } catch (err) {
    console.error('Database query error:', err);
    return res.status(500).json({Status: false, Error: "Query Error"});
  }
});


router.get('/groups', async (req, res) => {
  try {
    const [data] = await db.execute(
        `SELECT 
          g.group_name,
          g.lesson_time,
          g.image,
          t.name AS teacher_name,
          s.subject_name AS subject_name
       FROM 
          \`groups\` g
       INNER JOIN 
          \`teacher\` t ON g.teacher_id = t.id
       INNER JOIN 
          \`subject\` s ON g.subject_id = s.id`
    );
    return res.status(200).json({Status: true, data: data});
  } catch (e) {
    console.log('Database query error:', e);
    return res.status(500).json({Status: false, Error: "Query Error"});
  }
})

export default router;
