const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: String,
    priority: { type: String, enum: ['Low', 'Medium', 'High'], required: true },
    status: { type: String, enum: ['Pending', 'In Progress', 'Complete'], default: 'Pending' },
    assignedUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    dueDate: Date,
});

module.exports = mongoose.model('Task', TaskSchema);
