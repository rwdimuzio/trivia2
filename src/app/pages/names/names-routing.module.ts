import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { NamesPage } from './names.page';

const routes: Routes = [
  {
    path: '',
    component: NamesPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class NamesPageRoutingModule {}
