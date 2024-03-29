import { Component, OnInit } from '@angular/core';
import { SATAuthService } from 'sat-auth';
import { ApiClientService, Author } from '../services/api-client.service';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit
{
  public authors: Author[] = [];

  constructor(
    public authService: SATAuthService,
    public apiClientService: ApiClientService) { }

  ngOnInit(): void
  {
    // setInterval(() =>
    // {
    //   this.apiClientService.GetAuthorById(1).subscribe({
    //     next: author =>
    //     {

    //     }
    //   })
    // }, 100);


  }

  onClick(): void
  {
    this.apiClientService.GetAuthorById(1).subscribe({
      next: author =>
      {
        console.log(author);


      }
    })
  }

  onLogout(): void
  {
    this.authService.logout();
  }

}
