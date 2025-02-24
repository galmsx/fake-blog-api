import {User} from '../../user/types'

export interface ValidateRequest{
  email: string;
  password: string;
}

export interface LoginResponse{
  accessToken: string;
  refreshToken: string;
  user: User;
}
