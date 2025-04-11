import {
  Injectable,
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Repository,
  FindOptionsOrder,
  FindOptionsWhere,
  Between,
  DeepPartial,
  DataSource,
  In,
} from 'typeorm';
import { Tour } from './entities/tour.entity';
import { Address } from './entities/address.entity';
import { TourStop } from './entities/tour-stop.entity';
import { ItemType } from './entities/item-type.entity';
import {
  CreateAddressDto,
  CreateTourDto,
  CreateTourStopDto,
  SearchTourDto,
  PaginatedToursResponseDto,
  TourResponseDto,
  UpdateTourDto,
} from './dto/tour.dto';
import { ApiResponse } from 'src/utils/interfaces';
import { ResponseMessages } from 'src/utils/messages';
// import { ApiResponse, ResponseMessages } from './response.utils';

@Injectable()
export class ToursService {
  constructor(
    @InjectRepository(Tour)
    private toursRepository: Repository<Tour>,
    @InjectRepository(Address)
    private addressRepository: Repository<Address>,
    @InjectRepository(TourStop)
    private tourStopRepository: Repository<TourStop>,
    @InjectRepository(ItemType)
    private itemTypeRepository: Repository<ItemType>,
    private dataSource: DataSource,
  ) {}

  async createTour(
    userId: string,
    createTourDto: CreateTourDto,
    tourStops: CreateTourStopDto[],
  ): Promise<ApiResponse<Tour>> {
    // Check if user already has a tour from a different city on the same day
    const journeyDate = new Date(createTourDto.journeyDate);
    journeyDate.setHours(0, 0, 0, 0);

    const endDate = new Date(journeyDate);
    endDate.setHours(23, 59, 59, 999);

    const existingTour = await this.toursRepository.findOne({
      where: {
        userId,
        journeyDate: Between(journeyDate, endDate),
      },
    });

    if (
      existingTour &&
      existingTour.sourceCityId !== createTourDto.sourceCityId
    ) {
      throw new BadRequestException(ResponseMessages.DUPLICATE_TOUR.message);
    }

    // Start a transaction
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // First create and save the addresses
      const pickupAddress = await queryRunner.manager.save(Address, {
        ...createTourDto.pickupAddress,
        userId,
      });

      const dropAddress = await queryRunner.manager.save(Address, {
        ...createTourDto.dropAddress,
        userId,
      });

      // Verify that all item types exist
      const itemTypes = await this.itemTypeRepository.find({
        where: { itemTypeId: In(createTourDto.itemTypeIds) },
      });

      if (itemTypes.length !== createTourDto.itemTypeIds.length) {
        throw new BadRequestException('One or more item types do not exist');
      }

      // Now create the tour with the address IDs
      const tour = this.toursRepository.create({
        ...createTourDto,
        pickupAddressId: pickupAddress.id,
        dropAddressId: dropAddress.id,
        userId,
      });

      const savedTour = await queryRunner.manager.save(tour);

      // Associate item types with the tour
      await queryRunner.manager
        .createQueryBuilder()
        .insert()
        .into('tour_item_types')
        .values(
          createTourDto.itemTypeIds.map((itemTypeId) => ({
            tour_id: savedTour.tourId,
            item_type_id: itemTypeId,
          })),
        )
        .execute();

      // Update the addresses with the tour ID
      await Promise.all([
        queryRunner.manager.update(Address, pickupAddress.id, {
          tourId: savedTour.tourId,
        }),
        queryRunner.manager.update(Address, dropAddress.id, {
          tourId: savedTour.tourId,
        }),
      ]);

      // Create tour stops
      if (tourStops && tourStops.length > 0) {
        const stops = tourStops.map((stop) =>
          this.tourStopRepository.create({
            ...stop,
            tourId: savedTour.tourId,
          }),
        );
        await queryRunner.manager.save(TourStop, stops);
      }

      // Commit the transaction
      await queryRunner.commitTransaction();

      return {
        data: savedTour,
        code: ResponseMessages.TOUR_CREATED.code,
        message: ResponseMessages.TOUR_CREATED.message,
      };
    } catch (error) {
      // Rollback the transaction in case of error
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      // Release the query runner
      await queryRunner.release();
    }
  }

  async createAddress(
    userId: string,
    createAddressDto: CreateAddressDto,
    tourId?: string,
  ): Promise<ApiResponse<Address>> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const newAddress: DeepPartial<Address> = {
        ...createAddressDto,
        userId,
        tourId: tourId,
      };
      const address = this.addressRepository.create(newAddress);
      const savedAddress = await queryRunner.manager.save(address);

      await queryRunner.commitTransaction();

      return {
        data: savedAddress,
        code: ResponseMessages.ADDRESS_CREATED.code,
        message: ResponseMessages.ADDRESS_CREATED.message,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findTourById(tourId: string): Promise<ApiResponse<Tour>> {
    const tour = await this.toursRepository.findOne({
      where: { tourId },
      relations: ['itemTypes'],
    });

    if (!tour) {
      throw new NotFoundException(ResponseMessages.NOT_FOUND.message);
    }

    return {
      data: tour,
      code: ResponseMessages.TOUR_FOUND.code,
      message: ResponseMessages.TOUR_FOUND.message,
    };
  }

  async findToursByUserId(userId: string): Promise<ApiResponse<Tour[]>> {
    const tours = await this.toursRepository.find({
      where: { userId },
      relations: ['itemTypes'],
    });

    return {
      data: tours,
      code: ResponseMessages.TOURS_FOUND.code,
      message: ResponseMessages.TOURS_FOUND.message,
    };
  }

  async searchTours(
    searchTourDto: SearchTourDto,
  ): Promise<ApiResponse<PaginatedToursResponseDto>> {
    const {
      sourceCityId,
      destinationCityId,
      journeyDate,
      travelModeId,
      itemTypeId,
      sortBy,
      sortOrder,
      page = 1,
      limit = 10,
      minWeight,
      maxWeight,
    } = searchTourDto;

    // Build query with QueryBuilder for more complex filtering
    const query = this.toursRepository
      .createQueryBuilder('tour')
      .leftJoinAndSelect('tour.itemTypes', 'itemType');

    // Apply filters
    if (sourceCityId) {
      query.andWhere('tour.sourceCityId = :sourceCityId', { sourceCityId });
    }

    if (destinationCityId) {
      query.andWhere('tour.destinationCityId = :destinationCityId', {
        destinationCityId,
      });
    }

    if (travelModeId) {
      query.andWhere('tour.travelModeId = :travelModeId', { travelModeId });
    }

    if (itemTypeId) {
      query.andWhere('itemType.itemTypeId = :itemTypeId', { itemTypeId });
    }

    if (journeyDate) {
      const startDate = new Date(journeyDate);
      startDate.setHours(0, 0, 0, 0);

      const endDate = new Date(journeyDate);
      endDate.setHours(23, 59, 59, 999);

      query.andWhere('tour.journeyDate BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    }

    if (minWeight) {
      query.andWhere('tour.maxWeight >= :minWeight', { minWeight });
    }

    if (maxWeight) {
      query.andWhere('tour.maxWeight <= :maxWeight', { maxWeight });
    }

    // Apply sorting
    if (sortBy) {
      query.orderBy(`tour.${sortBy}`, sortOrder);
    } else {
      query.orderBy('tour.departureTime', 'ASC');
    }

    // Apply pagination
    query.skip((page - 1) * limit).take(limit);

    // Execute query
    const [items, totalItems] = await query.getManyAndCount();

    // Build pagination metadata
    const totalPages = Math.ceil(totalItems / limit);

    const paginatedResponse: PaginatedToursResponseDto = {
      items: items as unknown as TourResponseDto[],
      meta: {
        totalItems,
        itemCount: items.length,
        itemsPerPage: limit,
        totalPages,
        currentPage: page,
      },
    };

    return {
      data: paginatedResponse,
      code: ResponseMessages.TOURS_FOUND.code,
      message: ResponseMessages.TOURS_FOUND.message,
    };
  }

  async updateTour(
    tourId: string,
    userId: string,
    updateTourDto: UpdateTourDto,
  ): Promise<ApiResponse<Tour>> {
    // Start transaction
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      // First check if the tour exists and belongs to the user
      const tour = await queryRunner.manager.findOne(Tour, {
        where: { tourId },
      });
      if (!tour) {
        throw new NotFoundException(ResponseMessages.NOT_FOUND.message);
      }
      if (tour?.userId !== userId) {
        throw new UnauthorizedException(
          ResponseMessages.UNAUTHORIZED_TO_UPDATE,
        );
      }

      // Create a copy of updateTourDto without the relations that need special handling
      const {
        pickupAddress,
        dropAddress,
        tourStops,
        itemTypeIds,
        ...tourUpdateData
      } = updateTourDto;

      // Update the tour basic data
      await queryRunner.manager.update(Tour, tourId, tourUpdateData);

      // If itemTypeIds are updated, handle them
      if (itemTypeIds && itemTypeIds.length > 0) {
        // Verify that all item types exist
        const itemTypes = await this.itemTypeRepository.find({
          where: { itemTypeId: In(itemTypeIds) },
        });

        if (itemTypes.length !== itemTypeIds.length) {
          throw new BadRequestException('One or more item types do not exist');
        }

        // Remove existing item type associations
        await queryRunner.manager
          .createQueryBuilder()
          .delete()
          .from('tour_item_types')
          .where('tour_id = :tourId', { tourId })
          .execute();

        // Add new item type associations
        await queryRunner.manager
          .createQueryBuilder()
          .insert()
          .into('tour_item_types')
          .values(
            itemTypeIds.map((itemTypeId) => ({
              tour_id: tourId,
              item_type_id: itemTypeId,
            })),
          )
          .execute();
      }

      // If pickup address is updated, handle it
      if (pickupAddress) {
        await queryRunner.manager.update(
          Address,
          tour.pickupAddressId,
          pickupAddress,
        );
      }

      // If drop address is updated, handle it
      if (dropAddress) {
        await queryRunner.manager.update(
          Address,
          tour.dropAddressId,
          dropAddress,
        );
      }

      // If tour stops are updated, handle them
      if (tourStops && tourStops.length > 0) {
        // Delete existing stops
        await queryRunner.manager.delete(TourStop, { tourId });

        // Create new stops
        const stops = tourStops.map((stop) =>
          this.tourStopRepository.create({
            ...stop,
            tourId,
          }),
        );
        await queryRunner.manager.save(TourStop, stops);
      }

      // Commit transaction
      await queryRunner.commitTransaction();

      // Return the updated tour with its relations
      const updatedTour = await this.toursRepository.findOne({
        where: { tourId },
        relations: ['itemTypes'],
      });

      if (!updatedTour) {
        throw new NotFoundException('Tour not found after update');
      }
      return {
        data: updatedTour,
        code: ResponseMessages.TOUR_UPDATED.code,
        message: ResponseMessages.TOUR_UPDATED.message,
      };
    } catch (error) {
      // Rollback transaction in case of error
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      // Release query runner
      await queryRunner.release();
    }
  }

  async deleteTour(tourId: string, userId: string): Promise<ApiResponse<null>> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // First check if the tour exists and belongs to the user
      const tour = await queryRunner.manager.findOne(Tour, {
        where: { tourId },
      });

      if (!tour) {
        throw new NotFoundException(ResponseMessages.NOT_FOUND.message);
      }
      if (tour?.userId !== userId) {
        throw new UnauthorizedException('not authorised to delete this tour');
      }

      // Delete item type associations
      await queryRunner.manager
        .createQueryBuilder()
        .delete()
        .from('tour_item_types')
        .where('tour_id = :tourId', { tourId })
        .execute();

      // Delete related tour stops
      await queryRunner.manager.delete(TourStop, { tourId });

      // Delete related addresses
      await queryRunner.manager.delete(Address, { tourId });

      // Delete the tour
      await queryRunner.manager.delete(Tour, tourId);

      // Commit transaction
      await queryRunner.commitTransaction();

      return {
        data: null,
        code: ResponseMessages.TOUR_DELETED.code,
        message: ResponseMessages.TOUR_DELETED.message,
      };
    } catch (error) {
      // Rollback transaction in case of error
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      // Release query runner
      await queryRunner.release();
    }
  }

  async getTourWithDetails(tourId: string): Promise<ApiResponse<any>> {
    // Create a query to get the tour with all related data
    const tour = await this.toursRepository.findOne({
      where: { tourId },
      relations: ['itemTypes'],
    });

    if (!tour) {
      throw new NotFoundException(ResponseMessages.NOT_FOUND.message);
    }

    // Get pickup and drop addresses
    const [pickupAddress, dropAddress] = await Promise.all([
      this.addressRepository.findOne({ where: { id: tour.pickupAddressId } }),
      this.addressRepository.findOne({ where: { id: tour.dropAddressId } }),
    ]);

    // Get tour stops
    const stops = await this.tourStopRepository.find({
      where: { tourId },
      order: { stopSequence: 'ASC' },
    });

    const tourDetails = {
      ...tour,
      pickupAddress,
      dropAddress,
      stops,
    };

    return {
      data: tourDetails,
      code: ResponseMessages.TOUR_FOUND.code,
      message: ResponseMessages.TOUR_FOUND.message,
    };
  }
}
