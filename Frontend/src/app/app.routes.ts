import { Routes } from '@angular/router';
import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component';
import { SignupComponent } from './signup/signup.component';
import { ProfileComponent } from './profile/profile.component';
import { ProductDetailComponent } from './product-detail/product-detail.component';
import { CartComponent } from './cart/cart.component';
import { SuccessComponent } from './success/success.component';
import { CancelComponent } from './cancel/cancel.component';

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
    {
        path:'signup',
        component: SignupComponent
    },
    {
        path:'profile',
        component: ProfileComponent
    },
    {
        path:'cart',
        component: CartComponent
    },
    {
        path:'success',
        component: SuccessComponent
    },
    {
        path:'cancel',
        component: CancelComponent
    },
    {
        path:'product/detail/:id',
        component: ProductDetailComponent
    },
    {
        path:'**',
        component: PageNotFoundComponent
    }
];
