import { Schema, model, Types } from 'mongoose';

// 1️⃣ Interface
export interface IBadge {
    _id?: string;
    title: string;
    description: string;
    type: string;
}

// 2️⃣ Schema
const badgeSchema = new Schema<IBadge>({
    title: { type: String, required: true },
    description: { type: String, required: true },
    type: { type: String, required: true },
}, { timestamps: true });

// 3️⃣ Model
export const BadgeModel = model<IBadge>('Badge', badgeSchema);