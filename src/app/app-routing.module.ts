import { Component, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SendEmailComponent } from './auth/send-email/send-email.component';
import { EleccionComponent } from './colegio/eleccion/eleccion.component'; //sirve para esto component: EleccionComponent
import { map } from 'rxjs/operators';
import {
  AngularFireAuthGuard,
  emailVerified,
  isNotAnonymous,
  redirectLoggedInTo,
  redirectUnauthorizedTo,
} from '@angular/fire/auth-guard';
import { pipe } from 'rxjs';
// import { AuthGuard } from './shared/guards/auth.guard';
// export const emailVerified: AuthPipe = map(user => !!user && user.emailVerified);
const redirectToLoginWhenUserNotVerified = (redirect: any[]) =>
  pipe(
    emailVerified,
    map((loggedIn: any) => loggedIn || redirect)
  );
const redirectToLoginWhenUserNotLogin = (redirect: any[]) =>
  pipe(
    isNotAnonymous,
    map((loggedIn: any) => loggedIn || redirect)
  );

const redirectToVerifiedEmail = () =>
  redirectToLoginWhenUserNotVerified(['verificacion-email']);
const redirectToLogin = () => redirectToLoginWhenUserNotLogin(['login']);

const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./home/home.module').then((m) => m.HomeModule),
  },
  {
    path: 'register',
    loadChildren: () =>
      import('./auth/register/register.module').then((m) => m.RegisterModule),
    canActivate: [AngularFireAuthGuard],
    data: { authGuardPipe: redirectToVerifiedEmail },
  },
  {
    path: 'login',
    loadChildren: () =>
      import('./auth/login/login.module').then((m) => m.LoginModule),
    canActivate: [AngularFireAuthGuard],
    data: { authGuardPipe: redirectToVerifiedEmail },
  },
  {
    path: 'eleccion',
    loadChildren: () =>
      import('./colegio/eleccion/eleccion.module').then(
        (m) => m.EleccionModule
      ),
    canActivate: [AngularFireAuthGuard],
    data: { authGuardPipe: redirectToVerifiedEmail },
  },
  {
    path: 'verificacion-email',
    component: SendEmailComponent,
    canActivate: [AngularFireAuthGuard],
    data: { authGuardPipe: redirectToLogin },
  },
  {
    path: 'crear-colegio',
    loadChildren: () =>
      import('./colegio/crear-colegio/crear-colegio.module').then(
        (m) => m.CrearColegioModule
      ),
    canActivate: [AngularFireAuthGuard],
    data: { authGuardPipe: redirectToVerifiedEmail },
  },
  {
    path: 'menu-principal',
    loadChildren: () =>
      import('./colegio/menu-principal/menu-principal.module').then(
        (m) => m.MenuPrincipalModule
      ),
    canActivate: [AngularFireAuthGuard],
    data: { authGuardPipe: redirectToVerifiedEmail },
  },
  // {
  //   path: 'configuracion',
  //   loadChildren: () =>
  //     import('./configuraciones/setting/setting.module').then(
  //       (m) => m.SettingModule
  //     ),
  //   canActivate: [AngularFireAuthGuard],
  //   data: { authGuardPipe: redirectUnauthorizedToLogin },
  // },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
