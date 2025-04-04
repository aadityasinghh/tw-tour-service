import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDate,
  IsDecimal,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';

export class AddressDto {
  @IsNotEmpty()
  @IsString()
  line1: string;

  @IsOptional()
  @IsString()
  line2?: string;

  @IsNotEmpty()
  @IsUUID()
  cityId: string;

  @IsNotEmpty()
  @IsString()
  state: string;

  @IsNotEmpty()
  @IsString()
  pincode: string;

  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;
}

export class CreateAddressDto {
  @IsString()
  @IsNotEmpty()
  line1: string;

  @IsString()
  @IsOptional()
  line2?: string;

  @IsUUID()
  @IsNotEmpty()
  cityId: string;

  @IsString()
  @IsNotEmpty()
  state: string;

  @IsString()
  @IsNotEmpty()
  pincode: string;

  @IsNumber()
  @IsOptional()
  latitude?: number;

  @IsNumber()
  @IsOptional()
  longitude?: number;
}

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
  @IsUUID()
  itemTypeId: string;

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
  @IsNumber()
  @IsPositive()
  maxWeight?: number;

  @IsOptional()
  @IsInt()
  @IsPositive()
  availableSpace?: number;

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
  itemTypeId: string;
  itemType?: {
    itemTypeId: string;
    name: string;
    code: string;
  };
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
export class CreateTourStopDto {
  @IsUUID()
  @IsNotEmpty()
  cityId: string;

  @IsInt()
  @Min(1)
  stopSequence: number;
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
