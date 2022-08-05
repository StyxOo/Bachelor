const DailyDataPath = './total_per_day/total_refugees_daily_condensed.csv';

const dailyTBody = document.getElementById('tBody-daily')
const sliderStartLabel = document.getElementById('startDate')
const sliderCurrentLabel = document.getElementById('currentDate')
const sliderEndLabel = document.getElementById('endDate')

/**
 * This section creates a new row in the data table using a given country name and refugee count.
 * It is used to fill the table in the beginning, after loading the data, as well as when creating a new table row.
 */
const fillTable = data => {
    data.forEach(d => {
        addDay(d.date, false, d.refugees)
    })
}

const lerp = (a, b, t) => {
    return (1 - t) * a + t * b;
}

const updateSliderLimits = () => {
    const startDate = new Date(latestDailyData[0].date)
    const endDate = new Date(latestDailyData[latestDailyData.length-1].date)

    sliderStartLabel.textContent = dateToDisplay(startDate)

    const startMillis = startDate.valueOf()
    const endMillis = endDate.valueOf()
    const currentMillis = lerp(startMillis, endMillis, timeValue())

    sliderCurrentLabel.textContent = dateToDisplay(new Date(currentMillis))
    sliderEndLabel.textContent = dateToDisplay(endDate)
}

const removeFirstDay = () => {
    dailyTBody.removeChild(dailyTBody.firstChild)

    if (autoUpdateDaily) {
        updateDailyData()
    }
}

const removeLastDay = () => {
    dailyTBody.removeChild(dailyTBody.lastChild)

    if (autoUpdateDaily) {
        updateDailyData()
    }
}


const dateToDisplay = date => {
    const day = date.getDate()
    const month = date.getMonth() + 1
    const year = date.getFullYear()

    let dayString = day
    if (day < 10) {
        dayString = '0' + dayString
    }

    let monthString = month
    if (month < 10) {
        monthString = '0' + monthString
    }

    return [dayString, monthString, year].join('-')
}

const displayToDate = display => {
    const values = display.split('-')
    return new Date(+values[2], +values[1] - 1, +values[0])
}

let autoUpdateDaily = false

const autoUpdateDailyData = checkbox => {
    autoUpdateDaily = checkbox.checked
}

const addDayBefore = () => {
    const currentNewestDate = displayToDate(dailyTBody.firstChild.firstChild.firstChild.value)
    let dayBefore = new Date(currentNewestDate.getTime());
    dayBefore.setDate(currentNewestDate.getDate() - 1);
    addDay(dayBefore, true)

    if (autoUpdateDaily)
    {
        updateDailyData()
    }
}

const addDayAfter = (date = "Country name", refugees= 0) => {
    const currentLatestDate = displayToDate(dailyTBody.lastChild.firstChild.firstChild.value)
    let dayAfter = new Date(currentLatestDate.getTime());
    dayAfter.setDate(currentLatestDate.getDate() + 1);
    addDay(dayAfter, false)

    if (autoUpdateDaily)
    {
        updateDailyData()
    }
}

const addDay = (date, addToBeginning, refugees = 0) => {
    const row = document.createElement('tr')
    row.className = 'dailyDataRow'
    const dateCell = document.createElement('td')
    const refugeesCell = document.createElement('td')

    const dateInput = document.createElement('input')
    dateInput.value = dateToDisplay(date)
    dateInput.setAttribute('readonly', '')
    const refugeesInput = document.createElement('input')
    refugeesInput.type = 'number'
    refugeesInput.onkeyup = () => {
        refugeesInput.value=refugeesInput.value.replace(/\D/,'')

        if (autoUpdateDaily)
        {
            updateDailyData()
        }
    }
    refugeesInput.value = refugees


    dateCell.appendChild(dateInput)
    refugeesCell.appendChild(refugeesInput)

    row.appendChild(dateCell)
    row.appendChild(refugeesCell)
    if (addToBeginning) {
        dailyTBody.prepend(row)
    } else {
        dailyTBody.appendChild(row)
    }
}



/**
 * This function is triggered by the 'Update Data' button at the bottom of the data table.
 * It creates a new data object, mimicking the original data read from the csv.
 * It also invokes the render function, updating the diagrams.
 */
let latestDailyData = undefined;

const updateDailyData = () => {
    console.log("Update data aka create new data element")
    const data = []
    const tableRows = document.getElementsByClassName('dailyDataRow');

    data.columns = ['date', 'refugees']

    for (let i = 0, row; row = tableRows[i]; i++) {
        const newLine = new Object({'date' : displayToDate(row.cells[0].children[0].value), 'refugees' : +row.cells[1].children[0].value})
        data.push(newLine)
    }

    console.log('Newly updated data set:')
    console.log(data)

    latestDailyData = data;
    updateSliderLimits()
    renderDailyDiagrams()
}

const timeSlider = document.getElementById('timeSlider')
timeSlider.addEventListener('change', (e) => {
    updateSliderLimits()
    renderDailyDiagrams()
})

const timeValue = () => {
    const value01 = timeSlider.value/100
    return value01
}

/**
 * The following allows the single diagrams to register their render functions as callbacks.
 * They will be invoked when the data changes.
 * The section with `window.` exposes the function to be callable by the diagrams using the `parent.` keyword.
 */
const dailyDiagramRenderCallbacks = []

window.registerDiagramRenderCallback = (callback) =>
{
    dailyDiagramRenderCallbacks.push(callback)

    /**
     * This will only happen, if the data was already loaded before the callback is getting registered.
     * If the callback is registered before the data is loaded, it will be called through the render call in the data loading.
     */
    if (latestDailyData !== undefined) {
        callback(latestDailyData)
    }
}

const renderDailyDiagrams = () => {
    console.log('Render diagrams through registered callbacks')
    for (const diagramRenderCallback of dailyDiagramRenderCallbacks) {
        diagramRenderCallback(latestDailyData, timeValue())
    }

    /**
     * Use the short section below to automatically change the data after 2 seconds
     */
    // setTimeout(()=>{
    //     latestData.pop()
    //
    //     for (const diagramRenderCallback of diagramRenderCallbacks) {
    //         diagramRenderCallback(latestData)
    //     }
    // }, 2000)
}

/**
 * The following loads the data from the csv and prefills the data table
 */

// .csv creates a promise, when it resolves .then do something else
d3.csv(DailyDataPath).then(data => {
    data.forEach(d => {                         // Foreach data-point in data
        d.refugees = +d.refugees;           // Cast value to float and take times 1000
        d.date = new Date(d.date);             // Kind of unnecessary, but fixed webstorm complaining
    });
    console.log('Loaded data:')
    console.log(data);
    fillTable(data);

    latestDailyData = data;
    updateSliderLimits()
    renderDailyDiagrams();
})
