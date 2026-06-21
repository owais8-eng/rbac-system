import { Controller, Post, Get, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './login.dto';
import { RefreshDto } from './refresh.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { Public } from './public.decorator';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) { }

  @Public()
  @Post('login')
  @ApiOperation({
    summary: 'Login',
    description: 'Authenticate with email and password. Returns access + refresh tokens.',
  })
  @ApiResponse({
    status: 201,
    description: 'Login successful',
    schema: {
      example: {
        access_token: 'eyJhbGciOiJIUzI1NiIs...',
        refresh_token: 'eyJhbGciOiJIUzI1NiIs...',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Invalid email or password' })
  async login(@Body() dto: LoginDto) {
    const user = await this.authService.validateUser(dto.email, dto.password);
    return this.authService.login(user);
  }

  @Public()
  @Post('refresh')
  @ApiOperation({ summary: 'Refresh tokens', description: 'Exchange a valid refresh token for a new token pair.' })
  @ApiResponse({
    status: 201,
    description: 'Tokens refreshed',
    schema: {
      example: {
        access_token: 'eyJhbGciOiJIUzI1NiIs...',
        refresh_token: 'eyJhbGciOiJIUzI1NiIs...',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Invalid, expired, or revoked refresh token' })
  async refresh(@Body() dto: RefreshDto) {
    return this.authService.refresh(dto.refresh_token);
  }

  @Public()
  @Post('logout')
  @ApiOperation({ summary: 'Logout', description: 'Revoke a refresh token. After this, the token cannot be used again.' })
  @ApiResponse({ status: 201, description: 'Logged out successfully', schema: { example: { message: 'Logged out' } } })
  async logout(@Body() dto: RefreshDto) {
    await this.authService.logout(dto.refresh_token);
    return { message: 'Logged out' };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'My profile', description: 'Get the currently authenticated user with roles and permissions.' })
  @ApiResponse({ status: 200, description: 'User profile' })
  @ApiResponse({ status: 401, description: 'Missing or invalid access token' })
  getProfile(@Request() req) {
    return req.user;
  }
}
