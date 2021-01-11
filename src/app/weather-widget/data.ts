export interface Data{
    current : {
        temp: number,
        feels_like: number,
        humidity: number,
        rain: any,
        snow: any,
        weather: {
          id: number,
          icon: string,
          main: string,
          description: string
        }
      }
}