import { Schema, model, Types } from 'mongoose';

// 1️⃣ Interface
export interface IVisit {
    _id?: string;
    customer_id: Types.ObjectId;            // reference to Customer
    restaurant_id: Types.ObjectId;          // reference to Restaurant
    date: Date;
    points_earned: number;
    bill_amount: number;
}

// 2️⃣ Schema
const visitSchema = new Schema<IVisit>({
    customer_id: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
    restaurant_id: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true },
    date: { type: Date, default: new Date() },
    points_earned: { type: Number, default: 0 },
    bill_amount: { type: Number, default: 0 }
}, { timestamps: true });

// 3️⃣ Model
export const VisitModel = model<IVisit>('Visit', visitSchema);