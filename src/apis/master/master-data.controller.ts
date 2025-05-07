import { Controller, Get, Query } from '@nestjs/common';
import { ResponseService } from 'src/core/common/services/response.service';
import { MasterDataService } from './master-data.service';
import {
  SearchCityDto,
  SearchItemTypeDto,
  SearchTravelModeDto,
} from '../tour/dto/search.dto';

@Controller()
export class MasterDataController {
  constructor(
    private readonly masterDataService: MasterDataService,
    private readonly responseService: ResponseService,
  ) {}

  @Get('cities')
  async getCities(@Query() searchCityDto: SearchCityDto) {
    const result = await this.masterDataService.getCities(searchCityDto);
    return this.responseService.success(
      result,
      'Cities retrieved successfully',
    );
  }

  @Get('item-types')
  async getItemTypes(@Query() searchItemTypeDto: SearchItemTypeDto) {
    const result = await this.masterDataService.getItemTypes(searchItemTypeDto);
    return this.responseService.success(
      result,
      'Item types retrieved successfully',
    );
  }

  @Get('travel-modes')
  async getTravelModes(@Query() searchTravelModeDto: SearchTravelModeDto) {
    const result =
      await this.masterDataService.getTravelModes(searchTravelModeDto);
    return this.responseService.success(
      result,
      'Travel modes retrieved successfully',
    );
  }
}
