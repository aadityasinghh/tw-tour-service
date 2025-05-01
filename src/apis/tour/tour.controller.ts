import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Query,
  UseGuards,
  Request,
  Put,
  Delete,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ToursService } from './tour.service';
import { VerifiedUserGuard } from 'src/core/common/gaurds/verified-user.guard';
import { AuthGuard } from 'src/core/common/gaurds/auth.guard';
import {
  CreateAddressDto,
  CreateTourDto,
  CreateTourStopDto,
  SearchTourDto,
  UpdateTourDto,
} from './dto/tour.dto';
import { ResponseService } from 'src/core/common/services/response.service';
import { ResponseMessages } from 'src/core/common/constants/response-messages.constant';

@Controller('tours')
export class ToursController {
  constructor(
    private readonly toursService: ToursService,
    private readonly responseService: ResponseService,
  ) {}

  @Post()
  @UseGuards(AuthGuard, VerifiedUserGuard)
  async createTour(
    @Request() req,
    @Body() createTourDto: CreateTourDto,
    @Body('tourStops') tourStops: CreateTourStopDto[],
  ) {
    const tour = await this.toursService.createTour(
      req.user.userId,
      req.user.email,
      req.user.name,
      createTourDto,
      tourStops,
    );
    return this.responseService.success(tour, ResponseMessages.TOUR_CREATED);
  }

  @Post('address')
  @UseGuards(AuthGuard)
  async createAddress(
    @Request() req,
    @Body() createAddressDto: CreateAddressDto,
    @Body('tourId', new ParseUUIDPipe({ version: '4', optional: true }))
    tourId?: string,
  ) {
    const address = await this.toursService.createAddress(
      req.user.userId,
      createAddressDto,
      tourId,
    );
    return this.responseService.success(
      address,
      'Address created successfully',
    );
  }

  @Get('my-tours')
  @UseGuards(AuthGuard)
  async getMyTours(@Request() req) {
    const tours = await this.toursService.findToursByUserId(req.user.userId);
    return this.responseService.success(tours, ResponseMessages.TOURS_FOUND);
  }

  @Get('search')
  // @UseGuards(AuthGuard)
  async searchTours(@Query() searchTourDto: SearchTourDto) {
    const tours = await this.toursService.searchTours(searchTourDto);
    return this.responseService.success(tours, ResponseMessages.TOURS_FOUND);
  }

  @Get(':id')
  @UseGuards(AuthGuard) // Making this endpoint authenticated as per security best practice
  async getTourDetails(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ) {
    const tour = await this.toursService.getTourWithDetails(id);
    return this.responseService.success(tour, ResponseMessages.TOUR_FOUND);
  }

  @Put(':id')
  @UseGuards(AuthGuard)
  async updateTour(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Request() req,
    @Body() updateTourDto: UpdateTourDto,
  ) {
    const updatedTour = await this.toursService.updateTour(
      id,
      req.user.userId,
      updateTourDto,
    );
    return this.responseService.success(
      updatedTour,
      ResponseMessages.TOUR_UPDATED,
    );
  }

  @Delete(':id')
  @UseGuards(AuthGuard, VerifiedUserGuard)
  @HttpCode(HttpStatus.OK) // Changed to OK to return the response object
  async deleteTour(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Request() req,
  ) {
    const result = await this.toursService.deleteTour(id, req.user.userId);
    return this.responseService.success(result, ResponseMessages.TOUR_DELETED);
  }
}
