import { Schema, model } from 'mongoose';

// 1. Interface (Contracte d'Enginyeria)
export interface IProducers {
  _id?: string;
  name: string;
  country: string;
}

// 2. Schema (Validació BBDD)
const organizationSchema = new Schema<IProducers>({
  name: { type: String, required: true },
  country: { type: String, required: true }
});

// 3. Model
export const ProducersModel = model<IProducers>('Organization', organizationSchema);