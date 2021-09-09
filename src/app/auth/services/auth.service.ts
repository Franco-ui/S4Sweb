import { first, switchMap, map } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { Aula, Colegio, User } from 'src/app/shared/interface/user.interface';
import {
  AngularFirestore,
  AngularFirestoreDocument,
} from '@angular/fire/firestore';
import { Observable, of } from 'rxjs';
import firebase from 'firebase/app';
import { Router } from '@angular/router';
// import { Time } from '@angular/common';

@Injectable()
export class AuthService {
  public userData: any;
  ingresoEmailCompleto: boolean = false;

  constructor(
    public afAuth: AngularFireAuth,
    private afs: AngularFirestore,
    private router: Router
  ) {
    this.afAuth.authState.subscribe((user) => {
      if (user) {
        this.afs
          .doc<User>(`users/${user.uid}`)
          .get()
          .toPromise()
          .then((res) => {
            this.userData = res.data();
          });
      } else {
        this.userData = null;
      }
    });

  }


  async isLoggedIn():Promise<boolean> {
      let user= await this.afAuth.authState.toPromise()
      console.log(user);
      if (!user) {
        return false;
      }
      console.log("dsdsds")
      let userData = await this.afs
          .doc<User>(`users/${user.uid}`)
          .get()
          .toPromise()
      console.log(userData.data()?.emailVerified);
      if (userData.data()?.emailVerified){
        return true;
      }
      return false;
      
      
      
  }

  //joya
  async login(email: string, password: string) {
    
    // if(this.userData == null) {
    //   alert("No existe una cuenta con ese email, por favor registrese");
    //   this.router.navigate(['/register']);
    // }
    firebase.auth().signInWithEmailAndPassword(email, password).catch((error) => {
      alert('No existe una cuenta con ese email, por favor registrese');
      this.router.navigate(['/register']);
      
      // console.log(error.code);
      // console.log(error.message);
    });
    
    const { user } = await this.afAuth.signInWithEmailAndPassword(
      email,
      password
    );

    // if (user?.emailVerified) {
    //   this.updateUserData(user);
    // }
    return user;
  }

  //joya
  async loginGoogle() {
    const { user } = await this.afAuth.signInWithPopup(
      new firebase.auth.GoogleAuthProvider()
    );
    if (user) {
      this.updateUserData(user);
    }
    return user;
  }

  //joya
  async register(email: string, password: string) {
    const { user } = await this.afAuth.createUserWithEmailAndPassword(
      email,
      password
    );
    
    this.updateUserData(user);
    this.sendVerificationEmail();
    return user;
  }

  resetPassword(email: string) {
    var auth = firebase.auth();
    return auth.sendPasswordResetEmail(email)
      .then(() => console.log("email sent"))
      .catch((error) => console.log(error))
  }

  //joya
  async sendVerificationEmail() {
    return (await this.afAuth.currentUser)?.sendEmailVerification();
  }

  //joya
  async logout() {
    await this.afAuth.signOut();
  }

  //joya
  async createSchool(
    nombre: string,
    direccion: string,
    localidad: string,
    telefono: string,
    duracionModulo: number,
    inicioHorario: string,
    finalizacionHorario: string,
    id: string
  ) {
    const school: Colegio = {
      id: id,
      userAdmin: this.userData.uid,
      nombre: nombre,
      ejecutado: "no",
      direccion: direccion,
      localidad: localidad,
      telefono: telefono,
      duracionModulo: duracionModulo,
      inicioHorario: inicioHorario,
      finalizacionHorario: finalizacionHorario,
      usuariosExtensiones: [],
      aulas: [],
      turnos: [],
      // modulos: [],
      materias: [],
      cursos: [],
      profesores: [],
    };

    if (
      String(school.nombre).length === 0 ||
      String(school.direccion).length === 0 ||
      String(school.localidad).length === 0 ||
      String(school.telefono).length === 0 ||
      String(school.duracionModulo).length === 0 ||
      String(school.inicioHorario).length === 0 ||
      String(school.finalizacionHorario).length === 0 ||
      String(school.inicioHorario).length === 0 ||
      String(school.finalizacionHorario).length === 0
    ){
      confirm("Completar los casilleros obligatorios");
      // Poner los valores que se piden
    }
    else if(String(school.nombre).length > 50){
      confirm("El nombre del colegio debe ser menor a los 50 caracteres");
    }
    else if(String(school.telefono).length != 8){
      confirm("El numero de telefono no es igual a los 8 digitos, recuerda que no debe contener ningun espacio, ningun signo y debe ser de tamaño 8");
    }
    else if(school.duracionModulo>60 || school.duracionModulo<20){
      // console.log(school.duracionModulo)
      confirm("La duracion de cada modulo debe estar entre 20 a 60 min (incluidos los extremos)");
    }
    else if(school.inicioHorario > school.finalizacionHorario && school.finalizacionHorario != " 00:00"){
      confirm("El horario de finalizacion es mas chico que el de inicio");
    }
    else if(school.inicioHorario<"05:00" && school.inicioHorario>="00:00" || school.inicioHorario>"12:00"){
      confirm("El horario de inicio debe ser entre 05:00 - 12:00 am");
    }
    else if(school.finalizacionHorario<"12:00"){
      confirm("El horario de finalizacion debe ser mayor que las 12:00 am");
    }
    else{
      this.SchoolData(school);
      this.router.navigate(['/crear-colegio']);
      // confirm("Poner los valores que se piden");
    }
  }

  //joya
  private updateUserData(user: any) {
    const userRef: AngularFirestoreDocument<User> = this.afs.doc(
      `users/${user.uid}`
    );

    const data: User = {
      uid: user.uid,
      email: user.email,
      emailVerified: user.emailVerified,
      displayName: user.email.split('@')[0],
    };

    return userRef.set(data, { merge: true });
  }

  //joya
  private SchoolData(school: any) {
    const schoolRef: AngularFirestoreDocument<Colegio> = this.afs.doc(
      `schools/${school.id}`
    );

    const data: Colegio = {
      id: school.id,
      userAdmin: school.userAdmin,
      nombre: school.nombre,
      ejecutado: school.ejecutado,
      direccion: school.direccion,
      localidad: school.localidad,
      telefono: "11" + school.telefono,
      duracionModulo: school.duracionModulo,
      inicioHorario: school.inicioHorario,
      finalizacionHorario: school.finalizacionHorario,
      usuariosExtensiones: [],
      aulas: [],
      turnos: [],
      // modulos: [],
      materias: [],
      cursos: [],
      profesores: [],
    };

    return schoolRef.set(data, { merge: true });
  }

}
