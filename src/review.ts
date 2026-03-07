import { Schema, model, Types } from 'mongoose';

// 1️⃣ Interface
export interface IReview {
    _id?: string;
    customer_id: Types.ObjectId;        // reference to Customer
    restaurant_id: Types.ObjectId;    // reference to Restaurant
    date: Date;
    ratings: {
        foodQuality: number;                   // 0-5 stars
        staffService: number;                  // 0-5 stars
        cleanliness: number;            // 0-5 stars
        environment: number;               // 0-5 stars
    };
    comment?: string;
    photos?: string[];
    likes?: number;
    extraPoints?: number;             // optional points awarded for feedback
}

// 2️⃣ Schema
const reviewSchema = new Schema<IReview>({
    customer_id: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
    restaurant_id: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true },
    date: { type: Date, required: true },
    ratings: {
        foodQuality: { type: Number, required: true, min: 0, max: 5 },
        staffService: { type: Number, required: true, min: 0, max: 5 },
        cleanliness: { type: Number, required: true, min: 0, max: 5 },
        environment: { type: Number, required: true, min: 0, max: 5 },

    },
    comment: { type: String },
    photos: [{ type: String }],
    likes: { type: Number, default: 0 },
    extraPoints: { type: Number, default: 0 }
}, { timestamps: true });

// 3️⃣ Model
export const ReviewModel = model<IReview>('Review', reviewSchema);