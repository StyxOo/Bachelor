const countryDataTable = document.getElementById('countryDataTable')
const dailyDataTable = document.getElementById('dailyDataTable')

const triggerDailyData = checkbox => {
    dailyDataTable.hidden = !checkbox.checked
}

const triggerCountryData = checkbox => {
    countryDataTable.hidden = !checkbox.checked
}