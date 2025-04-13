import { IsArray, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsUrl } from 'class-validator';
import { Size } from '../entities/Product.entities';
import { PartialType } from '@nestjs/mapped-types';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  productName: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber()
  @IsNotEmpty()
  price: string;

  @IsString()
  stock: number;

  @IsUrl()
  imageUrl: string;

  @IsOptional()
  @IsUrl()
  videoLink?: string;

  @IsArray()
  @IsEnum(Size, { each: true })
  size: Size[];

  @IsString()
  color: string;
}


export class UpdateProductDto extends PartialType(CreateProductDto) {}