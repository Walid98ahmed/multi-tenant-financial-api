import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { JwtPayload } from '../common/interfaces/jwt-payload.interface';
import { UserResponseDto } from '../users/dto/user-response.dto';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { SignupDto } from './dto/signup.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async signup(signupDto: SignupDto) {
    const existingUser = await this.usersService.findByEmail(signupDto.email);

    if (existingUser) {
      throw new ConflictException('Email already in use');
    }

    const rounds = this.configService.get<number>('BCRYPT_ROUNDS', 12);
    const passwordHash = await bcrypt.hash(signupDto.password, rounds);

    const user = await this.usersService.create({
      email: signupDto.email.toLowerCase().trim(),
      name: signupDto.name.trim(),
      passwordHash,
    });

    return this.buildAuthResponse(
      user.id,
      user.email,
      user.name,
      user.createdAt,
    );
  }

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByEmail(
      loginDto.email.toLowerCase().trim(),
      true,
    );

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.buildAuthResponse(
      user.id,
      user.email,
      user.name,
      user.createdAt,
    );
  }

  private buildAuthResponse(
    id: string,
    email: string,
    name: string,
    createdAt: Date,
  ) {
    const payload: JwtPayload = {
      sub: id,
      email,
    };

    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id,
        email,
        name,
        createdAt,
      } satisfies UserResponseDto,
    };
  }
}
