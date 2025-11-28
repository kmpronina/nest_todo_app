import { IsNumber, IsString, IsEmail, MinLength } from 'class-validator';
import { IsAdult } from 'src/common/validators/is-adult.validator';
import { IsTitleUnique } from 'src/common/validators/is-title-unique.validator';
export class CreateUserDto {
    @IsString()
    @MinLength(2)
    @IsTitleUnique()
    name: string;

    @IsEmail()
    email: string;

    @IsNumber()
    @IsAdult(18, { message: 'User must be at least 18 years old' })
    age: number;
}
