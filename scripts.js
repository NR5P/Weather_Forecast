const form = document.querySelector("#form");
let longitude = document.querySelector("#longitude");
let latitude = document.querySelector("#latitude");
let user_location = document.querySelector("#location");
const location_list = document.querySelector("#location-list");

const todays_forecast = document.querySelector("#today-forecast");
const ten_day_forecast = document.querySelector("#ten-day-forecast");

//***************************************EVENT LISTENERS**************************************************************
/*
for a general submission with longitude and latitude cordinance
 */
document.querySelector("#submit").addEventListener("click",
    function (e) {
        alertIfEmpty(longitude, latitude); // alert if there is no input for longitude or  latitude

        // if they user put a name add it to list for quicker access later
        if (user_location.value.trim() !== "") {
            add_location();
        }

        if (longitude.value !== "" && latitude.value !== "") {
            run_api_request();
        }

        e.preventDefault()
    });

/*
delete li for town locations if the user clicks on the delete icon
 */
location_list.addEventListener("click", function (e) {
    if (e.target.parentElement.classList.contains("delete")) {
        e.target.parentElement.parentElement.remove();

        // remove from local storage
        removeCityFromLocalStorage(e.target.parentElement.parentElement);
    } else if (e.target.classList.contains("li-location")) {
        let cities = JSON.parse(localStorage.getItem("cities"));

        cities.forEach(function (city) {
            if (e.target.textContent === city[0]) {
                user_location.value = city[0];
                longitude.value = city[1];
                latitude.value = city[2];

                run_api_request();
            }
        })
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
         li.appendChild(document.createTextNode(city[0]));

         const delete_link = document.createElement("a");
         delete_link.className = "delete";
         delete_link.innerHTML = "<i class='delete-icon'></i>";
         li.appendChild(delete_link);

         // append li to ul
         location_list.appendChild(li);

     })
});

document.querySelector("#clear-btn").addEventListener("click", function () {
    user_location.value = "";
    longitude.value = "";
    latitude.value = "";
});
//******************************************END EVENT LISTENERS********************************************************

/*
add location of user to list if they put a name
 */
function add_location() {
    // create new list item link for users location
    let li = document.createElement("li");
    li.className = "li-location"; //TODO make li a link to click on. And have it add long and lat when clicked
    li.appendChild(document.createTextNode(user_location.value));

    // create delete link item
    const delete_link = document.createElement("a");
    delete_link.className = "delete";
    delete_link.innerHTML = "<i class='delete-icon'></i>";
    li.appendChild(delete_link);

    // append li to ul
    location_list.appendChild(li);

    storeCityInLocalStorage(user_location.value, longitude.value, latitude.value);
}

/*
store city in local storage
 */
function storeCityInLocalStorage(city, longitude, latitude) {
    let cities;
    if (localStorage.getItem("cities") === null) {
        cities = [];
    } else {
        cities = JSON.parse(localStorage.getItem("cities"));
    }

    cities.push([city, longitude, latitude]);

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

function alertIfEmpty(long, lat) {
    if (long.value === "" || lat.value === "") {
        alert("need both longitude and latitude");
    }
}

function run_api_request() {
    let api_address = `https://api.weather.gov/points/${longitude.value},${latitude.value}`;
    fetch(api_address)
        .then(response => response.json())
        .then(weather_info => {
            put_forecast(weather_info);
            return fetch(weather_info.properties.forecast);
        })
        .then(response => response.json())
        .then(forecast_info => output_forecast_info(forecast_info))

        //.catch(err => console.log("there was an error: " + err))
}

function put_forecast(forecast) {
    const city = forecast.properties.relativeLocation.properties.city;
    const state = forecast.properties.relativeLocation.properties.state;

    if (todays_forecast.childNodes)
        todays_forecast.removeChild(todays_forecast.firstChild);
    let h3_city = document.createElement("h3");

    h3_city.textContent = `forecast for ${city}, ${state}`;
    todays_forecast.appendChild(h3_city);
}

function output_forecast_info(forecast) {
    for (let i = 0; i < 15; i++) {
        let h3_day = document.createElement("h3");
        let forecast_body = document.createElement("p");

        let thisDay = forecast.properties.periods[i].name; // ex this afternoon, this new years day, etc.
        let isDayTime = forecast.properties.periods[i].isDayTime; // returns bool
        let temp = forecast.properties.periods[i].temperature; // returns degree f
        let tempUnit = forecast.properties.periods[i].temperatureUnity; // F for fahrenheit
        let windSpeed = forecast.properties.periods[i].windSpeed; // ex: 10 - 15 mph
        let windDirection = forecast.properties.periods[i].windDirection; // ex: "N" or "S"
        let icon = forecast.properties.periods[i].icon;
        let shortForecast = forecast.properties.periods[i].ShortForecast; // ex: slight chance of showers and thunderstorms

        console.log(thisDay);

        h3_day.textContent = thisDay;
        forecast_body.innerHTML =
            `<p>the temperature ${thisDay} will be ${temp}${tempUnit}</p>
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


