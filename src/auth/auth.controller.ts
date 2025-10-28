import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

@ApiTags('Authentification')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  /**
   * Connexion du personnel
   *
   * Cette route permet à un membre du personnel de se connecter
   * en utilisant ses identifiants (email et mot de passe).
   *
   * Retourne un token JWT en cas de succès.
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Connexion du personnel',
    description: 'Permet au personnel de se connecter avec email et mot de passe.',
  })
  @ApiBody({ type: LoginDto, description: 'Identifiants de connexion' })
  @ApiResponse({ status: 200, description: 'Connexion réussie, retourne un token JWT.' })
  @ApiResponse({ status: 401, description: 'Identifiants incorrects ou compte inactif.' })
  @ApiResponse({ status: 400, description: 'Requête invalide (ex: champs manquants ou mal formatés).' })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }
}
