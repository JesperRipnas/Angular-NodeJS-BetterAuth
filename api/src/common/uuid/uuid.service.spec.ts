import { UuidService } from './uuid.service.js';

describe('UuidService', () => {
  let service: UuidService;

  beforeEach(() => {
    service = new UuidService();
  });

  it('should generate a valid UUID v4', () => {
    const uuid = service.generate();
    expect(uuid).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
  });
});
