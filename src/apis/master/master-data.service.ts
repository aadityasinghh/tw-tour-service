import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { City } from '../tour/entities/city.entity';
import { ItemType } from '../tour/entities/item-type.entity';
import { TravelMode } from '../tour/entities/travel-mode.entity';
import {
    SearchCityDto,
    SearchItemTypeDto,
    SearchTravelModeDto,
    PaginatedResponseDto,
} from '../tour/dto/search.dto';

@Injectable()
export class MasterDataService {
    constructor(
        @InjectRepository(City)
        private cityRepository: Repository<City>,
        @InjectRepository(ItemType)
        private itemTypeRepository: Repository<ItemType>,
        @InjectRepository(TravelMode)
        private travelModeRepository: Repository<TravelMode>,
    ) {}

    async getCities(
        searchCityDto: SearchCityDto,
    ): Promise<PaginatedResponseDto<City>> {
        const { search, state, page = 1, limit = 10 } = searchCityDto;

        const queryBuilder = this.cityRepository.createQueryBuilder('city');

        // Apply search filters
        if (search) {
            queryBuilder.where(
                '(city.name ILIKE :search OR city.code ILIKE :search)',
                {
                    search: `%${search}%`,
                },
            );
        }

        if (state) {
            queryBuilder.andWhere('city.state ILIKE :state', {
                state: `%${state}%`,
            });
        }

        // Apply pagination
        queryBuilder.skip((page - 1) * limit).take(limit);
        queryBuilder.orderBy('city.name', 'ASC');

        // Execute query
        const [items, totalItems] = await queryBuilder.getManyAndCount();

        // Calculate pagination metadata
        const totalPages = Math.ceil(totalItems / limit);

        return {
            items,
            meta: {
                totalItems,
                itemCount: items.length,
                itemsPerPage: limit,
                totalPages,
                currentPage: page,
            },
        };
    }

    async getItemTypes(
        searchDto: SearchItemTypeDto,
    ): Promise<PaginatedResponseDto<ItemType>> {
        const { search, page = 1, limit = 10 } = searchDto;

        const queryBuilder =
            this.itemTypeRepository.createQueryBuilder('itemType');

        // Apply search filter
        if (search) {
            queryBuilder.where(
                '(itemType.name ILIKE :search OR itemType.code ILIKE :search)',
                {
                    search: `%${search}%`,
                },
            );
        }

        // Apply pagination
        queryBuilder.skip((page - 1) * limit).take(limit);
        queryBuilder.orderBy('itemType.name', 'ASC');

        // Execute query
        const [items, totalItems] = await queryBuilder.getManyAndCount();

        // Calculate pagination metadata
        const totalPages = Math.ceil(totalItems / limit);

        return {
            items,
            meta: {
                totalItems,
                itemCount: items.length,
                itemsPerPage: limit,
                totalPages,
                currentPage: page,
            },
        };
    }

    async getTravelModes(
        searchDto: SearchTravelModeDto,
    ): Promise<PaginatedResponseDto<TravelMode>> {
        const { search, page = 1, limit = 10 } = searchDto;

        const queryBuilder =
            this.travelModeRepository.createQueryBuilder('travelMode');

        // Apply search filter
        if (search) {
            queryBuilder.where(
                '(travelMode.mode ILIKE :search OR travelMode.code ILIKE :search)',
                {
                    search: `%${search}%`,
                },
            );
        }

        // Apply pagination
        queryBuilder.skip((page - 1) * limit).take(limit);
        queryBuilder.orderBy('travelMode.mode', 'ASC');

        // Execute query
        const [items, totalItems] = await queryBuilder.getManyAndCount();

        // Calculate pagination metadata
        const totalPages = Math.ceil(totalItems / limit);

        return {
            items,
            meta: {
                totalItems,
                itemCount: items.length,
                itemsPerPage: limit,
                totalPages,
                currentPage: page,
            },
        };
    }
}
