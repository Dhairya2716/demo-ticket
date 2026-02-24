import { IsNotEmpty, MinLength } from 'class-validator';

export class CreateCommentDto {
    @IsNotEmpty()
    @MinLength(3)
    comment: string;
}
