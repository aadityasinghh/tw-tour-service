import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Address } from '../tour/entities/address.entity';
import { SearchAddressDto, PaginatedResponseDto } from '../tour/dto/search.dto';

@Injectable()
export class AddressService {
  constructor(
    @InjectRepository(Address)
    private addressRepository: Repository<Address>,
  ) {}

  async getAddressesByUserId(
    userId: string,
    searchDto: SearchAddressDto,
  ): Promise<PaginatedResponseDto<Address>> {
    const { search, cityId, state, page = 1, limit = 10 } = searchDto;

    const queryBuilder = this.addressRepository.createQueryBuilder('address');

    // Apply base filter for user
    queryBuilder.where('address.userId = :userId', { userId });

    // Apply additional search filters
    if (search) {
      queryBuilder.andWhere(
        '(address.line1 ILIKE :search OR address.line2 ILIKE :search OR address.pincode ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (cityId) {
      queryBuilder.andWhere('address.cityId = :cityId', { cityId });
    }

    if (state) {
      queryBuilder.andWhere('address.state ILIKE :state', {
        state: `%${state}%`,
      });
    }

    // Join with city to get city details
    queryBuilder.leftJoinAndSelect('address.city', 'city');

    // Apply pagination
    queryBuilder.skip((page - 1) * limit).take(limit);
    queryBuilder.orderBy('address.createdAt', 'DESC');

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
