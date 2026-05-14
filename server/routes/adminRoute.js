const express = require("express");
const {
  getAdmins,
  getSingleAdmin,
  editAdmin,
  deleteAdmin,
  loginAdmin,
} = require("../controllers/adminController");

const router = express.Router();

router.get("/getAll", getAdmins);
router.get("/get/:id", getSingleAdmin);
router.post("/login", loginAdmin);
router.put("/edit/:id", editAdmin);
router.delete("/delete/:id", deleteAdmin);

module.exports = router;
