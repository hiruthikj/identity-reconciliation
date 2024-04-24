import { IsEmail, IsOptional, IsPhoneNumber } from 'class-validator';

export class UserIdentityDTO {
  @IsPhoneNumber()
  @IsOptional()
  phoneNumber?: string;

  @IsEmail()
  @IsOptional()
  email?: string;
}
