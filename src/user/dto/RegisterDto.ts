import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Length,
  Matches,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @IsString()
  @IsNotEmpty({ message: '用户名不能为空' })
  @Length(3, 30, { message: '用户名最少为3位' })
  @Matches(/^[a-zA-Z0-9#$%_-]+$/, {
    message: '用户名只能是字母、数字或者 #、$、%、_、- 这些字符',
  })
  username: string;

  @IsString()
  @IsNotEmpty({ message: '密码不能为空' })
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z0-9]{6,}$/, {
    message:
      '密码必须至少6位，且包含至少一个字母和一个数字，只能使用英文字母和数字',
  })
  password: string;

  @IsString()
  @IsNotEmpty({ message: '密码不能为空' })
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z0-9]{6,}$/, {
    message:
      '密码必须至少6位，且包含至少一个字母和一个数字，只能使用英文字母和数字',
  })
  confirmPassword: string;

  @IsString()
  @IsNotEmpty({ message: '邮箱不能为空' })
  @IsEmail({}, { message: '邮箱格式不正确' })
  email: string;
}
