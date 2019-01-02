let longitude = document.querySelector("#longitude");
let latitude = document.querySelector("#latitude");
let city = document.querySelector("#location-city");
let state = document.querySelector("#location-state");
const location_list = document.querySelector("#location-list");

// selectors for the divs where weather information will go
const todays_forecast = document.querySelector("#today-forecast");
const ten_day_forecast = document.querySelector("#ten-day-forecast");

const googleApiKey = document.querySelector("#apiKey");

//***************************************EVENT LISTENERS**************************************************************
/*
for a general submission with longitude and latitude coordinates
 */
document.querySelector("#submit").addEventListener("click",
    function (e) {
        if (city.value.trim() !== "" && state.value.trim() !== "") {
            add_location();
        } else {
            alert("need city and state!");
        }

        e.preventDefault()
    });

/*
delete li for town locations if the user clicks on the delete icon and populate information from local storage
into the text inputs and get weather info  if they click on the city text
 */
location_list.addEventListener("click", function (e) {
    if (e.target.parentElement.classList.contains("delete")) {
        e.target.parentElement.parentElement.remove();

        // remove from local storage
        removeCityFromLocalStorage(e.target.parentElement.parentElement);

    // if the user clicks on the text of the city the contents will be filled in to the form and will look up weather
    } else if (e.target.classList.contains("li-location")) {
        let cities = JSON.parse(localStorage.getItem("cities"));

        cities.forEach(function (item) {
            if (e.target.textContent === item[0] + ", " + item[1]) {
                city.value = item[0];
                state.value = item[1];
                longitude.value = item[2];
                latitude.value = item[3];
            }
        });
        run_api_request(); // run api request and get the weather
    }
});

/*
DOM load even to load any saved locations in local storage into location list
 */
document.addEventListener("DOMContentLoaded", function () {
     let cities;
     if (localStorage.getItem("cities") === null) {
         cities = [];
     } else {
         cities = JSON.parse(localStorage.getItem("cities"));
     }

     cities.forEach(function (city) {
         let li = document.createElement("li");
         li.className = "li-location";
         li.appendChild(document.createTextNode(city[0] + ", " + city[1]));

         const delete_link = document.createElement("a");
         delete_link.className = "delete";
         delete_link.innerHTML = "<i class='delete-icon'></i>";
         li.appendChild(delete_link);

         // append li to ul
         location_list.appendChild(li);

     })
});

// if clear clear entire form input except for api key
document.querySelector("#clear-btn").addEventListener("click", function () {
    city.value = "";
    state.value = "";
    longitude.value = "";
    latitude.value = "";
});

// button to save a new google api key
document.querySelector("#apikey-btn").addEventListener("click", function() {
    if (localStorage.getItem("apiKey") !== null) {
        localStorage.removeItem("apiKey");
    }
    localStorage.setItem("apiKey", googleApiKey.value);
});

window.onload = function() {
    if (localStorage.getItem("apiKey") !== null) {
        googleApiKey.value = JSON.parse(localStorage.getItem("apiKey"));
    }
    else {
        googleApiKey.value = "need api key";
    }
};
//******************************************END EVENT LISTENERS********************************************************

/*
add city and state to list
 */
function add_location() {
    // create new list item link for users location
    let user_location = `${city.value}, ${state.value}`;
    let li = document.createElement("li");
    li.className = "li-location";
    li.appendChild(document.createTextNode(user_location));

    // create delete link item
    const delete_link = document.createElement("a");
    delete_link.className = "delete";
    delete_link.innerHTML = "<i class='delete-icon'></i>";
    li.appendChild(delete_link);

    // append li to ul
    location_list.appendChild(li);

    storeCityInLocalStorage(city.value, state.value, longitude.value, latitude.value);
}

/*
store city in local storage
 */
function storeCityInLocalStorage(city, state, longitude, latitude) {
    let cities;
    if (localStorage.getItem("cities") === null) {
        cities = [];
    } else {
        cities = JSON.parse(localStorage.getItem("cities"));
    }

    cities.push([city, state, longitude, latitude]);

    localStorage.setItem("cities", JSON.stringify(cities));
}

function removeCityFromLocalStorage(cityItem) {
    let cities;
    if (localStorage.getItem("cities") === null) {
        cities = [];
    } else {
        cities = JSON.parse(localStorage.getItem("cities"));
    }

    cities.forEach(function(city, index) {
        if (cityItem.textContent === city[0]) {
            cities.splice(index, 1);
        }
    });
    localStorage.setItem("cities",JSON.stringify(cities));
}

function getGoogleApiInfo() {
    let api_address = `https://maps.googleapis.com/maps/api/geocode/json?address=${city.value}+${state.value}&key=%20${googleApiKey.value}`;
    fetch(api_address)
        .then(response => response.json())
        .then(responseJson => {
            longitude.value = responseJson.results[0].geometry.location.lat;
            latitude.value = responseJson.results[0].geometry.location.lng;
    })
}

function run_api_request() {
    getGoogleApiInfo();
    let api_address = `https://api.weather.gov/points/${longitude.value},${latitude.value}`;
    fetch(api_address)
        .then(response => response.json())
        .then(weather_info => {
            put_forecast(weather_info);
            return fetch(weather_info.properties.forecast);
        })
        .then(response => response.json())
        .then(forecast_info =>  {
            output_forecast_info(forecast_info);
        })

        //.catch(err => console.log("there was an error: " + err))
}

function put_forecast(forecast) {
    const city = forecast.properties.relativeLocation.properties.city;
    const state = forecast.properties.relativeLocation.properties.state;

    while (todays_forecast.firstChild)
        todays_forecast.removeChild(todays_forecast.firstChild);
    let h3_city = document.createElement("h3");

    h3_city.textContent = `forecast for ${city}, ${state}`;
    todays_forecast.appendChild(h3_city);
}

/*
loops 14 times to make 14 divs to show todays and future forecasts
 */
function output_forecast_info(forecast) {
    while (ten_day_forecast.firstChild)
        ten_day_forecast.removeChild(ten_day_forecast.firstChild);
    for (let i = 0; i < 15; i++) {
        let h3_day = document.createElement("h3");
        let forecast_body = document.createElement("p");

        let thisDay = forecast.properties.periods[i].name; // ex this afternoon, this new years day, etc.
        let isDayTime = forecast.properties.periods[i].isDayTime; // returns bool
        let temp = forecast.properties.periods[i].temperature; // returns degree f
        let tempUnit = forecast.properties.periods[i].temperatureUnit; // F for fahrenheit
        let windSpeed = forecast.properties.periods[i].windSpeed; // ex: 10 - 15 mph
        let windDirection = forecast.properties.periods[i].windDirection; // ex: "N" or "S"
        let icon = forecast.properties.periods[i].icon;
        let shortForecast = forecast.properties.periods[i].shortForecast; // ex: slight chance of showers and thunderstorms

        h3_day.textContent = thisDay;
        forecast_body.innerHTML =
            `<p>the temperature ${thisDay} will be ${temp}\xB0${tempUnit}</p>
             <p>wind speed: ${windSpeed}</p>
             <p>wind direction: ${windDirection}</p>
             <p>short forecast: ${shortForecast}</p>`;

        let ten_day_forecast_div = document.createElement("div");
        ten_day_forecast_div.appendChild(h3_day) ;
        ten_day_forecast_div.appendChild(forecast_body);
        ten_day_forecast.appendChild(ten_day_forecast_div);
    }
}

//TODO look up adding image icons from nws api
//TODO use google api for a map


