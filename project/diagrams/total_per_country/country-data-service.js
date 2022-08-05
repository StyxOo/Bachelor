const countryDataPath = './total_per_country/total_refugees_per_country_condensed.csv';

const countryTBody = document.getElementById('tBody_per_country')

/**
 * This section creates a new row in the data table using a given country name and refugee count.
 * It is used to fill the table in the beginning, after loading the data, as well as when creating a new table row.
 */
const addCountryRow = (country = "Country name", refugees= 0) => {
    const row = document.createElement('tr')
    row.className = 'countryDataRow'
    const countryCell = document.createElement('td')
    const refugeesCell = document.createElement('td')
    const removeButtonCell = document.createElement('td')

    const countryInput = document.createElement('input')
    countryInput.value = country
    const refugeesInput = document.createElement('input')
    refugeesInput.type = 'number'
    refugeesInput.onkeyup = () => {
        refugeesInput.value = refugeesInput.value.replace(/\D/,'')
        if (autoUpdateCountry) {
            updateCountryData()
        }
    }
    refugeesInput.value = refugees

    const removeButton = document.createElement('button')
    removeButton.textContent = "Remove Row"
    removeButton.onclick= event => {removeCountryRow(event)}

    countryCell.appendChild(countryInput)
    refugeesCell.appendChild(refugeesInput)
    removeButtonCell.appendChild(removeButton)

    row.appendChild(countryCell)
    row.appendChild(refugeesCell)
    row.appendChild(removeButtonCell)
    countryTBody.appendChild(row)

    if (autoUpdateCountry) {
        updateCountryData()
    }
}

const fillCountryTable = data => {
    data.forEach(d => {
        addCountryRow(d.country, d.refugees)
    })
}

const removeCountryRow = (event) => {
    console.log(event)
    countryTBody.removeChild(event.target.parentElement.parentElement)

    if (autoUpdateCountry) {
        updateCountryData()
    }
}

let autoUpdateCountry = false

const autoUpdateCountryData = checkbox => {
    autoUpdateCountry = checkbox.checked
}

/**
 * This function is triggered by the 'Update Data' button at the bottom of the data table.
 * It creates a new data object, mimicking the original data read from the csv.
 * It also invokes the render function, updating the diagrams.
 */
let latestCountryData = undefined;

const updateCountryData = () => {
    console.log("Update data aka create new data element")
    const data = []
    const tableRows = document.getElementsByClassName('countryDataRow');

    data.columns = ['country', 'refugees']

    for (let i = 0, row; row = tableRows[i]; i++) {
        const newLine = new Object({'country' : row.cells[0].children[0].value, 'refugees' : +row.cells[1].children[0].value})
        data.push(newLine)
    }

    console.log('Newly updated data set:')
    console.log(data)

    latestCountryData = data;
    renderCountryDiagrams()
}

/**
 * The following allows the single diagrams to register their render functions as callbacks.
 * They will be invoked when the data changes.
 * The section with `window.` exposes the function to be callable by the diagrams using the `parent.` keyword.
 */
const countryDiagramRenderCallbacks = []

window.registerCountryDiagramRenderCallback = (callback) =>
{
    countryDiagramRenderCallbacks.push(callback)

    /**
     * This will only happen, if the data was already loaded before the callback is getting registered.
     * If the callback is registered before the data is loaded, it will be called through the render call in the data loading.
     */
    if (latestCountryData !== undefined) {
        callback(latestCountryData)
    }
}

const renderCountryDiagrams = () => {
    console.log('Render diagrams through registered callbacks')
    for (const diagramRenderCallback of countryDiagramRenderCallbacks) {
        diagramRenderCallback(latestCountryData)
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
d3.csv(countryDataPath).then(data => {
    data.forEach(d => {                         // Foreach data-point in data
        d.refugees = +d.refugees;           // Cast value to float and take times 1000
        d.country = `${d.country}`;             // Kind of unnecessary, but fixed webstorm complaining
    });
    console.log('Loaded data:')
    console.log(data);
    fillCountryTable(data);

    latestCountryData = data;
    renderCountryDiagrams();
})
