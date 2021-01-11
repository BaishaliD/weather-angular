import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';

import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import * as moment from 'moment';

// import { HttpErrorHandler, HandleError } from '../http-error-handler.service';


@Injectable()
export class WeatherService {

currentData;
  
  constructor(
    private http: HttpClient) {
    // this.handleError = httpErrorHandler.createHandleError('HeroesService');
    // console.log("Processed data", this.processedData);
  }

  /** GET weather data from the API */

  getCurrentData(lat,lon) : Observable<any>{

    return this.http.get<any>(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=d1c89c358b546c83385c653a44f42390`);
   // .pipe(
   //   catchError((err)=>{})
   // );

}  
  getAllData(lat,lon) : Observable<any>{

       return this.http.get<any>(`https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=minutely,alerts&units=metric&appid=d1c89c358b546c83385c653a44f42390`);
      // .pipe(
      //   catchError((err)=>{})
      // );

  }  
}