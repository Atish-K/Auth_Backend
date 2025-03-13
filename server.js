const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const connectDB = require('./config/db');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

// Set up storage engine for multer
const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  },
});

// Initialize upload
const upload = multer({
  storage: storage,
  limits: { fileSize: 1000000 }, // Limit file size to 1MB
  fileFilter: (req, file, cb) => {
    checkFileType(file, cb);
  },
});

// Check file type
function checkFileType(file, cb) {
  const filetypes = /jpeg|jpg|png|gif/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb('Error: Images Only!');
  }
}

// Define routes
app.use('/api/admin', require('./routes/admin'));
app.use('/api/student', require('./routes/student'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    connectDB();
});
