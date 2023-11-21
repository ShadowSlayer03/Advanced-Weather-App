require('dotenv').config();
let express = require('express');
let bodyParser = require('body-parser');
const { getJson } = require("serpapi");
const fetch = require('node-fetch');
const axios = require('axios');
const port = 3000;

var apiResultImg,location,from,latitude,longitude,currentTempC,currentTempF,cloudPercentage,isDay,weatherDesc,tempUnit;
var humidity,visibilityRange,uvIndex,windDirection,windSpeed,aqi,precipitation,localDay,localTime,sunriseTime,sunsetTime,daysData;

let app = express();
app.use(express.static('public'));
app.use(bodyParser.json());
app.set('view engine', 'ejs');

// Define a route to handle the POST request
 app.post('/location', (req, res) => {
   // Access the data from the request body

  console.log(req.body.lat,req.body.long);
  latitude = req.body.lat;
  longitude = req.body.long;

   var requestOptions = {
   method: 'GET',
    };

  fetch(`https://api.geoapify.com/v1/geocode/reverse?lat=${latitude}&lon=${longitude}&apiKey=${process.env.GEO_API_KEY}`, requestOptions)
  .then(response => response.json())
  .then(result => {
    if (result.features.length) 
    {
     location = result.features[0].properties.city;
     res.redirect(`/get-weather?location=${location}&from=geo&unit=c`);
     console.log(location);
    } 
    else 
    {
      console.log("No address found");
    }
  })
  .catch(error =>{
    console.log("Error occurred: ",error);
  })
 });



// app.post('/location', (req, res) => {
//   // Access the data from the request body
//   const latitude = Number(req.query.lat);
//   const longitude = Number(req.query.long);

//   console.log(req.query.lat,req.query.long);

//   var requestOptions = {
//       method: 'GET',
//   };

//   fetch(`https://api.geoapify.com/v1/geocode/reverse?lat=${latitude}&lon=${longitude}&apiKey=${process.env.GEO_API_KEY}`, requestOptions)
//       .then(response => response.json())
//       .then(result => {
//           console.log(result);
//           if (result.features.length) {
//               const location = result.features[0].properties.city;
//               console.log(location);
//               res.redirect(`/get-weather?location=${location}`);
//           } else {
//               console.log("No address found");
//               // Handle the case where no address is found, e.g., send an error response
//               res.status(404).send("No address found");
//           }
//       })
//       .catch(error => {
//           // Handle errors, e.g., send an error response
//           console.error(error);
//           res.status(500).send("Error fetching location data");
//       });
// });


app.get('/', (req, res) => {
    res.render('home');
  })

app.get('/get-weather', async(req, res) => {
      location = req.query.location;
      from = req.query.from;
      tempUnit = req.query.unit;
      console.log("Insider server.js: ",tempUnit);
      if(from=="search")
      {
        //Reverse geocode and store the lat and long
        console.log("Inside Search:");
        let requestOptions = {
          method: 'GET',
        };
        
        await fetch(`https://api.geoapify.com/v1/geocode/search?text=${location}&lang=en&limit=10&type=city&apiKey=${process.env.GEO_API_KEY}`, requestOptions)
          .then(response => response.json())
          .then(result => {
            //console.log("Geocoding results",result);
            let coordinates = result.features[0].geometry.coordinates;
            latitude = coordinates[1];
            longitude = coordinates[0];            
          })
          .catch(error => console.log('error', error));
      }

      async function findImgUrl(loc) {
        try {
            console.log("Inside findImgUrl - Before API Call");
            let imagePath = await getJson({
                engine: "google_images",
                q: `${loc}+city+4k+pictures+landscape -site:shutterstock.com -site:freepik.com`,
                api_key: process.env.SERP_API_KEY,
            });
    
            if (imagePath.images_results[0].type === 'image') {
                apiResultImg = imagePath.images_results[0].original;
            } else if (imagePath.images_results[1]) {
                apiResultImg = imagePath.images_results[1].original;
            } else {
                apiResultImg = null;
            }
            console.log("Inside findImgUrl", apiResultImg, loc);
        } catch (error) {
            // Handle errors
            console.error("Error inside findImgUrl:", error);
            apiResultImg = null;
        }
    }


async function getWeatherDetailsDayandWeek()
{
  function getDayfromDate(dateAndTimeString)
  {
    let presentDate = dateAndTimeString.split(" ")[0];
    let dateObject = new Date(presentDate);
    let day = dateObject.getDay();  // 0 is Sunday and 6 is Saturday

    let daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    return daysOfWeek[day];
  }
  let weatherApiUrl = `https://api.weatherapi.com/v1/forecast.json?key=${process.env.WEATHER_API_KEY}&q=${latitude},${longitude}&aqi=yes&days=8`;
  await axios.get(weatherApiUrl)
  .then(response=>{
    localDay = getDayfromDate(response.data.location.localtime)
    localTime = response.data.location.localtime.split(" ")[1];
    currentTempC = response.data.current.temp_c;
    currentTempF = response.data.current.temp_f;
    weatherDesc = response.data.current.condition.code;
    isDay = response.data.current.is_day;
    cloudPercentage = response.data.current.cloud;
    humidity = response.data.current.humidity;
    visibilityRange = response.data.current.vis_km;
    uvIndex = response.data.current.uv;
    windDirection = response.data.current.wind_dir;
    windSpeed = response.data.current.wind_kph;
    aqi = response.data.current.air_quality['us-epa-index'];
    precipitation = response.data.forecast.forecastday[0].day.daily_chance_of_rain;
    sunriseTime = response.data.forecast.forecastday[0].astro.sunrise;
    sunsetTime =  response.data.forecast.forecastday[0].astro.sunset;
    daysData
    =[
      response.data.forecast.forecastday[0],response.data.forecast.forecastday[1],response.data.forecast.forecastday[2],response.data.forecast.forecastday[3],
    response.data.forecast.forecastday[4],response.data.forecast.forecastday[5],response.data.forecast.forecastday[6],response.data.forecast.forecastday[7]
    ]
  })
  .catch(error=>{
    console.log(error)
  });
}

async function renderWeatherPage(req, res) {
      await findImgUrl(location); // Fetch the image URL
      await getWeatherDetailsDayandWeek();

      res.render("weather", {
          loc: location,
          day: localDay,
          time: localTime,
          unit: tempUnit,
          imgUrl: apiResultImg,
          temp_c: Math.round(currentTempC),
          temp_f: Math.round(currentTempF),
          cloudPercent: cloudPercentage,
          humid: humidity,
          visibility: visibilityRange,
          uv: uvIndex,
          windDir: windDirection,
          windKPH: windSpeed,
          AQI :aqi,
          rain: precipitation,
          sunrise: sunriseTime,
          sunset: sunsetTime,
          daysInfo: daysData,
          weatherCode: weatherDesc,
          is_day: isDay,
      });
    }
    renderWeatherPage(req,res);
});
  
app.listen(port, () => {
    console.log(`App successfully hosted at http://localhost:3000`);
  })