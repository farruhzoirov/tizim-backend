import express from 'express';

const router = express.Router();

import multer from 'multer';
import path from 'path';


import {addGroup, getGroups, deleteGroup, editGroup, getOneGroup} from "../controller/group.controller.js";


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


router.post("/add-group", upload.single('image'), addGroup);

router.get('/groups', getGroups);

router.delete('/groups/:id', deleteGroup);

router.get('/get-one-group/:id', getOneGroup);

router.post('/edit-group/:id', editGroup);




export default router;
