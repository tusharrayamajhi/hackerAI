import { IsString } from "class-validator";

export class EsewaQueryDto {
    @IsString()
    status: string;
  
    @IsString()
    transaction_code: string;
  }