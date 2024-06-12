import express from "express";
import cors from "cors"

import Jwt from "jsonwebtoken"
import cookieParser from "cookie-parser";


const app = express()

import authRoute from "./routes/admin.routes.js";
import teacherRoute from "./routes/employees.routes.js";
import groupRoute from "./routes/groups.routes.js";
import countsRoute from "./routes/counts.routes.js";
import studentRoute from "./routes/students.routes.js";

app.use(cors({
    origin: ["http://localhost:5173"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
}));


app.use(express.json())
app.use(cookieParser())

app.use(express.static('Public'))

const verifyUser = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        return res.json({ Status: false, Error: "Not autheticated" })
    }
    Jwt.verify(token, "jwt_secret_key", (err, decoded) => {
        if (err) return res.json({ Status: false, Error: "Wrong Token" })
        req.id = decoded.id;
        req.role = decoded.role;
        next();
    })
}

app.get("/verify", verifyUser, (req, res) => {
    return res.json({ Status: true, role: req.role, id: req.id })
})

app.use(authRoute)
app.use(teacherRoute);
app.use(groupRoute);
app.use(countsRoute);
app.use(studentRoute);

app.listen(8000, () => {
    console.log("Server is running");
})