import { IsEmail, IsNotEmpty } from 'class-validator';

// DTO = "Data Transfer Object": la forma de los datos que llegan en la petición.
// Los decoradores de class-validator los revisan antes de llegar al controlador.
export class LoginDto {
  @IsEmail({}, { message: 'Escribe un correo válido' })
  email: string;

  @IsNotEmpty({ message: 'Escribe tu contraseña' })
  contrasena: string;
}
