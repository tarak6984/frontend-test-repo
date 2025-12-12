import { IsString, IsArray, IsOptional, IsNumber, Min, Max, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class ChatMessageDto {
    @IsString()
    role: 'user' | 'assistant' | 'system';

    @IsString()
    content: string;
}

export class DocumentContextDto {
    @IsString()
    id: string;

    @IsString()
    title: string;

    @IsString()
    type: string;

    @IsString()
    status: string;

    @IsOptional()
    @IsString()
    fundName?: string;

    @IsOptional()
    @IsString()
    fundCode?: string;
}

export class ChatCompletionDto {
    @IsString()
    model: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ChatMessageDto)
    messages: ChatMessageDto[];

    @IsOptional()
    @IsNumber()
    @Min(0)
    @Max(2)
    temperature?: number;

    @IsOptional()
    @IsNumber()
    @Min(1)
    max_tokens?: number;

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => DocumentContextDto)
    documentContext?: DocumentContextDto[];
}
