import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PublicController } from './public.controller';
import { PublicServicesService } from './public-services.service';
import { PublicAuthService } from './public-auth.service';
import { Service, ServiceSchema } from '../services/service.schema';
import { ServiceCategory, ServiceCategorySchema } from '../service-categories/service-category.schema';
import { User, UserSchema } from '../users/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Service.name, schema: ServiceSchema },
      { name: ServiceCategory.name, schema: ServiceCategorySchema },
      { name: User.name, schema: UserSchema },
    ]),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '15m' },
      }),
    }),
  ],
  controllers: [PublicController],
  providers: [PublicServicesService, PublicAuthService],
  exports: [PublicServicesService, PublicAuthService],
})
export class PublicModule {}
