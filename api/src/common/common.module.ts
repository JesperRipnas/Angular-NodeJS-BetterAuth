import { Module } from '@nestjs/common';
import { UuidService } from './uuid/uuid.service.js';

@Module({
  providers: [UuidService],
  exports: [UuidService],
})
export class CommonModule {}
