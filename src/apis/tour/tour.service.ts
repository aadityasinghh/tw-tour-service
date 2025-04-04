// tours-service/src/tours/tours.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Repository,
  FindOptionsOrder,
  FindOptionsWhere,
  Between,
  DeepPartial,
} from 'typeorm';
import { Tour } from './entities/tour.entity';
import { Address } from './entities/address.entity';
import { TourStop } from './entities/tour-stop.entity';
import {
  CreateAddressDto,
  CreateTourDto,
  CreateTourStopDto,
  SearchTourDto,
} from './dto/tour.dto';
// import { CreateTourDto } from './dto/create-tour.dto';
// import { SearchTourDto } from './dto/search-tour.dto';
// import { CreateAddressDto } from './dto/create-address.dto';
// import { CreateTourStopDto } from './dto/create-tour-stop.dto';

@Injectable()
export class ToursService {
  constructor(
    @InjectRepository(Tour)
    private toursRepository: Repository<Tour>,
    @InjectRepository(Address)
    private addressRepository: Repository<Address>,
    @InjectRepository(TourStop)
    private tourStopRepository: Repository<TourStop>,
  ) {}

  // async createTour(
  //   userId: string,
  //   createTourDto: CreateTourDto,
  //   tourStops: CreateTourStopDto[],
  // ): Promise<Tour> {
  //   const tour = this.toursRepository.create({
  //     ...createTourDto,
  //     userId,
  //   });

  //   const savedTour = await this.toursRepository.save(tour);

  //   // Create tour stops
  //   if (tourStops && tourStops.length > 0) {
  //     const stops = tourStops.map((stop) =>
  //       this.tourStopRepository.create({
  //         ...stop,
  //         tourId: savedTour.tourId,
  //       }),
  //     );
  //     await this.tourStopRepository.save(stops);
  //   }

  //   return savedTour;
  // }
  async createTour(
    userId: string,
    createTourDto: CreateTourDto,
    tourStops: CreateTourStopDto[],
  ): Promise<Tour> {
    // First create and save the addresses
    const pickupAddress = await this.addressRepository.save({
      ...createTourDto.pickupAddress,
      userId,
    });

    const dropAddress = await this.addressRepository.save({
      ...createTourDto.dropAddress,
      userId,
    });

    // Now create the tour with the address IDs
    const tour = this.toursRepository.create({
      ...createTourDto,
      pickupAddressId: pickupAddress.id,
      dropAddressId: dropAddress.id,
      userId,
    });

    const savedTour = await this.toursRepository.save(tour);

    // Update the addresses with the tour ID
    await Promise.all([
      this.addressRepository.update(pickupAddress.id, {
        tourId: savedTour.tourId,
      }),
      this.addressRepository.update(dropAddress.id, {
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
      await this.tourStopRepository.save(stops);
    }

    return savedTour;
  }

  async createAddress(
    userId: string,
    tourId: string | null,
    createAddressDto: CreateAddressDto,
  ): Promise<Address> {
    const newAddress: DeepPartial<Address> = {
      userId: userId,
    };
    const address = await this.addressRepository.create(newAddress);

    return this.addressRepository.save(address);
  }

  async findTourById(tourId: string): Promise<Tour> {
    const tour = await this.toursRepository.findOne({ where: { tourId } });
    if (!tour) {
      throw new NotFoundException(`Tour with ID ${tourId} not found`);
    }
    return tour;
  }

  async findToursByUserId(userId: string): Promise<Tour[]> {
    return this.toursRepository.find({ where: { userId } });
  }

  async searchTours(searchTourDto: SearchTourDto): Promise<Tour[]> {
    const {
      sourceCityId,
      destinationCityId,
      journeyDate,
      travelModeId,
      itemTypeId,
      sortBy,
      sortOrder,
    } = searchTourDto;

    // Build where conditions
    const where: FindOptionsWhere<Tour> = {};

    if (sourceCityId) {
      where.sourceCityId = sourceCityId;
    }

    if (destinationCityId) {
      where.destinationCityId = destinationCityId;
    }

    if (travelModeId) {
      where.travelModeId = travelModeId;
    }

    if (itemTypeId) {
      where.itemTypeId = itemTypeId;
    }

    if (journeyDate) {
      const startDate = new Date(journeyDate);
      startDate.setHours(0, 0, 0, 0);

      const endDate = new Date(journeyDate);
      endDate.setHours(23, 59, 59, 999);

      where.journeyDate = Between(startDate, endDate);
    }

    // Build order options
    const order: FindOptionsOrder<Tour> = {};
    if (sortBy) {
      order[sortBy] = sortOrder;
    } else {
      // Default sorting
      order.departureTime = 'ASC';
    }

    return this.toursRepository.find({
      where,
      order,
    });
  }

  async updateTour(
    tourId: string,
    userId: string,
    updateTourDto: Partial<CreateTourDto>,
  ): Promise<Tour | null> {
    // First check if the tour exists and belongs to the user
    const tour = await this.toursRepository.findOne({
      where: { tourId, userId },
    });

    if (!tour) {
      throw new NotFoundException(
        `Tour with ID ${tourId} not found or doesn't belong to the user`,
      );
    }

    // Update the tour
    await this.toursRepository.update(tourId, updateTourDto);

    // Return the updated tour
    return await this.toursRepository.findOne({ where: { tourId } });
  }

  async deleteTour(tourId: string, userId: string): Promise<void> {
    // First check if the tour exists and belongs to the user
    const tour = await this.toursRepository.findOne({
      where: { tourId, userId },
    });

    if (!tour) {
      throw new NotFoundException(
        `Tour with ID ${tourId} not found or doesn't belong to the user`,
      );
    }

    // Delete the tour
    await this.toursRepository.delete(tourId);
  }

  async getTourWithDetails(tourId: string) {
    const tour = await this.toursRepository.findOne({ where: { tourId } });

    if (!tour) {
      throw new NotFoundException(`Tour with ID ${tourId} not found`);
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

    return {
      ...tour,
      pickupAddress,
      dropAddress,
      stops,
    };
  }
}
