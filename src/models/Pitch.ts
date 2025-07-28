import mongoose from 'mongoose';

// Define the schema for a single Pitch document
const PitchSchema = new mongoose.Schema({
  // The ID of the user who created this pitch (from Supabase Auth)
  userId: {
    type: String,
    required: [true, 'Please provide a userId for this pitch.'],
  },
  // The title given by the user for this specific pitch
  title: {
    type: String,
    required: [true, 'Please provide a title for this pitch.'],
    maxlength: [100, 'Title cannot be more than 100 characters'], // Increased max length for flexibility
  },
  // The raw input data provided by the user to generate the pitch
  inputData: {
    problem: { type: String, required: true },
    solution: { type: String, required: true },
    targetAudience: { type: String }, // Optional field
    // You can add more input fields here later (e.g., product, company name)
  },
  // The actual AI-generated pitch text
  generatedPitch: {
    type: String,
    required: [true, 'Please provide a generated pitch.'],
  },
  // Timestamp for when the pitch was created
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// If the model already exists, use it; otherwise, create a new one.
// This prevents Mongoose from recompiling the model on hot reloads.
export default mongoose.models.Pitch || mongoose.model('Pitch', PitchSchema);