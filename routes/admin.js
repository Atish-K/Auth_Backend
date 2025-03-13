const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Admin } = require('../models/models');

const router = express.Router();

const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: './uploads/admin/',
  filename: (req, file, cb) => {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

router.post('/upload-photo', upload.single('profileImage'), async (req, res) => {
  const token = req.header('Authorization').replace('Bearer ', '');
  try {
    const decoded = jwt.verify(token, 'secret');
    const adminId = decoded.id;
    const profileImage = req.file ? req.file.filename : null;

    await Admin.findByIdAndUpdate(adminId, { profileImage });
    res.status(200).json({ message: 'Photo uploaded successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error uploading photo' });
  }
});

router.get('/admin/:id', async (req, res) => {
  try {
    const adminId = req.params.id;
    const admin = await Admin.findById(adminId);

    if (!admin) {
      return res.status(404).json({ error: 'Admin not found' });
    }

    res.json(admin);
  } catch (error) {
    res.status(500).json({ error: 'Error retrieving admin details' });
  }
});

// Register Admin
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const admin = new Admin({ name, email, password: hashedPassword });
    await admin.save();
    res.status(200).json({ message: 'Admin registered successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error registering admin' });
  }
});

// Login Admin
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(400).json({ error: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

    await Admin.findByIdAndUpdate(admin._id, {
      userStatus: 'Login',
      userStatusTime: new Date(),
    });

    const token = jwt.sign({ id: admin._id, email: admin.email, name: admin.name, profileImage: admin.profileImage, userStatusTime: admin.userStatusTime }, 'secret', { expiresIn: '5h' });
    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ error: 'Error logging in' });
  }
});

router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  try {
    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(400).json({ error: 'Email not found' });

    // Generate a reset token (in a real app, send this via email)
    const resetToken = jwt.sign({ id: admin._id }, 'secret', { expiresIn: '15m' });
    res.status(200).json({ message: 'Password reset token generated', resetToken });
  } catch (error) {
    res.status(500).json({ error: 'Error processing request' });
  }
});

router.post('/reset-password', async (req, res) => {
  const { resetToken, newPassword } = req.body;
  try {
    const decoded = jwt.verify(resetToken, 'secret');
    const adminId = decoded.id;

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await Admin.findByIdAndUpdate(adminId, {
      password: hashedPassword,
    });

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error updating password' });
  }
});

router.post('/change-password', async (req, res) => {
  const { adminId, oldPassword, newPassword } = req.body;
  try {
    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(404).json({ error: 'Admin not found' });
    }
    // const oldPassword = bcrypt.hash(admin.password, 10);
    const isMatch = await bcrypt.compare(oldPassword, admin.password);
    console.log('Password match:', isMatch);
    if (!isMatch) {
      return res.status(400).json({ error: 'Old password is incorrect' });
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await Admin.findByIdAndUpdate(adminId, { password: hashedPassword });
    res.status(200).json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error changing password' });
  }
});

router.post('/edit-profile', async (req, res) => {
  const token = req.header('Authorization').replace('Bearer ', '');
  try {
    const decoded = jwt.verify(token, 'secret');
    const adminId = decoded.id;
    const { name, email } = req.body;

    await Admin.findByIdAndUpdate(adminId, { name, email });
    res.status(200).json({ message: 'Profile updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error updating profile' });
  }
});


router.post('/logout', async (req, res) => {
  const token = req.header('Authorization').replace('Bearer ', '');
  
  try {
    const decoded = jwt.verify(token, 'secret');
    const adminId = decoded.id;

    await Admin.findByIdAndUpdate(adminId, {
      userStatus: 'Logout',
      userStatusTime: new Date(),
    });

    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error logging out' });
  }
});

module.exports = router;
