const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const router = express.Router();

// Path for metadata storage
const metadataFile = path.join(__dirname, "../uploads", "metadata.json");

// Ensure the uploads directory exists
const uploadPath = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath);
}
if (!fs.existsSync(metadataFile)) {
  fs.writeFileSync(metadataFile, JSON.stringify([])); // Initialize metadata.json
}

// Configure Multer for file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // const uploadPath = path.join(__dirname, "../uploads");
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath); // Create 'uploads' directory if it doesn't exist
    }
    cb(null, uploadPath); // Files will be saved in the 'uploads' folder
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
    cb(null, `${uniqueSuffix}-${file.originalname}`); // Unique file name
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5MB
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = ["image/jpeg", "image/png", "image/gif"];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only JPEG, PNG, and GIF are allowed."));
    }
  }
});


// Helper function to calculate distance between two lat/long points (Haversine formula)
function calculateDistance(lat1, lon1, lat2, lon2) {
    const toRad = (value) => (value * Math.PI) / 180;
    const R = 6371; // Earth's radius in km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
  }

// File upload API
router.post("/upload", upload.single("photo"), (req, res) => {

    const { lat, long } = req.body;
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }
  if (!lat || !long) {
    return res.status(400).json({ error: "Latitude and longitude are required." });
  }

  const metadata = {
    fileName: req.file.filename,
    filePath: `/uploads/${req.file.filename}`,
    uploadDate: new Date().toISOString(),
    latitude: parseFloat(lat),
    longitude: parseFloat(long)
  };

  console.log(metadata)

  // Read existing metadata or initialize a new array
  let currentData = [];
  try {
    if (fs.existsSync(metadataFile)) {
      const fileContent = fs.readFileSync(metadataFile, "utf-8");
      currentData = JSON.parse(fileContent) || []; // Ensure it's an array
    }
  } catch (error) {
    console.error("Error reading or parsing metadata file:", error);
    return res.status(500).json({ error: "Server error while reading metadata." });
  }

  // Add new metadata and write back to the file
  currentData.push(metadata);
  try {
    fs.writeFileSync(metadataFile, JSON.stringify(currentData, null, 2)); // Format JSON for readability
  } catch (error) {
    console.error("Error writing metadata file:", error);
    return res.status(500).json({ error: "Server error while saving metadata." });
  }

  res.json({
    message: "File uploaded successfully",
    filePath: metadata.filePath,
    metadata,
  });
});

// Fetch all uploaded images API
router.get("/getimages", (req, res) => {
    const metadata = JSON.parse(fs.readFileSync(metadataFile));
    res.json(metadata);
});

// Fetch latest uploaded images API
router.get("/latest", (req, res) => {
    const metadata = JSON.parse(fs.readFileSync(metadataFile));
    const sortedByDate = metadata.sort(
      (a, b) => new Date(b.uploadDate) - new Date(a.uploadDate)
    );
    res.json(sortedByDate);
  });

  router.get("/nearest", (req, res) => {
    const { lat, long } = req.query;
  
    if (!lat || !long) {
      return res.status(400).json({ error: "Latitude and longitude are required." });
    }
  
    const metadata = JSON.parse(fs.readFileSync(metadataFile));
  
    const sortedByProximity = metadata
      .map((image) => ({
        ...image,
        distance: calculateDistance(lat, long, image.latitude, image.longitude)
      }))
      .sort((a, b) => a.distance - b.distance);
  
    res.json(sortedByProximity);
  });

router.get("/getimage/:imageName", (req, res) => {
    let imageName = req.params.imageName; // Get the image name from the URL parameter
  
    // Decode the URL-encoded image name (this handles spaces and special characters)
    imageName = decodeURIComponent(imageName);
  
    const imagePath = path.join(__dirname, "uploads", imageName);
  
    console.log("Decoded Image Name: ", imageName); // Log the decoded image name
    console.log("Image Path: ", imagePath); // Log the full image path
  
    // Check if the image exists
    if (fs.existsSync(imagePath)) {
      res.sendFile(imagePath); // Send the image file to the client
    } else {
      res.status(404).json({ error: "Image not found" });
    }
  });

module.exports = router;
