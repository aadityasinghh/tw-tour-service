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
    Patch,
} from '@nestjs/common';
import { ToursService } from './tour.service';
import { VerifiedUserGuard } from 'src/core/common/gaurds/verified-user.guard';
import { AuthGuard } from 'src/core/common/gaurds/auth.guard';
import {
    CreateTourDto,
    CreateTourStopDto,
    SearchTourDto,
    UpdateTourDto,
    UpdateTourAvailableSpaceDto,
} from './dto/tour.dto';
import { ResponseService } from 'src/core/common/services/response.service';
import { ResponseMessages } from 'src/core/common/constants/response-messages.constant';
import { CreateAddressDto } from '../address/dto/address.dto';
import { ApiResponse } from 'src/core/common/interfaces/api-response.interface';

// Define interface for authenticated user request
interface AuthenticatedRequest extends Request {
    user: {
        userId: string;
        email: string;
        name: string;
    };
}

@Controller('tours')
export class ToursController {
    constructor(
        private readonly toursService: ToursService,
        private readonly responseService: ResponseService,
    ) {}

    @Post()
    @UseGuards(AuthGuard, VerifiedUserGuard)
    async createTour(
        @Request() req: AuthenticatedRequest,
        @Body() createTourDto: CreateTourDto,
        @Body('tourStops') tourStops: CreateTourStopDto[],
    ): Promise<ApiResponse<unknown>> {
        const tour = await this.toursService.createTour(
            req.user.userId,
            req.user.email,
            req.user.name,
            createTourDto,
            tourStops,
        );
        return this.responseService.success(
            tour,
            ResponseMessages.TOUR_CREATED,
        );
    }

    @Post('address')
    @UseGuards(AuthGuard)
    async createAddress(
        @Request() req: AuthenticatedRequest,
        @Body() createAddressDto: CreateAddressDto,
        @Body('tourId', new ParseUUIDPipe({ version: '4', optional: true }))
        tourId?: string,
    ): Promise<ApiResponse<unknown>> {
        const address = await this.toursService.createAddress(
            req.user.userId,
            createAddressDto,
            tourId,
        );
        return this.responseService.success(
            address,
            ResponseMessages.ADDRESS_CREATED,
        );
    }

    @Get('my-tours')
    @UseGuards(AuthGuard)
    async getMyTours(
        @Request() req: AuthenticatedRequest,
    ): Promise<ApiResponse<unknown>> {
        const tours = await this.toursService.findToursByUserId(
            req.user.userId,
        );
        return this.responseService.success(
            tours,
            ResponseMessages.TOURS_FOUND,
        );
    }

    @Get('search')
    // @UseGuards(AuthGuard)
    async searchTours(
        @Query() searchTourDto: SearchTourDto,
    ): Promise<ApiResponse<unknown>> {
        const tours = await this.toursService.searchTours(searchTourDto);
        return this.responseService.success(
            tours,
            ResponseMessages.TOURS_FOUND,
        );
    }

    @Get(':id')
    @UseGuards(AuthGuard) // Making this endpoint authenticated as per security best practice
    async getTourDetails(
        @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    ): Promise<ApiResponse<unknown>> {
        const tour = await this.toursService.getTourWithDetails(id);
        return this.responseService.success(tour, ResponseMessages.TOUR_FOUND);
    }

    @Put(':id')
    @UseGuards(AuthGuard)
    async updateTour(
        @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
        @Request() req: AuthenticatedRequest,
        @Body() updateTourDto: UpdateTourDto,
    ): Promise<ApiResponse<unknown>> {
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

    @Patch(':id/available-space')
    @UseGuards(AuthGuard)
    async updateAvailableSpace(
        @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
        @Request() req: AuthenticatedRequest,
        @Body() updateTourAvailableSpaceDto: UpdateTourAvailableSpaceDto,
    ): Promise<ApiResponse<unknown>> {
        const updatedTour = await this.toursService.updateTourAvailableSpace(
            id,
            req.user.userId,
            updateTourAvailableSpaceDto,
        );
        return this.responseService.success(
            updatedTour,
            ResponseMessages.TOUR_AVAILABLE_SPACE_UPDATED,
        );
    }

    @Delete(':id')
    @UseGuards(AuthGuard, VerifiedUserGuard)
    @HttpCode(HttpStatus.OK) // Changed to OK to return the response object
    async deleteTour(
        @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
        @Request() req: AuthenticatedRequest,
    ): Promise<ApiResponse<unknown>> {
        const result = await this.toursService.deleteTour(id, req.user.userId);
        return this.responseService.success(
            result,
            ResponseMessages.TOUR_DELETED,
        );
    }
}
