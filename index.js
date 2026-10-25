const weatherApi = "https://api.weather.gov/alerts/active?area="

async function fetchWeatherAlerts(stateAbbreviation) {
  const response = await fetch(`${weatherApi}${encodeURIComponent(stateAbbreviation)}`)

  if (!response.ok) {
    throw new Error(`Unable to fetch weather alerts (HTTP ${response.status}).`)
  }

  const data = await response.json()
  if (!data || !Array.isArray(data.features)) {
    throw new Error("The weather service returned an invalid response.")
  }

  return data
}

function initializeWeatherAlertsApp() {
  const stateInput = document.getElementById("state-input")
  const fetchButton = document.getElementById("fetch-alerts")
  const alertsDisplay = document.getElementById("alerts-display")
  const errorMessage = document.getElementById("error-message")

  if (!stateInput || !fetchButton || !alertsDisplay || !errorMessage) {
    return
  }

  fetchButton.addEventListener("click", async () => {
    const stateAbbreviation = stateInput.value.trim().toUpperCase()
    stateInput.value = ""
    alertsDisplay.replaceChildren()
    errorMessage.textContent = ""
    errorMessage.classList.add("hidden")

    if (!/^[A-Z]{2}$/.test(stateAbbreviation)) {
      errorMessage.textContent = "Enter a valid two-letter U.S. state abbreviation."
      errorMessage.classList.remove("hidden")
      stateInput.focus()
      return
    }

    try {
      const data = await fetchWeatherAlerts(stateAbbreviation)
      const summary = document.createElement("p")
      summary.textContent = `${data.title || "Weather Alerts"}: ${data.features.length}`
      const headlines = document.createElement("ul")

      data.features.forEach((alert) => {
        const headline = alert && alert.properties && alert.properties.headline
        if (typeof headline === "string" && headline.trim()) {
          const item = document.createElement("li")
          item.textContent = headline
          headlines.append(item)
        }
      })

      alertsDisplay.append(summary, headlines)
    } catch (error) {
      errorMessage.textContent = error instanceof Error
        ? error.message
        : "An unexpected error occurred while fetching weather alerts."
      errorMessage.classList.remove("hidden")
    }
  })
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeWeatherAlertsApp)
} else {
  initializeWeatherAlertsApp()
}