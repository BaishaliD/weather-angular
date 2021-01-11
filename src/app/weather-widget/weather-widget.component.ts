import { Component, OnInit } from '@angular/core';
import { WeatherService } from './weather-widget.service';
import * as moment from 'moment';
import { ChartDataSets, ChartOptions } from 'chart.js';
import { Color, Label } from 'ng2-charts';

@Component({
  selector: 'app-weather-widget',
  templateUrl: './weather-widget.component.html',
  styleUrls: ['./weather-widget.component.css'],
  providers: [WeatherService],
})
export class WeatherWidgetComponent implements OnInit {
  data = {
    location: '',
    dt: '',
    current: {
      temp: 0,
      max: 0,
      min: 0,
      feels_like: 0,
      humidity: 0,
      rain: 0,
      snow: 0,
      weather: {
        id: 0,
        icon: '',
        main: '',
        description: '',
      },
    },
    hourly: {
      time: [],
      temp: [],
    },
    daily: [],
  };

  constructor(private weatherService: WeatherService) {}

  public lineChartData: ChartDataSets[];
  public lineChartLabels: Label[];
  public lineChartOptions: ChartOptions = {
    responsive: true,
    legend: {
      display: false,
    },
    scales: {
      xAxes: [
        {
          ticks: {
            fontColor: 'white',
            autoSkip: true,
            maxRotation: 0,
          },
          gridLines: { display: false },
        },
      ],
      yAxes: [
        {
          ticks: { fontColor: 'white' },
          gridLines: { display: false },
        },
      ],
    },
  };
  public lineChartColors: Color[] = [
    {
      borderColor: 'white',
      // backgroundColor: 'white',
    },
  ];
  public lineChartLegend = false;
  public lineChartType = 'line';

  ngOnInit(): void {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {

        this.weatherService
          .getCurrentData(position.coords.latitude, position.coords.longitude)
          .subscribe((data) => {
            this.data.location = data.name;
            this.data.dt = moment.unix(data.dt).format('h:mm a, dddd');
          })


        this.weatherService
          .getAllData(position.coords.latitude, position.coords.longitude)
          .subscribe((data) => {
            this.data.current.temp = data.current.temp;
            this.data.current.feels_like = data.current.feels_like;
            this.data.current.humidity = data.current.humidity;

            // if(data.current.hasOwnProperty('rain')){
            //   this.data.current.rain = data.current.rain["1h"]
            // }
            // if(data.current.hasOwnProperty('snow')){
            //   this.data.current.snow = data.current.snow["1h"]
            // }

            this.data.current.weather.id = data.current.weather[0].id;
            this.data.current.weather.icon = `http://openweathermap.org/img/wn/${data.current.weather[0].icon}@2x.png`;
            this.data.current.weather.main = data.current.weather[0].main;
            this.data.current.weather.description =
              data.current.weather[0].description;

            for (let i = 0; i < data.hourly.length; i += 3) {
              this.data.hourly.time.push(
                moment.unix(data.hourly[i].dt).format('h:mm a')
              );
              this.data.hourly.temp.push(data.hourly[i].temp);
            }

            for (let i = 0; i < data.daily.length; i++) {
              //data.daily.forEach((item) => {
              let item = data.daily[i];

              if (i == 0) {
                this.data.current.max = item.temp.max;
                this.data.current.min = item.temp.min;
              } else {
                this.data.daily.push({
                  date: moment.unix(item.dt).format('ddd'),
                  temp: {
                    max: item.temp.max,
                    min: item.temp.min,
                  },
                  weather: {
                    id: item.weather[0].id,
                    main: item.weather[0].main,
                    description: item.weather[0].description,
                    icon: item.weather[0].icon.slice(0, -1),
                    // icon: `http://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`
                  },
                });
              }
            }

            console.log('DATAAA', this.data);
          });

        // this.data = this.weatherService.getCurrentData(position.coords.latitude,position.coords.longitude);
        // console.log("DATA TO BE DISPLAYED",this.data);
        // // this.data = JSON.stringify(rawData);

        this.lineChartData = [{ data: this.data.hourly.temp }];
        this.lineChartLabels = this.data.hourly.time;
      }, this.showPositionError);
    } else {
      console.log('Geolocation is not supported by this browser.');
      //TODO : display message
    }
  }

  showPosition(position) {
    console.log(
      'Latitude: ',
      position.coords.latitude,
      'Longitude: ',
      position.coords.longitude
    );

    // console.log("woohoo2", this);
    // ala();

    // this.weatherService.getCurrentData(position.coords.latitude,position.coords.longitude)
    //   .subscribe(data => {
    //     this.data = data;
    //     console.log("DATAAA", this.data);
    //   });
  }

  showPositionError(err) {
    console.warn(`ERROR(${err.code}): ${err.message}`);
  }
}
