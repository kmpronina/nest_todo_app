// import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateTaskDto {
    @IsString()
    @MinLength(3)
    // @Transform(({ value }) => {})
    title: string;

    @IsString()
    @MinLength(3)
    userId: string;

    @IsOptional()
    @IsBoolean()
    completed?: boolean = false;

    @IsString()
    status?: string;
}
