import { UserType } from '../enum';

export interface User {
  id: string;
  email: string;
  type: UserType;
}
export interface UserWithPassword extends User {
  password: string;
}

export interface UserFindOptions {
  id?: string;
  email?: string;
}

export interface CreateUserRequest{
  email: string;
  name: string;
  password: string;
  type: UserType;
}
