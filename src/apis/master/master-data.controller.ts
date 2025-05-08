import { Controller, Get, Query } from '@nestjs/common';
import { ResponseService } from 'src/core/common/services/response.service';
import { MasterDataService } from './master-data.service';
import {
    SearchCityDto,
    SearchItemTypeDto,
    SearchTravelModeDto,
} from '../tour/dto/search.dto';
import { ResponseMessages } from 'src/core/common/constants/response-messages.constant';
import { ApiResponse } from 'src/core/common/interfaces/api-response.interface';

@Controller()
export class MasterDataController {
    constructor(
        private readonly masterDataService: MasterDataService,
        private readonly responseService: ResponseService,
    ) {}

    @Get('cities')
    async getCities(
        @Query() searchCityDto: SearchCityDto,
    ): Promise<ApiResponse<unknown>> {
        const result = await this.masterDataService.getCities(searchCityDto);
        return this.responseService.success(
            result,
            ResponseMessages.CITY_RETRIEVED,
        );
    }

    @Get('item-types')
    async getItemTypes(
        @Query() searchItemTypeDto: SearchItemTypeDto,
    ): Promise<ApiResponse<unknown>> {
        const result =
            await this.masterDataService.getItemTypes(searchItemTypeDto);
        return this.responseService.success(
            result,
            ResponseMessages.ITEM_TYPE_RETRIEVED,
        );
    }

    @Get('travel-modes')
    async getTravelModes(
        @Query() searchTravelModeDto: SearchTravelModeDto,
    ): Promise<ApiResponse<unknown>> {
        const result =
            await this.masterDataService.getTravelModes(searchTravelModeDto);
        return this.responseService.success(
            result,
            ResponseMessages.TRAVEL_MODE_RETRIEVED,
        );
    }
}
