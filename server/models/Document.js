const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
    filename: { type: String, required: true },
    originalName: { type: String, required: true },
    path: { type: String, required: true },
    type: { type: String, enum: ['file', 'url'], default: 'file' },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['pending', 'processed', 'failed'], default: 'pending' }
}, { timestamps: true });

module.exports = mongoose.model('Document', documentSchema);
