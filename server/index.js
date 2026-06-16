const express = require("express");
require("dotenv").config();
require("./database/config");
const cors = require("cors");
const adminRoute = require("./routes/adminRoute");
const courseRoute = require("./routes/courseRoute");
const instructorRoute = require("./routes/instructorRoute");
const studentRoute = require("./routes/studentRoute");
const programRoute = require("./routes/programRoute");
const academicRoute = require("./routes/academicRoute");
const announcementRoute = require("./routes/announcementRoute");

const PORT = process.env.PORT;
const app = express();

// middlewares
app.use(express.json());
app.use(cors());

// APIs
app.use("/v1/api/admin", adminRoute);
app.use("/v1/api/course", courseRoute);
app.use("/v1/api/instructor", instructorRoute);
app.use("/v1/api/student", studentRoute);
app.use("/v1/api/program", programRoute);
app.use("/v1/api/academic", academicRoute);
app.use("/v1/api/announcement", announcementRoute);

// server status
app.get("/v1/api/", (req, res) => {
    res.status(200).send({ success: true, message: "UMS server is active!"});
})

// listening
app.listen(PORT, () => {
    console.log(`Server started at localhost:${PORT}.`);
});