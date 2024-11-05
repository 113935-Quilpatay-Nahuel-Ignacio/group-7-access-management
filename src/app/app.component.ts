import { Component } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { VisitorFormComponent } from './old/visitor/features/visitor-form/visitor-form.component';
import { VisitorListComponent } from './old/visitor/features/visitor-list/visitor-list.component';
import {SidebarComponent} from "./components/commons/sidebar/sidebar.component";
import {NavbarComponent} from "./components/commons/navbar/navbar.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterModule, VisitorListComponent, VisitorFormComponent, SidebarComponent, NavbarComponent],
  templateUrl: './app.component.html',
})
export class AppComponent {
  title = 'access-management';
}
