import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICollection extends Document {
  date: Date;
  memberId: mongoose.Types.ObjectId;
  memberName: string;
  accountNo: string;
  branch: string;
  type: 'savings' | 'loan_installment' | 'advance';
  accountId?: mongoose.Types.ObjectId;
  amount: number;
  collectedBy: string;
  notes?: string;
  reference?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CollectionSchema = new Schema<ICollection>(
  {
    date: { type: Date, default: Date.now },
    memberId: { type: Schema.Types.ObjectId, ref: 'Member', required: true },
    memberName: { type: String, required: true },
    accountNo: { type: String, required: true },
    branch: { type: String, required: true },
    type: {
      type: String,
      enum: ['savings', 'loan_installment', 'advance'],
      required: true,
    },
    accountId: { type: Schema.Types.ObjectId },
    amount: { type: Number, required: true },
    collectedBy: { type: String, required: true },
    notes: String,
    reference: String,
  },
  { timestamps: true }
);

CollectionSchema.index({ date: -1 });
CollectionSchema.index({ memberId: 1, date: -1 });

const Collection: Model<ICollection> =
  mongoose.models.Collection ||
  mongoose.model<ICollection>('Collection', CollectionSchema);

export default Collection;
