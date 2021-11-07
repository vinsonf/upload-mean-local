import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-page-stream-video',
  templateUrl: './page-stream-video.component.html',
  styleUrls: ['./page-stream-video.component.scss']
})
export class PageStreamVideoComponent implements OnInit {
  filename: string = '';
  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService
  ) { }

  get baseUrl() {
    return this.apiService.baseUrl;
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      console.log(params)
      this.filename = params['filename'];
    });
  }

}
