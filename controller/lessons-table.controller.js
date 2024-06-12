import db from "../utils/db.js";

export const getLessonsTable = async (req, res) => {
  try {
    // const id = req.params.id;
    const [data] = await db.execute(
        `SELECT 
        g.id,
        g.room,
        g.group_name,
        g.lesson_time,
        t.id AS teacher_id,
        t.name AS teacher_name,
        s.subject_name AS subject_name,
        GROUP_CONCAT(ld.day_name) AS day_names
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
      GROUP BY 
        g.id,
        g.room, 
        g.group_name,
        g.lesson_time,
        t.id,
        t.name,
        s.subject_name;`
    );

    const weekDays = ["Dushanba", "Seshanba", "Chorshanba", "Payshanba", "Juma", "Shanba", "Yakshanba"];

    const processedData = data.map(({ day_names, ...group }) => {
      const lessonDays = day_names ? day_names.split(',') : [];
      console.log(lessonDays)

      const filledLessonDays = weekDays.map(day =>
          lessonDays.includes(day) ? day : ''
      );

      return {
        ...group,
        lesson_days: filledLessonDays
      };
    });

    res.status(200).json({
      Status: true,
      data: processedData
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({
      ok: false,
      message: 'Server side error'
    });
  }
};
