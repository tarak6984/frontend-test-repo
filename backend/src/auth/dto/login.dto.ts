import { IsEmail, IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ 
    example: 'admin@auditvault.com', 
    description: 'User email address',
    format: 'email'
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ 
    example: 'password123', 
    description: 'User password',
    minLength: 6
  })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiPropertyOptional({ 
    example: '123456', 
    description: 'MFA token for admin users (optional)'
  })
  @IsString()
  @IsOptional()
  mfaToken?: string;
}
