import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHealth() {
    return {
      status: 'ok',
      service: 'ledgers-saas-backend',
      timestamp: new Date().toISOString(),
    };
  }
}
