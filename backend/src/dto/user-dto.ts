import { ObjectId } from 'mongoose';

export interface CreateUserDTO {
  name: string;
  lastname: string;
  username: string;
  email: string;
  password: string;
  dateOfBirth: Date;
}

export interface ActivateUserDTO {
  user_id: ObjectId;
  activationCode: number;
}

export interface CreateActivationCodeDTO {
  user_id: ObjectId;
}
