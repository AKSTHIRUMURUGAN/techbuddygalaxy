import mongoose from 'mongoose';

const startupStarterTeamSchema = new mongoose.Schema({
  teamId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  teamNumber: {
    type: Number,
    required: true,
    unique: true
  },
  teamName: {
    type: String,
    default: null
  },
  startupName: {
    type: String,
    default: null
  },
  i2rMemberProfileUrls: {
    type: String,
    default: null
  },
  i2rIdeaProfileUrl: {
    type: String,
    default: null
  },
  i2rCompanyProfileUrl: {
    type: String,
    default: null
  },
  // Shark Tank Evaluation
  evaluation: {
    problemScore: { type: Number, default: 0, min: 0, max: 10 },
    solutionScore: { type: Number, default: 0, min: 0, max: 10 },
    businessModelScore: { type: Number, default: 0, min: 0, max: 10 },
    pitchScore: { type: Number, default: 0, min: 0, max: 10 },
    innovationScore: { type: Number, default: 0, min: 0, max: 10 },
    totalScore: { type: Number, default: 0 },
    adminComments: { type: String, default: null },
    evaluatedBy: { type: String, default: null },
    evaluatedAt: { type: Date, default: null }
  },
  resultsPublished: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

export default mongoose.models.StartupStarterTeam || 
  mongoose.model('StartupStarterTeam', startupStarterTeamSchema);
