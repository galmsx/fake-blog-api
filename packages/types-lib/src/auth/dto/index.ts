import {
  IsString,
  IsEmail,
  Matches,
  MinLength,
  MaxLength,
} from 'class-validator';

/**
 * To check a password between 5 to 20 characters which contain at least one numeric digit, one uppercase and one lowercase letter
 */
const passwordExp = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{5,20}$/;

export class RegisterUserDto {
  @IsEmail()
  readonly email: string;

  @IsString()
  readonly name: string;

  @IsString()
  @MinLength(5, { context: { min: 5 } })
  @MaxLength(20, { context: { max: 20 } })
  @Matches(passwordExp, { context: { _message: 'weakPassword' } })
  readonly password: string;
}
