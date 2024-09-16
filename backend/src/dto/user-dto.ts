import { ObjectId } from 'mongoose';

export interface CreateUserDTO {
  firstname: string;
  lastname: string;
  username: string;
  email: string;
  password: string;
  dateOfBirth: Date;
}

export interface ActivateUserDTO {
  user_id: string;
  activationCode: number;
}

export interface CreateActivationCodeDTO {
  user_id: string;
}
