// Get latitude and longitude by clicking on the 'Location Pin' icon
const getLocationButton = document.getElementById('get-location');
const currentDaySpan = document.querySelector("#current-day-span")

let latitude = 0, longitude = 0;

getLocationButton.addEventListener('click', () => {
  if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(function(position) {
      latitude = position.coords.latitude;
      longitude = position.coords.longitude;

      console.log(`Latitude: ${latitude}, Longitude: ${longitude}`);
      
      // Sending latitude and longitude to the server
      const data = {
        lat: latitude,
        long: longitude,
      };

      const url = '/location'; // Update with your actual endpoint URL
      fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
      .then((location) => {
          console.log(location);
          console.log("Response Ok");
          window.location.href = location.url;
      })
      .catch((error) => {
        console.log("Response Not Ok", error);
      });
    });
  }
});
//    fetch(url, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(data),
//       })
//        .then((response) => {
//          if (response.ok) {
//            return response.json();
//          } else {
//            throw new Error('Network response was not ok.');
//          }
//        })
//        .then((responseJson) => {
//          console.log(responseJson);
//        })
//        .catch((error) => {
//          console.error('Error:', error);
//        });
//     });
//   } else {
//     alert("Geolocation is not supported by your browser.");
//   }


// Search for any location and then use "Enter" key or click the "Search" icon to search
const celsiusBtn = document.querySelectorAll("#toggle-units h2")[0];
const fahrenheitBtn = document.querySelectorAll("#toggle-units h2")[1];
const searchIcon = document.getElementById('search-icon');
const searchInput = document.getElementById('search-input');

let inputValue=0, unit;
// Add a click event listener to the search icon
searchIcon.addEventListener('click', () => {
  inputValue = searchInput.value;
  if (inputValue) 
  {
    // Construct the URL for your "get-weather" route with the input value
    if(celsiusBtn.classList.contains("active"))
    unit = "c";
    else if(fahrenheitBtn.classList.contains("active"))
    unit = "f";

    const url = `/get-weather?location=${inputValue}&from=search&unit=${unit}`;
    window.location.href = url;
  }
  else
  {
    alert("Enter a location");
  }    
});

searchInput.addEventListener('keydown',(e)=>{
  if(e.key=="Enter")
  {
    inputValue = searchInput.value;
    if (inputValue) 
    {
      // Construct the URL for your "get-weather" route with the input value
      if(celsiusBtn.classList.contains("active"))
      unit = "c";
      else if(fahrenheitBtn.classList.contains("active"))
      unit = "f";
  
      const url = `/get-weather?location=${inputValue}&from=search&unit=${unit}`;
      window.location.href = url;
    }
    else
    {
      alert("Enter a location");
    }    
  }
});

//Switch between celsius and fahrenheit
celsiusBtn.addEventListener('click',()=>{
  celsiusBtn.classList.add("active");
  fahrenheitBtn.classList.remove("active");
  var queryString = window.location.search;

  // Function to extract the value of a parameter from the query string
  function getParameterValue(queryString, parameterName) {
      var params = new URLSearchParams(queryString);
      return params.get(parameterName);
  }
  
  // Extract the value of the "location" parameter
  var locationValue = getParameterValue(queryString, "location");
  
  // Log the result
  console.log("Location:", locationValue);
  const url = `/get-weather?location=${locationValue}&from=search&unit=c`;
  window.location.href = url;
})

fahrenheitBtn.addEventListener('click',()=>{
  fahrenheitBtn.classList.add("active");
  celsiusBtn.classList.remove("active");
  console.log(window.location.search);
  var queryString = window.location.search;

  // Function to extract the value of a parameter from the query string
  function getParameterValue(queryString, parameterName) {
      var params = new URLSearchParams(queryString);
      return params.get(parameterName);
  }
  
  // Extract the value of the "location" parameter
  var locationValue = getParameterValue(queryString, "location");
  
  // Log the result
  console.log("Location:", locationValue);
  const url = `/get-weather?location=${locationValue}&from=search&unit=f`;
  window.location.href = url;
})

// Switch between today's forecast and weekly forecast
const todayBtn = document.querySelectorAll("#toggle-forecast h2")[0];
const weekBtn = document.querySelectorAll("#toggle-forecast h2")[1];
const forecastPaletteWeek = document.querySelector("#forecast-palette-week");
const forecastPaletteToday = document.querySelector("#forecast-palette-today");

todayBtn.addEventListener('click',()=>{
    todayBtn.classList.add("active");
    weekBtn.classList.remove("active");
    forecastPaletteWeek.style.display = "none";
    forecastPaletteToday.style.display = "flex";
})

weekBtn.addEventListener('click',()=>{
    weekBtn.classList.add("active");
    todayBtn.classList.remove("active");
    forecastPaletteWeek.style.display = "flex";
    forecastPaletteToday.style.display = "none";
})

