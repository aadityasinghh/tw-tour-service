import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from 'src/core/common/gaurds/auth.guard';
import { ResponseService } from 'src/core/common/services/response.service';
import { AddressService } from './address.service';
import { SearchAddressDto } from '../tour/dto/search.dto';

@Controller('addresses')
export class AddressController {
    constructor(
        private readonly addressService: AddressService,
        private readonly responseService: ResponseService,
    ) {}

    @Get('my')
    @UseGuards(AuthGuard)
    async getMyAddresses(
        @Request() req,
        @Query() searchAddressDto: SearchAddressDto,
    ) {
        const result = await this.addressService.getAddressesByUserId(
            req.user.userId,
            searchAddressDto,
        );
        return this.responseService.success(
            result,
            'Addresses retrieved successfully',
        );
    }
}
