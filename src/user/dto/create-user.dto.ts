import {
  IsString,
  IsEmail,
  IsNotEmpty,
  MinLength,
  IsStrongPassword,
  Matches,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty({ message: '用户名不能为空' })
  username: string;

  @IsString({ message: '密码必须是字符串' })
  @IsNotEmpty({ message: '密码不能为空' })
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z0-9]{6,}$/, {
    message:
      '密码必须至少6位，且包含至少一个字母和一个数字，只能使用英文字母和数字',
  })
  password: string;

  @IsEmail({}, { message: '邮箱格式不正确' })
  @IsNotEmpty({ message: '邮箱不能为空' })
  email: string;
}
