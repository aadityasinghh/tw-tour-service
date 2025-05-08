import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { isValidUUID } from '../utils/validate-uuid.util';

@Injectable()
export class UuidValidationPipe implements PipeTransform<string> {
    transform(value: string): string {
        // Validate UUID format
        if (!isValidUUID(value)) {
            throw new BadRequestException(`Invalid UUID format: ${value}`);
        }
        return value;
    }
}
