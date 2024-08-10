import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ActivationCodeDocument = HydratedDocument<ActivationCode>;

@Schema()
export class ActivationCode {
  @Prop({ required: true })
  user_id: Types.ObjectId;

  @Prop({ required: true })
  code: number;

  @Prop({ required: true })
  tryCount: number;

  @Prop({ required: true })
  createdAt: Date;
}

export const ActivationCodeSchema =
  SchemaFactory.createForClass(ActivationCode);
