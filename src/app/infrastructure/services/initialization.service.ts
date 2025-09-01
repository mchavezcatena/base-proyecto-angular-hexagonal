import { Injectable } from '@angular/core';
import { UserRepositoryImpl } from '../repositories/user.repository.impl';
import { RoleRepositoryImpl } from '../repositories/role.repository.impl';

@Injectable({
  providedIn: 'root'
})
export class InitializationService {
  constructor(
    private userRepository: UserRepositoryImpl,
    private roleRepository: RoleRepositoryImpl
  ) {}

  //en caso de no querer cargar datos de prueba solo comentar aqui
  async initializeTestData(): Promise<void> {
    // Simular un pequeño delay para mostrar el loading
    await new Promise(resolve => setTimeout(resolve, 500));

    // Inicializar datos de prueba para usuarios
    this.userRepository.initializeTestData();

    // Inicializar datos de prueba para roles
    this.roleRepository.initializeTestData();

    console.log('Datos de prueba inicializados correctamente');
  }
}
