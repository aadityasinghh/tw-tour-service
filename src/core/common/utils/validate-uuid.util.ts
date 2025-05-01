import { ResponseService } from '../services/response.service';

/**
 * Validates if a string is a valid UUID format
 * @param id String to validate as UUID
 * @returns True if valid UUID format, false otherwise
 */
export function isValidUUID(id: string): boolean {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}

/**
 * Validates UUID format and returns a not found response if invalid
 * @param id ID to validate
 * @param responseService ResponseService instance
 * @param entityName Name of the entity being referenced (e.g. 'Tour')
 * @returns void if valid, never returns if invalid (throws exception)
 */
export function validateUUID(
  id: string,
  responseService: ResponseService,
  entityName: string = 'Resource',
): void {
  if (!isValidUUID(id)) {
    responseService.badRequest(
      `Invalid ${entityName} ID format: ${id}. Expected a valid UUID.`,
    );
  }
}
