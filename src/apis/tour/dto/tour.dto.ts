import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDate,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
  ArrayNotEmpty,
  isNotEmpty,
} from 'class-validator';
import { TourStatus } from '../entities/tour.entity';
import { AddressDto } from 'src/apis/address/dto/address.dto';


export class TourStopDto {
  @IsNotEmpty()
  @IsUUID()
  cityId: string;

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  stopSequence: number;
}

export class CreateTourDto {
  @IsNotEmpty()
  @IsUUID()
  sourceCityId: string;

  @IsNotEmpty()
  @IsUUID()
  destinationCityId: string;

  @IsNotEmpty()
  @IsUUID()
  travelModeId: string;

  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  departureTime: Date;

  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  arrivalTime: Date;

  @IsNotEmpty()
  @IsArray()
  @ArrayNotEmpty()
  @IsUUID('4', { each: true })
  itemTypeIds: string[]; // Changed to array of UUIDs

  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  maxWeight: number;

  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  availableSpace: number;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => AddressDto)
  pickupAddress: AddressDto;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => AddressDto)
  dropAddress: AddressDto;

  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  maxItems: number;

  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  pricePerKg: number;

  @IsNotEmpty()
  @IsString()
  pnrNumber: string;

  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  journeyDate: Date;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TourStopDto)
  tourStops?: TourStopDto[];
}

export class UpdateTourDto {
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  departureTime?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  arrivalTime?: Date;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  itemTypeIds?: string[]; // Changed to array of UUIDs

  @IsOptional()
  @IsNumber()
  @IsPositive()
  maxWeight?: number;

  @IsOptional()
  @IsInt()
  @IsPositive()
  availableSpace?: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => AddressDto)
  pickupAddress?: AddressDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => AddressDto)
  dropAddress?: AddressDto;

  @IsOptional()
  @IsInt()
  @IsPositive()
  maxItems?: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  pricePerKg?: number;

  @IsOptional()
  @IsBoolean()
  pnrVerified?: boolean;

  @IsOptional()
  @IsEnum(TourStatus)
  status?: TourStatus;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TourStopDto)
  tourStops?: TourStopDto[];
}

export class SearchTourDto {
  @IsNotEmpty()
  @IsUUID()
  sourceCityId: string;

  @IsNotEmpty()
  @IsUUID()
  destinationCityId: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  journeyDate?: Date;

  @IsOptional()
  @IsUUID()
  itemTypeId?: string;

  @IsOptional()
  @IsUUID()
  travelModeId?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @IsOptional()
  @IsString()
  sortBy?: string = 'journeyDate';

  @IsOptional()
  @IsString()
  sortOrder?: 'ASC' | 'DESC' = 'ASC';

  @IsOptional()
  @IsNumber()
  @IsPositive()
  minWeight?: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  maxWeight?: number;
}

export class TourResponseDto {
  tourId: string;
  userId: string;
  sourceCityId: string;
  sourceCity?: {
    cityId: string;
    name: string;
    code: string;
  };
  destinationCityId: string;
  destinationCity?: {
    cityId: string;
    name: string;
    code: string;
  };
  travelModeId: string;
  travelMode?: {
    id: string;
    mode: string;
    code: string;
  };
  departureTime: Date;
  arrivalTime: Date;
  itemTypeIds: string[]; // Changed to array
  itemTypes?: Array<{
    // Changed to array of item types
    itemTypeId: string;
    name: string;
    code: string;
  }>;
  maxWeight: number;
  availableSpace: number;
  pickupAddressId: string;
  pickupAddress?: any;
  dropAddressId: string;
  dropAddress?: any;
  maxItems: number;
  pricePerKg: number;
  pnrNumber: string;
  pnrVerified: boolean;
  journeyDate: Date;
  tourStops?: any[];
  createdAt: Date;
  updatedAt: Date;
}

export class PaginatedToursResponseDto {
  items: TourResponseDto[];
  meta: {
    totalItems: number;
    itemCount: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
  };
}

export class CreateTourStopDto {
  @IsUUID()
  @IsNotEmpty()
  cityId: string;

  @IsInt()
  @Min(1)
  stopSequence: number;
}

export class UpdateTourAvailableSpaceDto {
  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  availableSpace: number;
}
