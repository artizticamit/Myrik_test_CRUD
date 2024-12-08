const express = require("express")
const app = express();
const path = require("path")
const multer = require("multer")
const cors = require("cors")

// PORT
const PORT = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());


const apiRoutes = require("./routes/upload")

app.use("/api", apiRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// testing purpose
app.get('/', (req, res) => {
    res.send('Hello, World!');
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

