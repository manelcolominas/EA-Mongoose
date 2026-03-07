import { Schema, model, Types } from "mongoose";

// 1️⃣ Interface
export interface IRestaurant {
  _id?: string;
  profile: {
    name: string;
    description: string;
    rating?: number;  // serà calculat dinàmicament
    category: string;
    timetable: string[];
    image?: string[];
    contact: {
      phone: string;
      email: string;
    };
    location: {
      city: string;
      address: string;
      coordinates: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: [Number] // [longitude, latitude]
      };
    };
  };
  rewards: Types.ObjectId[];
  statistics: Types.ObjectId;
  badges: Types.ObjectId[];
}

// 2️⃣ Schema
const restaurantSchema = new Schema<IRestaurant>(
    {
      profile: {
        name: { type: String, required: true },
        description: { type: String, required: true },
        rating: { type: Number, default: 0 }, // inicialment 0
        category: {
          type: String,
          enum: [
            'Italià', 'Japonès', 'Sushi', 'Mexicà', 'Xinès', 'Indi', 'Tailandès', 'Francès',
            'Espanyol', 'Grec', 'Turc', 'Coreà', 'Vietnamita','Alemany', 'Brasileny', 'Peruà', 'Vegà', 'Vegetarià', 'Marisc', 'Carn',
            'Pizzeria', 'Cafeteria', 'Ramen', 'Gluten Free','Gourmet', 'Fast Food', 'Buffet', 'Food Truck',
            'Lounge', 'Pub', 'Wine Bar', 'Rooftop', 'Bar', 'Taperia', 'Gelateria'
          ],
          required: true
        },
        timetable: [{ type: String }],
        image: [{ type: String }],
        contact: {
          phone: { type: String, required: true },
          email: { type: String, required: true }
        },
        location: {
          city: { type: String, required: true },
          address: { type: String, required: true },
          coordinates: {
            type: { type: String, enum: ['Point'], default: 'Point' },
            coordinates: { type: [Number], required: true } // [longitude, latitude]
          }
        },
      },
      rewards: [{ type: Schema.Types.ObjectId, ref: "Reward" }],
      statistics: { type: Schema.Types.ObjectId, ref: "Statistics" },
      badges: [{ type: Schema.Types.ObjectId, ref: "Badge" }]
    },
    { timestamps: true }
);

// Index geoespacial
restaurantSchema.index({ "profile.location.coordinates": "2dsphere" });

// 3️⃣ Model
export const RestaurantModel = model<IRestaurant>("Restaurant", restaurantSchema);