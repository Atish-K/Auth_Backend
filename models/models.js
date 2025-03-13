const mongoose = require('mongoose');

const AdminSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  userStatus: { type: String, required: true },
  userStatusTime: { type: Date, required: true },
  profileImage: { type: String },
});

const StudentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, required: true },
  qualification: { type: [String], required: true },
  gender: { type: String, required: true },
  profileImage: { type: String },
});

const Admin = mongoose.model('Admin', AdminSchema);
const Student = mongoose.model('Student', StudentSchema);

module.exports = { Admin, Student };
