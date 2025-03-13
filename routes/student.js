const express = require('express');
const { Student } = require('../models/models');
const multer = require('multer');
const path = require('path');

const router = express.Router();

// Set up multer for file uploads
const upload = multer({
    storage: multer.diskStorage({
      destination: './uploads/',
      filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
      },
    }),
    limits: { fileSize: 1000000 },
    fileFilter: (req, file, cb) => {
      const filetypes = /jpeg|jpg|png|gif/;
      const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
      const mimetype = filetypes.test(file.mimetype);
  
      if (mimetype && extname) {
        return cb(null, true);
      } else {
        cb('Error: Images Only!');
      }
    },
  });

// Add Student with image upload
router.post('/add', upload.single('profileImage'), async (req, res) => {
  const { name, email, password, phone, qualification, gender } = req.body;
  const profileImage = req.file ? req.file.filename : null;

  try {
    const student = new Student({ name, email, password, phone, qualification, gender, profileImage });
    await student.save();
    res.status(200).json({ message: 'Student added successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error adding student' });
  }
});

// Get Student List
router.get('/list', async (req, res) => {
  try {
    const students = await Student.find();
    res.json(students);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching students' });
  }
});

// Update Student
router.put('/update/:id', upload.single('profileImage'), async (req, res) => {
  const { id } = req.params;
  const { name, email, password, phone, qualification, gender } = req.body;
  const profileImage = req.file ? req.file.filename : null;

  try {
    const student = await Student.findById(id);
    if (!student) return res.status(404).json({ error: 'Student not found' });

    student.name = name || student.name;
    student.email = email || student.email;
    student.password = password || student.password;
    student.phone = phone || student.phone;
    student.qualification = qualification || student.qualification;
    student.gender = gender || student.gender;
    student.profileImage = profileImage || student.profileImage;

    await student.save();
    res.json({ message: 'Student updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error updating student' });
  }
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const student = await Student.findById(id);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    res.json(student);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching student' });
  }
});

// Delete Student
router.delete('/delete/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const student = await Student.findByIdAndDelete(id);
    if (!student) return res.status(404).json({ error: 'Student not found' });

    res.json({ message: 'Student deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting student' });
  }
});

module.exports = router;
