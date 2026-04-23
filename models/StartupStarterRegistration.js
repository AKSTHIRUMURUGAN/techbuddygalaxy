import mongoose from 'mongoose';

const startupStarterRegistrationSchema = new mongoose.Schema({
  ticketId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    index: true
  },
  rollNo: {
    type: String,
    required: true
  },
  department: {
    type: String,
    required: true
  },
  phoneNo: {
    type: String,
    required: true
  },
  college: {
    type: String,
    required: true,
    default: 'REC'
  },
  registeredAt: {
    type: Date,
    default: Date.now
  },
  entryVerified: {
    type: Boolean,
    default: false
  },
  entryVerifiedAt: {
    type: Date,
    default: null
  },
  morningAttendance: {
    type: Date,
    default: null
  },
  eveningAttendance: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

export default mongoose.models.StartupStarterRegistration || 
  mongoose.model('StartupStarterRegistration', startupStarterRegistrationSchema);
