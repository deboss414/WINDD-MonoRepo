import mongoose from 'mongoose';
import Task from '../models/task';
import { config } from '../config';

async function migrateTasksSchema() {
  try {
    // Connect to MongoDB
    await mongoose.connect(config.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find all tasks using lean() to get plain objects
    const tasks = await Task.find({}).lean();
    console.log(`Found ${tasks.length} tasks to migrate`);

    for (const task of tasks) {
      const updateFields: any = {};

      // Update status if it's not a valid value
      if (!['in-progress', 'completed', 'expired', 'closed'].includes(task.status)) {
        updateFields.status = 'in-progress';
      }

      // Initialize arrays if they don't exist
      if (!Array.isArray(task.participants)) updateFields.participants = [];
      if (!Array.isArray(task.subtasks)) updateFields.subtasks = [];
      if (!Array.isArray(task.comments)) updateFields.comments = [];

      // Set progress if not defined
      if (typeof task.progress === 'undefined') {
        updateFields.progress = 0;
      }

      // Update the task if there are any changes
      if (Object.keys(updateFields).length > 0) {
        await Task.updateOne({ _id: task._id }, { $set: updateFields });
        console.log(`Migrated task: ${task._id}`);
      }
    }

    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the migration
migrateTasksSchema(); 