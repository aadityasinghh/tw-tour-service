import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from 'src/core/common/gaurds/auth.guard';
import { ResponseService } from 'src/core/common/services/response.service';
import { AddressService } from './address.service';
import { SearchAddressDto } from '../tour/dto/search.dto';
import { ResponseMessages } from 'src/core/common/constants/response-messages.constant';
import { ApiResponse } from 'src/core/common/interfaces/api-response.interface';

// Define interface for authenticated user request
interface AuthenticatedRequest extends Request {
    user: {
        userId: string;
        email: string;
        name: string;
    };
}

@Controller('addresses')
export class AddressController {
    constructor(
        private readonly addressService: AddressService,
        private readonly responseService: ResponseService,
    ) {}

    @Get('my')
    @UseGuards(AuthGuard)
    async getMyAddresses(
        @Request() req: AuthenticatedRequest,
        @Query() searchAddressDto: SearchAddressDto,
    ): Promise<ApiResponse<unknown>> {
        const result = await this.addressService.getAddressesByUserId(
            req.user.userId,
            searchAddressDto,
        );
        return this.responseService.success(
            result,
            ResponseMessages.ADDRESS_RETRIEVED,
        );
    }
}
