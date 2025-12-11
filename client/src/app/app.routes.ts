import { Routes } from "@angular/router";
import { CurrentDataComponent } from "./pages/dashboard/currentData.component";
import { ProfileComponent } from "./pages/profile/profile.component";
import { NotFoundComponent } from "./pages/other-page/not-found/not-found.component";
import { AppLayoutComponent } from "./shared/layout/app-layout/app-layout.component";
import { LineChartComponent } from "./pages/charts/line-chart/line-chart.component";
import { BarChartComponent } from "./pages/charts/bar-chart/bar-chart.component";
import { SignInComponent } from "./pages/auth-pages/sign-in/sign-in.component";
import { SignUpComponent } from "./pages/auth-pages/sign-up/sign-up.component";
import { CalenderComponent } from "./pages/calender/calender.component";

export const routes: Routes = [
  {
    path: "",
    component: AppLayoutComponent,
    children: [
      {
        path: "",
        component: CurrentDataComponent,
        pathMatch: "full",
        title: "Real Time Monitoring Dashboard",
      },
      {
        path: "calendar",
        component: CalenderComponent,
        title: "Real Time Monitoring Calendar",
      },
      {
        path: "profile",
        component: ProfileComponent,
        title: "Real Time Monitoring Profile",
      },
      {
        path: "line-chart",
        component: LineChartComponent,
        title: "Real Time Monitoring Line Chart",
      },
      {
        path: "bar-chart",
        component: BarChartComponent,
        title: "Real Time Monitoring Bar Chart",
      },
    ],
  },
  // auth pages
  {
    path: "signin",
    component: SignInComponent,
    title: "Angular Sign In Dashboard",
  },
  {
    path: "signup",
    component: SignUpComponent,
    title:
      "Angular Sign Up Dashboard | TailAdmin - Angular Admin Dashboard Template",
  },
  // error pages
  {
    path: "**",
    component: NotFoundComponent,
    title:
      "Angular NotFound Dashboard | TailAdmin - Angular Admin Dashboard Template",
  },
];
