import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-names',
  templateUrl: './names.page.html',
  styleUrls: ['./names.page.scss'],
})
export class NamesPage implements OnInit {
  loading=false;
  constructor(private router:Router) { }

  ngOnInit() {
  }

  next(){
    this.loading = true;
    var parent = this;
    setTimeout(()=>{
      this.loading=false;
      this.router.navigate(['/game']);
    },1000)
  }

}
