import express from "express";


const router = express.Router();

import {getAllStudents, getStudentsByGroupId} from "../controller/students.controller.js";




router.get('/students', getAllStudents);

router.post('/get-students-by-groupId/:id', getStudentsByGroupId);


export default router;