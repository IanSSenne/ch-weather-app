const cityEl = document.querySelector("#city");
const appId = "4b6cdb20f7f199d950956bcf56add37b";
let knownCities = [];
if (localStorage.getItem("knownCities")) {
	knownCities = JSON.parse(localStorage.getItem("knownCities"));
}

function getIconImage(iconCode) {
	let image = new Image();
	image.src = `http://openweathermap.org/img/wn/${iconCode}@2x.png`;
	return image;
}

const getWeather = async (city) => {
	const [{ lat, lon }] = await fetch(
		`http://api.openweathermap.org/geo/1.0/direct?limit=1&q=${city}&appid=${appId}`
	).then((response) => response.json());
	const endpoint = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${appId}&units=imperial`;

	return Promise.all([
		fetch(endpoint).then((response) => response.json()),
		fetch(
			`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${appId}&units=imperial`
		).then((response) => response.json()),
	]).then(([list, current]) => {
		return { list: list.list, city: list.city, current };
	});
};

const renderWeather = async (cityName) => {
	const { list, city, current } = await getWeather(cityName);

	const usefulList = list.filter((item) => item.dt_txt.includes("12:00:00"));
	const weatherEl = document.querySelector("#weather");
	const forecastEl = document.querySelector("#forecast");
	const cityEl = document.createElement("h1");
	cityEl.innerText = city.name;
	weatherEl.innerHTML = "";
	weatherEl.appendChild(cityEl);

	const currentWeatherEl = document.createElement("div");
	currentWeatherEl.classList.add("current-weather");
	currentWeatherEl.appendChild(getIconImage(current.weather[0].icon));
	const currentTempEl = document.createElement("h2");
	currentTempEl.innerText = `${Math.round(current.main.temp)}°`;
	const currentWeatherTitleEl = document.createElement("h3");
	currentWeatherTitleEl.innerText = current.weather[0].description;
	currentWeatherEl.appendChild(currentTempEl);
	currentWeatherEl.appendChild(currentWeatherTitleEl);
	weatherEl.appendChild(currentWeatherEl);

	const renderWeatherItem = (item) => {
		const { dt_txt, main, weather } = item;
		const [date, time] = dt_txt.split(" ");

		const weatherItemEl = document.createElement("div");
		weatherItemEl.classList.add("weather-item");

		weatherItemEl.appendChild(getIconImage(weather[0].icon));
		const dateEl = document.createElement("h2");
		dateEl.innerText = date;

		const timeEl = document.createElement("h3");
		timeEl.innerText = time;

		const tempEl = document.createElement("h3");
		tempEl.innerText = `${Math.round(main.temp)}°`;

		const weatherTitleEl = document.createElement("h3");
		weatherTitleEl.innerText = weather[0].main;

		weatherItemEl.appendChild(dateEl);
		weatherItemEl.appendChild(timeEl);
		weatherItemEl.appendChild(tempEl);
		weatherItemEl.appendChild(weatherTitleEl);

		return weatherItemEl;
	};

	usefulList.forEach((item) => {
		forecastEl.appendChild(renderWeatherItem(item));
	});
};

function renderKnownCities() {
	const knownCitiesEl = document.querySelector("#known-cities");
	knownCitiesEl.innerHTML = "";
	knownCities.forEach((city) => {
		const cityEl = document.createElement("button");
		cityEl.classList.add("known-city");
		cityEl.innerText = city;
		cityEl.addEventListener("click", () => renderWeather(city));
		knownCitiesEl.appendChild(cityEl);
	});
}

document.querySelector("#submit").addEventListener("click", () => {
	const city = cityEl.value;
	renderWeather(city);

	if (knownCities.includes(city)) return;
	knownCities.unshift(city);
	if (knownCities.length > 5) knownCities.pop();
	renderKnownCities();
	localStorage.setItem("knownCities", JSON.stringify(knownCities.slice(-5)));
});
renderKnownCities();
