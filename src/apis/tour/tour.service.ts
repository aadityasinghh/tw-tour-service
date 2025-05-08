import {
    Injectable,
  
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
    Repository,
  
    Between,
    DeepPartial,
    DataSource,
    In,
  
} from 'typeorm';
import { Tour, TourStatus } from './entities/tour.entity';
import { Address } from './entities/address.entity';
import { TourStop } from './entities/tour-stop.entity';
import { ItemType } from './entities/item-type.entity';
import {
    CreateTourDto,
    CreateTourStopDto,
    SearchTourDto,
    PaginatedToursResponseDto,
    TourResponseDto,
    UpdateTourDto,
    UpdateTourAvailableSpaceDto,
} from './dto/tour.dto';
import {
    ResponseMessages,
    ResponseCodes,
} from 'src/core/common/constants/response-messages.constant';
import { NotificationService } from '../notification/notification.service';
import { ResponseService } from 'src/core/common/services/response.service';
import { CreateAddressDto } from '../address/dto/address.dto';

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
        private readonly notificationService: NotificationService,
        private readonly responseService: ResponseService,
    ) {}

    async createTour(
        userId: string,
        email: string,
        name: string,
        createTourDto: CreateTourDto,
        tourStops: CreateTourStopDto[],
    ): Promise<Tour> {
        // Check if user already has a tour on the same day, regardless of city
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

        if (existingTour) {
            return this.responseService.badRequest(
                ResponseMessages.DUPLICATE_TOUR.message,
                ResponseCodes.DUPLICATE_TOUR,
            );
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
                await queryRunner.rollbackTransaction();
                return this.responseService.badRequest(
                    ResponseMessages.ITEM_TYPE_DOES_NOT_EXIST,
                );
            }

            // Now create the tour with the address IDs
            const tour = this.toursRepository.create({
                ...createTourDto,
                pickupAddressId: pickupAddress.id,
                dropAddressId: dropAddress.id,
                userId,
                status: TourStatus.PENDING,
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
            // await this.notificationService.sendEmailVerificationSuccess(email, name);
            return savedTour;
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
    ): Promise<Address> {
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

            return savedAddress;
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    async findTourById(tourId: string): Promise<Tour> {
        const tour = await this.toursRepository.findOne({
            where: { tourId },
            relations: ['itemTypes'],
        });

        if (!tour) {
            return this.responseService.notFound('Tour', `with ID ${tourId}`);
        }

        return tour;
    }

    async findToursByUserId(userId: string): Promise<Tour[]> {
        const tours = await this.toursRepository.find({
            where: { userId },
            relations: ['itemTypes'],
        });

        return tours;
    }

    async searchTours(
        searchTourDto: SearchTourDto,
    ): Promise<PaginatedToursResponseDto> {
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
            query.andWhere('tour.sourceCityId = :sourceCityId', {
                sourceCityId,
            });
        }

        if (destinationCityId) {
            query.andWhere('tour.destinationCityId = :destinationCityId', {
                destinationCityId,
            });
        }

        if (travelModeId) {
            query.andWhere('tour.travelModeId = :travelModeId', {
                travelModeId,
            });
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

        // Enhance the results with detailed information
        const enhancedItems = await Promise.all(
            items.map(async (tour) => {
                // Get complete source and destination city objects
                const [sourceCity, destinationCity] = await Promise.all([
                    this.dataSource.query(
                        'SELECT * FROM cities WHERE "cityId" = $1',
                        [tour.sourceCityId],
                    ),
                    this.dataSource.query(
                        'SELECT * FROM cities WHERE "cityId" = $1',
                        [tour.destinationCityId],
                    ),
                ]);

                // Get tour stops
                const stops = await this.tourStopRepository.find({
                    where: { tourId: tour.tourId },
                    order: { stopSequence: 'ASC' },
                });

                // Get intermediate stop cities (complete objects)
                const intermediateStopCities = await Promise.all(
                    stops.map((stop) =>
                        this.dataSource.query(
                            'SELECT * FROM cities WHERE "cityId" = $1',
                            [stop.cityId],
                        ),
                    ),
                );

                // Create enhanced stops with city information
                const enhancedStops = stops.map((stop, index) => ({
                    ...stop,
                    city: intermediateStopCities[index]?.[0] || null,
                }));

                // Get pickup and drop addresses
                const [pickupAddress, dropAddress] = await Promise.all([
                    this.addressRepository.findOne({
                        where: { id: tour.pickupAddressId },
                    }),
                    this.addressRepository.findOne({
                        where: { id: tour.dropAddressId },
                    }),
                ]);

                // Create the cleaned response object by removing redundant fields
                return {
                    tourId: tour.tourId,
                    userId: tour.userId,
                    departureTime: tour.departureTime,
                    arrivalTime: tour.arrivalTime,
                    itemTypes: tour.itemTypes,
                    maxWeight: tour.maxWeight,
                    availableSpace: tour.availableSpace,
                    maxItems: tour.maxItems,
                    pricePerKg: tour.pricePerKg,
                    pnrNumber: tour.pnrNumber,
                    pnrVerified: tour.pnrVerified,
                    journeyDate: tour.journeyDate,
                    status: tour.status,
                    createdAt: tour.createdAt,
                    updatedAt: tour.updatedAt,
                    sourceCity: sourceCity?.[0] || null,
                    destinationCity: destinationCity?.[0] || null,
                    pickupAddress,
                    dropAddress,
                    stops: enhancedStops,
                    availableSlots: tour.availableSpace,
                };
            }),
        );

        // Build pagination metadata
        const totalPages = Math.ceil(totalItems / limit);

        return {
            items: enhancedItems as unknown as TourResponseDto[],
            meta: {
                totalItems,
                itemCount: items.length,
                itemsPerPage: limit,
                totalPages,
                currentPage: page,
            },
        };
    }

    async updateTour(
        tourId: string,
        userId: string,
        updateTourDto: UpdateTourDto,
    ): Promise<Tour> {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            // First, find the tour to update
            const tour = await this.toursRepository.findOne({
                where: { tourId },
                relations: ['itemTypes'],
            });

            if (!tour) {
                return this.responseService.notFound(
                    'Tour',
                    `with ID ${tourId}`,
                );
            }

            // Check if user is authorized to update
            if (tour.userId !== userId) {
                return this.responseService.unauthorized(
                    ResponseMessages.USER_NOT_AUTHORIZED,
                );
            }

            // Check if tour has already started
            const now = new Date();
            if (now >= tour.departureTime) {
                await queryRunner.rollbackTransaction();
                return this.responseService.badRequest(
                    ResponseMessages.TOUR_ALREADY_STARTED,
                );
            }

            // Verify that all item types exist if provided
            if (
                updateTourDto.itemTypeIds &&
                updateTourDto.itemTypeIds.length > 0
            ) {
                const itemTypes = await this.itemTypeRepository.find({
                    where: { itemTypeId: In(updateTourDto.itemTypeIds) },
                });

                if (itemTypes.length !== updateTourDto.itemTypeIds.length) {
                    await queryRunner.rollbackTransaction();
                    return this.responseService.badRequest(
                        ResponseMessages.ITEM_TYPE_DOES_NOT_EXIST,
                    );
                }

                // Update item types (clear existing and add new ones)
                await queryRunner.manager
                    .createQueryBuilder()
                    .delete()
                    .from('tour_item_types')
                    .where('tour_id = :tourId', { tourId })
                    .execute();

                await queryRunner.manager
                    .createQueryBuilder()
                    .insert()
                    .into('tour_item_types')
                    .values(
                        updateTourDto.itemTypeIds.map((itemTypeId) => ({
                            tour_id: tourId,
                            item_type_id: itemTypeId,
                        })),
                    )
                    .execute();

                // Remove itemTypeIds from DTO as we've handled it separately
                delete updateTourDto.itemTypeIds;
            }

            // Update pickup address if provided
            // if (updateTourDto.pickupAddress) {
            //   await queryRunner.manager.save(Address, {
            //     ...updateTourDto.pickupAddress,
            //     id: tour.pickupAddressId,
            //     userId,
            //     tourId,
            //   });
            //   delete updateTourDto.pickupAddress;
            // }

            // // Update drop address if provided
            // if (updateTourDto.dropAddress) {
            //   await queryRunner.manager.save(Address, {
            //     ...updateTourDto.dropAddress,
            //     id: tour.dropAddressId,
            //     userId,
            //     tourId,
            //   });
            //   delete updateTourDto.dropAddress;
            // }

            // Update tour itself
            queryRunner.manager.merge(Tour, tour, updateTourDto);
            await queryRunner.manager.save(tour);

            // Fetch the completely updated tour with all relations
            const finalTour = await queryRunner.manager.findOne(Tour, {
                where: { tourId },
                relations: ['itemTypes', 'pickupAddress', 'dropAddress'],
            });

            if (!finalTour) {
                await queryRunner.rollbackTransaction();
                return this.responseService.notFound(
                    'Tour',
                    'not found after update',
                );
            }

            await queryRunner.commitTransaction();
            return finalTour;
        } catch (error) {
            // Rollback transaction in case of error
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            // Release query runner
            await queryRunner.release();
        }
    }

    async updateTourAvailableSpace(
        tourId: string,
        userId: string,
        updateTourAvailableSpaceDto: UpdateTourAvailableSpaceDto,
    ): Promise<Tour> {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            // Find the tour to update
            const tour = await this.toursRepository.findOne({
                where: { tourId },
            });

            if (!tour) {
                await queryRunner.rollbackTransaction();
                return this.responseService.notFound(
                    'Tour',
                    `with ID ${tourId}`,
                );
            }

            // Check if user is authorized to update
            if (tour.userId !== userId) {
                await queryRunner.rollbackTransaction();
                return this.responseService.unauthorized(
                    ResponseMessages.USER_NOT_AUTHORIZED,
                );
            }

            // Update available space
            tour.availableSpace = updateTourAvailableSpaceDto.availableSpace;
            await queryRunner.manager.save(tour);

            await queryRunner.commitTransaction();
            return tour;
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    async deleteTour(tourId: string, userId: string): Promise<null> {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            // First check if the tour exists and belongs to the user
            const tour = await queryRunner.manager.findOne(Tour, {
                where: { tourId },
            });

            if (!tour) {
                await queryRunner.rollbackTransaction();
                return this.responseService.notFound(
                    'Tour',
                    `with ID ${tourId}`,
                );
            }

            if (tour?.userId !== userId) {
                await queryRunner.rollbackTransaction();
                return this.responseService.unauthorized(
                    ResponseMessages.NOT_AUTHORIZED_TO_DELETE,
                );
            }

            // Check if tour has already started
            const now = new Date();
            if (now >= tour.departureTime) {
                await queryRunner.rollbackTransaction();
                return this.responseService.badRequest(
                    ResponseMessages.TOUR_ALREADY_STARTED,
                );
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

            return null;
        } catch (error) {
            // Rollback transaction in case of error
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            // Release query runner
            await queryRunner.release();
        }
    }

    async getTourWithDetails(tourId: string): Promise<any> {
        // Create a query to get the tour with all related data
        const tour = await this.toursRepository.findOne({
            where: { tourId },
            relations: ['itemTypes'],
        });

        if (!tour) {
            return this.responseService.notFound('Tour', `with ID ${tourId}`);
        }

        // Get pickup and drop addresses
        const [pickupAddress, dropAddress] = await Promise.all([
            this.addressRepository.findOne({
                where: { id: tour.pickupAddressId },
            }),
            this.addressRepository.findOne({
                where: { id: tour.dropAddressId },
            }),
        ]);

        // Get tour stops
        const stops = await this.tourStopRepository.find({
            where: { tourId },
            order: { stopSequence: 'ASC' },
        });

        // Get complete city objects instead of just names
        const [sourceCity, destinationCity] = await Promise.all([
            this.dataSource.query('SELECT * FROM cities WHERE "cityId" = $1', [
                tour.sourceCityId,
            ]),
            this.dataSource.query('SELECT * FROM cities WHERE "cityId" = $1', [
                tour.destinationCityId,
            ]),
        ]);

        // Get intermediate stop cities (complete objects)
        const intermediateStopCities = await Promise.all(
            stops.map((stop) =>
                this.dataSource.query(
                    'SELECT * FROM cities WHERE "cityId" = $1',
                    [stop.cityId],
                ),
            ),
        );

        // Create enhanced stops with city information
        const enhancedStops = stops.map((stop, index) => ({
            ...stop,
            city: intermediateStopCities[index]?.[0] || null,
        }));

        // Create the cleaned response object by removing redundant fields
        const cleanedResponse = {
            tourId: tour.tourId,
            userId: tour.userId,
            departureTime: tour.departureTime,
            arrivalTime: tour.arrivalTime,
            itemTypes: tour.itemTypes,
            maxWeight: tour.maxWeight,
            availableSpace: tour.availableSpace,
            maxItems: tour.maxItems,
            pricePerKg: tour.pricePerKg,
            pnrNumber: tour.pnrNumber,
            pnrVerified: tour.pnrVerified,
            journeyDate: tour.journeyDate,
            status: tour.status,
            createdAt: tour.createdAt,
            updatedAt: tour.updatedAt,
            sourceCity: sourceCity?.[0] || null,
            destinationCity: destinationCity?.[0] || null,
            pickupAddress,
            dropAddress,
            stops: enhancedStops,
            availableSlots: tour.availableSpace,
        };

        return cleanedResponse;
    }
}
