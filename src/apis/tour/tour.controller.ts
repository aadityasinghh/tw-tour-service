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
  BadRequestException,
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
import { ResponseMessages } from 'src/utils/messages';

@Controller('tours')
export class ToursController {
  constructor(private readonly toursService: ToursService) {}

  @Post()
  @UseGuards(AuthGuard, VerifiedUserGuard)
  async createTour(
    @Request() req,
    @Body() createTourDto: CreateTourDto,
    @Body('tourStops') tourStops: CreateTourStopDto[],
  ) {
    try {
      return await this.toursService.createTour(
        req.user.userId,
        req.user.email,
        req.user.name,
        createTourDto,
        tourStops,
      );
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException({
        data: null,
        code: ResponseMessages.BAD_REQUEST.code,

        message: error.message || ResponseMessages.BAD_REQUEST.message,
      });
    }
  }

  @Post('address')
  @UseGuards(AuthGuard)
  async createAddress(
    @Request() req,
    @Body() createAddressDto: CreateAddressDto,
    @Body('tourId') tourId?: string,
  ) {
    try {
      return await this.toursService.createAddress(
        req.user.userId,
        createAddressDto,
        tourId,
      );
    } catch (error) {
      throw new BadRequestException({
        data: null,
        code: ResponseMessages.BAD_REQUEST.code,
        message: error.message || ResponseMessages.BAD_REQUEST.message,
      });
    }
  }

  @Get('my-tours')
  @UseGuards(AuthGuard)
  async getMyTours(@Request() req) {
    return this.toursService.findToursByUserId(req.user.userId);
  }

  @Get('search')
  // @UseGuards(AuthGuard)
  async searchTours(@Query() searchTourDto: SearchTourDto) {
    return this.toursService.searchTours(searchTourDto);
  }

  @Get(':id')
  @UseGuards(AuthGuard) // Making this endpoint authenticated as per security best practice
  async getTourDetails(@Param('id') id: string) {
    return this.toursService.getTourWithDetails(id);
  }

  @Put(':id')
  @UseGuards(AuthGuard)
  async updateTour(
    @Param('id') id: string,
    @Request() req,
    @Body() updateTourDto: UpdateTourDto,
  ) {
    try {
      return await this.toursService.updateTour(
        id,
        req.user.userId,
        updateTourDto,
      );
    } catch (error) {
      if (error.message === ResponseMessages.NOT_FOUND.message) {
        throw new BadRequestException({
          data: null,
          code: ResponseMessages.NOT_FOUND.code,
          message: ResponseMessages.NOT_FOUND.message,
        });
      }
      throw new BadRequestException({
        data: null,
        code: ResponseMessages.BAD_REQUEST.code,
        message: error.message || ResponseMessages.BAD_REQUEST.message,
      });
    }
  }

  @Delete(':id')
  @UseGuards(AuthGuard, VerifiedUserGuard)
  @HttpCode(HttpStatus.OK) // Changed to OK to return the response object
  async deleteTour(@Param('id') id: string, @Request() req) {
    try {
      return await this.toursService.deleteTour(id, req.user.userId);
    } catch (error) {
      if (error.message === ResponseMessages.NOT_FOUND.message) {
        throw new BadRequestException({
          data: null,
          code: ResponseMessages.NOT_FOUND.code,
          message: ResponseMessages.NOT_FOUND.message,
        });
      }
      throw new BadRequestException({
        data: null,
        code: ResponseMessages.BAD_REQUEST.code,
        message: error.message || ResponseMessages.BAD_REQUEST.message,
      });
    }
  }
}
