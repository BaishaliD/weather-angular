import { Component, ElementRef, OnInit } from '@angular/core';
import { WeatherService } from './weather-widget.service';
import * as moment from 'moment';
import { ChartColor, ChartConfiguration, ChartDataSets, ChartOptions } from 'chart.js';
// import { Color, Label } from 'ng2-charts';

import { Label } from 'ng2-charts';


export interface Color {
  backgroundColor?: ChartColor;
  borderWidth?: number | number[];
  borderColor?: ChartColor;
  borderCapStyle?: string;
  borderDash?: number[];
  borderDashOffset?: number;
  borderJoinStyle?: string;
  pointBorderColor?: ChartColor;
  pointBackgroundColor?: ChartColor;
  pointBorderWidth?: number | number[];
  pointRadius?: number | number[];
  pointHoverRadius?: number | number[];
  pointHitRadius?: number | number[];
  pointHoverBackgroundColor?: ChartColor;
  pointHoverBorderColor?: ChartColor;
  pointHoverBorderWidth?: number | number[];
  pointStyle?: ChartColor;
  hoverBackgroundColor?: ChartColor;
  hoverBorderColor?: ChartColor;
  hoverBorderWidth?: number;
}


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
      wind_speed: 0,
      pressure: 0,
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

  lineChartData: ChartDataSets[];
  lineChartLabels: Label[];
  lineChartOptions: ChartOptions;
  lineChartColors: Color[];
  lineChartLegend = false;
  lineChartType = 'line';
  plugin: any[];

  constructor(private weatherService: WeatherService) {}

  ngOnInit(): void {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        this.weatherService
          .getCurrentData(position.coords.latitude, position.coords.longitude)
          .subscribe((data) => {
            this.data.location = data.name;
            this.data.dt = moment.unix(data.dt).format('h:mm a, dddd');
          });

        this.weatherService
          .getAllData(position.coords.latitude, position.coords.longitude)
          .subscribe((data) => {
            this.data.current.temp = data.current.temp;
            this.data.current.feels_like = data.current.feels_like;
            this.data.current.humidity = data.current.humidity;
            this.data.current.wind_speed = data.current.wind_speed;
            this.data.current.pressure = data.current.pressure;

            // if(data.current.hasOwnProperty('rain')){
            //   this.data.current.rain = data.current.rain["1h"]
            // }
            // if(data.current.hasOwnProperty('snow')){
            //   this.data.current.snow = data.current.snow["1h"]
            // }

            this.data.current.weather.id = data.current.weather[0].id;
            this.data.current.weather.icon = data.current.weather[0].icon.slice(0,-1);
            // this.data.current.weather.icon = `http://openweathermap.org/img/wn/${data.current.weather[0].icon}@2x.png`;
            this.data.current.weather.main = data.current.weather[0].main;
            this.data.current.weather.description =
              data.current.weather[0].description;

            for (let i = 0; i < data.hourly.length; i += 3) {
              this.data.hourly.time.push(
                moment.unix(data.hourly[i].dt).format('h:mm a')
              );
              this.data.hourly.temp.push(Math.round(data.hourly[i].temp));
            }

            for (let i = 0; i < data.daily.length; i++) {
              //data.daily.forEach((item) => {
              let item = data.daily[i];

              if (i == 0) {
                this.data.current.max = Math.round(item.temp.max);
                this.data.current.min = Math.round(item.temp.min);
              } else {
                this.data.daily.push({
                  date: moment.unix(item.dt).format('ddd'),
                  temp: {
                    max: Math.round(item.temp.max),
                    min: Math.round(item.temp.min),
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

        this.renderChart();

        // this.lineChartData = [{ data: this.data.hourly.temp }];
        // this.lineChartLabels = this.data.hourly.time;
      }, this.showPositionError);
    } else {
      console.log('Geolocation is not supported by this browser.');
      //TODO : display message
    }
  }

  renderChart() {

    var canvas = <HTMLCanvasElement>document.getElementById('chart');
    var ctx = canvas.getContext('2d');

    var data = this.data;
    var hourlyTemp = data.hourly.temp;

    this.lineChartOptions = {
      responsive: true,
      legend: {
        display: false,
      },
      events: [],
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
            ticks: {
              display: false,
              suggestedMax: hourlyTemp[hourlyTemp.length - 1] + 10,
            },
            gridLines: { display: false },
          },
        ],
      },
    };
    this.plugin = [
      {
        afterRender(chart) {
          ctx.font = '12px Arial';
          ctx.fillStyle = 'white';
          var dataset = data.hourly.temp;

          for (let i = 0; i < dataset.length; i++) {
            let xPos = chart.getDatasetMeta(0).data[i]._model.x - 10;
            let yPos = chart.getDatasetMeta(0).data[i]._model.y - 10;
            ctx.fillText(dataset[i] + '\u00B0', xPos, yPos);
          }
        },
      },
    ];


    // *ngIf="data.hourly.temp.length>0 && data.hourly.time.length>0"

    var gradient = canvas.getContext('2d').createLinearGradient(0, 0, 0, 120);
    gradient.addColorStop(0, 'white');
    gradient.addColorStop(1, 'rgba(0,0,0,0.5)');
    this.lineChartColors = [
      {
        borderColor: gradient,
        backgroundColor: gradient
      }
    ];
    this.lineChartLegend = false;
    this.lineChartType = 'line';
    this.lineChartData = [{ data: data.hourly.temp }];
    this.lineChartLabels = data.hourly.time;

  }

  // ngAfterViewInit(){
  //   var c = <HTMLCanvasElement> document.getElementById("chart");
  //   var ctx = c.getContext("2d");
  //   ctx.font = "30px Arial";
  //   ctx.fillText("Hello World",10,50);
  // }

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
