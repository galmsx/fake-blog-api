import {
  Controller,
  Inject,
  Post,
  UseGuards,
  Request,
  Body,
} from '@nestjs/common';
import { AuthRPC } from '@local/grpc-lib';
import { AUTH_SERVICE } from '../constants';
import { User, Auth } from '@local/types-lib';
import { LocalAuthGuard } from '../guards/jwt-auth.guard';

@Controller('/auth')
export class AuthController {
  constructor(
    @Inject(AUTH_SERVICE)
    private readonly authService: AuthRPC.AuthService
  ) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req: { user: User.Types.User }) {
    return this.authService.login(req.user);
  }

  @Post('registration')
  async registration(@Body() body: Auth.DTO.RegisterUserDto): Promise<void> {
    return this.authService.registration(body);
  }
}
