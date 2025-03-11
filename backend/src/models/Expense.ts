import mongoose, { Schema, Document } from 'mongoose';

export interface IExpense extends Document {
  userId: mongoose.Types.ObjectId;
  amount: number;
  description: string;
  category: string;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ExpenseSchema: Schema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  }
}, {
  timestamps: true
});

export default mongoose.model<IExpense>('Expense', ExpenseSchema); 