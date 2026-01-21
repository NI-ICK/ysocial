import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { AuthService } from './auth.service'
import { UsersModule } from 'src/users/users.module'
import { AuthResolver } from './auth.resolver'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { LocalStrategy } from './strategy/local.strategy'
import { JwtStrategy } from './strategy/jwt.strategy'
import { PassportModule } from '@nestjs/passport'
import { GoogleStrategy } from './strategy/google.strategy'
import { AuthController } from './auth.controller'
import { GithubStrategy } from './strategy/github.strategy'

@Module({
  imports: [
    ConfigModule.forRoot(),
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        signOptions: { expiresIn: '1d' },
        secret: configService.get('JWT_SECRET'),
      }),
    }),
    UsersModule,
  ],
  providers: [
    AuthService,
    AuthResolver,
    LocalStrategy,
    JwtStrategy,
    GoogleStrategy,
    GithubStrategy,
  ],
  controllers: [AuthController],
})
export class AuthModule {}
