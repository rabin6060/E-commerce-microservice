import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path:'',
        pathMatch:'full',
        loadComponent:async()=> {
            return import('./home/home.component').then(m=>m.HomeComponent)
        },
    },
    {
        path:'login',
        loadComponent:async()=> {
            return import('./login/login.component').then(m=>m.LoginComponent)
        },
    },
];
