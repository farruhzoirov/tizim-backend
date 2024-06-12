import express from "express";


const router = express.Router();


import {employeeLogin, employeeLogout, getOneEmployee} from '../controller/employee.controller.js'

router.post('/employee_login', employeeLogin);

router.get("/detail/:id", getOneEmployee);

router.get("/logout", employeeLogout);



export default router