import express from 'express';

const router = express.Router();

import {getLessonsTable} from '../controller/lessons-table.controller.js';

router.get('/lessons-table', getLessonsTable);


export default router;