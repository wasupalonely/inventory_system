import { PartialType } from "@nestjs/swagger";
import { IsEmail, IsString, Max, Min } from "class-validator";

export class CreateUserDto {
    @IsString()
    name: string;

    @IsEmail()
    email: string;

    @IsString()
    phoneNumber: string;

    @IsString()
    @Max(20)
    @Min(6)
    password: string;
}

export class UpdateUserDto extends PartialType(CreateUserDto) {}