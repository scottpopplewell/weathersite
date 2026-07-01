import { useState } from 'react'
import './App.css'

// Turns Open-Meteo's numeric weather codes into words + an emoji.
// Full list: https://open-meteo.com/en/docs (see "Weather variable documentation")
function describeWeather(code) {
  if (code === 0) return { text: 'Clear sky', emoji: '☀️' }
  if (code <= 2) return { text: 'Partly cloudy', emoji: '⛅' }
  if (code === 3) return { text: 'Overcast', emoji: '☁️' }
  if (code <= 48) return { text: 'Foggy', emoji: '🌫️' }
  if (code <= 57) return { text: 'Drizzle', emoji: '🌦️' }
  if (code <= 67) return { text: 'Rainy', emoji: '🌧️' }
  if (code <= 77) return { text: 'Snowy', emoji: '❄️' }
  if (code <= 82) return { text: 'Rain showers', emoji: '🌧️' }
  if (code <= 86) return { text: 'Snow showers', emoji: '🌨️' }
  return { text: 'Thunderstorm', emoji: '⛈️' }
}

function App() {
  const [city, setCity] = useState('')
  const [weather, setWeather] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSearch(event) {
    event.preventDefault()
    if (!city.trim()) return

    setLoading(true)
    setError('')
    setWeather(null)

    try {
      // Step 1: turn the city name into latitude/longitude coordinates.
      const geoResponse = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`
      )
      const geoData = await geoResponse.json()

      if (!geoData.results || geoData.results.length === 0) {
        setError(`Couldn't find a place called "${city}". Try another spelling?`)
        return
      }

      const { latitude, longitude, name, country } = geoData.results[0]

      // Step 2: use those coordinates to get the current weather.
      const weatherResponse = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&temperature_unit=fahrenheit&windspeed_unit=mph`
      )
      const weatherData = await weatherResponse.json()

      setWeather({
        place: `${name}, ${country}`,
        temperature: weatherData.current_weather.temperature,
        windSpeed: weatherData.current_weather.windspeed,
        ...describeWeather(weatherData.current_weather.weathercode),
      })
    } catch (err) {
      setError('Something went wrong fetching the weather. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app">
      <img src="/logo.svg" alt="IP + SP logo, a goose" width="160" />
      <h1>🌦️ Our Weather App</h1>
      <p className="subtitle">Type a city name to see what the weather is like right now.</p>

      <form onSubmit={handleSearch} className="search-form">
        <input
          type="text"
          value={city}
          onChange={(event) => setCity(event.target.value)}
          placeholder="e.g. Denver"
        />
        <button type="submit">Search</button>
      </form>

      {loading && <p>Loading...</p>}
      {error && <p className="error">{error}</p>}

      {weather && (
        <div className="weather-card">
          <h2>{weather.place}</h2>
          <p className="emoji">{weather.emoji}</p>
          <p className="temperature">{weather.temperature}°F</p>
          <p>{weather.text}</p>
          <p>Wind speed: {weather.windSpeed} mph</p>
        </div>
      )}
    </div>
  )
}

export default App
