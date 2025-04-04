// tours-service/src/tours/tours.controller.ts
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
} from '@nestjs/common';
import { ToursService } from './tour.service';
import { VerifiedUserGuard } from 'src/core/common/gaurds/verified-user.guard';
import { AuthGuard } from 'src/core/common/gaurds/auth.guard';
import {
  CreateAddressDto,
  CreateTourDto,
  CreateTourStopDto,
  SearchTourDto,
} from './dto/tour.dto';

@Controller('tours')
export class ToursController {
  constructor(private readonly toursService: ToursService) {}

  @Post()
  // @UseGuards(AuthGuard, VerifiedUserGuard)
  @UseGuards(AuthGuard)
  async createTour(
    @Request() req,
    @Body() createTourDto: CreateTourDto,
    @Body('tourStops') tourStops: CreateTourStopDto[],
  ) {
    return this.toursService.createTour(
      req.user.userId,
      createTourDto,
      tourStops,
    );
  }

  @Post('address')
  @UseGuards(AuthGuard)
  async createAddress(
    @Request() req,
    @Body() createAddressDto: CreateAddressDto,
    @Body('tourId') tourId?: string,
  ) {
    return this.toursService.createAddress(
      req.user.userId,
      tourId || null,
      createAddressDto,
    );
  }

  @Get('my-tours')
  @UseGuards(AuthGuard)
  async getMyTours(@Request() req) {
    return this.toursService.findToursByUserId(req.user.userId);
  }

  @Get('search')
  @UseGuards(AuthGuard)
  async searchTours(@Query() searchTourDto: SearchTourDto) {
    return this.toursService.searchTours(searchTourDto);
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  async getTourDetails(@Param('id') id: string) {
    return this.toursService.getTourWithDetails(id);
  }

  @Put(':id')
  @UseGuards(AuthGuard, VerifiedUserGuard)
  async updateTour(
    @Param('id') id: string,
    @Request() req,
    @Body() updateTourDto: Partial<CreateTourDto>,
  ) {
    return this.toursService.updateTour(id, req.user.userId, updateTourDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, VerifiedUserGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteTour(@Param('id') id: string, @Request() req) {
    return this.toursService.deleteTour(id, req.user.userId);
  }
}
