const express = require("express");
const multer = require("multer");
const path = require("path");

const router = express.Router();

router.get("/test", (req, res)=>{
    res.send("hello")
})

module.exports = router;
