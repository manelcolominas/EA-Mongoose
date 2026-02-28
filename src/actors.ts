import { Schema, model, Types } from 'mongoose';

export interface IActor {
  _id?: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'EDITOR' | 'USER';
  famousFor: string[];
  organization: Types.ObjectId; // Referència forta a l'altra col·lecció
}

const actorSchema = new Schema<IActor>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  role: { type: String, enum: ['ACTOR', 'DIRECTOR', 'PRODUCER', 'SCREENWRITER', 'LEGENDARY_ACTOR'], required: true },
  famousFor: { type: [String], required: true },
  organization: { type: Schema.Types.ObjectId, ref: 'Organization', required: true }
});

export const ActorModel = model<IActor>('actor', actorSchema);