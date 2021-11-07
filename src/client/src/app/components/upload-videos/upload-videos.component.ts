import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-upload-videos',
  templateUrl: './upload-videos.component.html',
  styleUrls: ['./upload-videos.component.scss']
})
export class UploadVideosComponent implements OnInit {
  file: File | null = null;
  files: any = [];

  constructor(
    private http: HttpClient,
    private router: Router,
    public apiService: ApiService
  ) { }

  ngOnInit(): void {
    this.getFiles();
  }

  get baseUrl() {
    return this.apiService.baseUrl;
  }

  readSingleFile(event: Event) {
    const files = (<HTMLInputElement>event.target).files;
    console.log(files);
    if (files) {
      this.file = files[0];
    }
  }

  submit() {
    if (!this.file) {
      return alert('select a file first')
    }
    const formData = new FormData();
    formData.append('file', this.file);
    this.http.post<any>(this.apiService.baseUrl + '/upload', formData).subscribe();
    this.file = null;
  }

  getFiles() {
    this.http.get<any>(this.apiService.baseUrl + '/files').subscribe(files => {this.files = files;
      console.log(files);
    });
  }

  stream(filename: string){
    this.router.navigate(['stream', filename]);
  }

  delete(id: string){
    this.http.post<any>( this.apiService.baseUrl + '/files/del/' + id, null).subscribe(files => this.files = files);
  }
}
