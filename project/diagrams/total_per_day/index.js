const dataPath = './total_refugees_daily_condensed.csv';

const tBody = document.getElementById('tBody')

/**
 * This section creates a new row in the data table using a given country name and refugee count.
 * It is used to fill the table in the beginning, after loading the data, as well as when creating a new table row.
 */
const addRow = (country = "Country name", refugees= 0) => {
    const row = document.createElement('tr')
    row.className = 'dataRow'
    const dateCell = document.createElement('td')
    const refugeesCell = document.createElement('td')
    const removeButtonCell = document.createElement('td')

    const countryInput = document.createElement('input')
    countryInput.value = country
    const refugeesInput = document.createElement('input')
    refugeesInput.type = 'number'
    refugeesInput.onkeyup = () => {refugeesInput.value=refugeesInput.value.replace(/\D/,'')}
    refugeesInput.value = refugees

    const removeButton = document.createElement('button')
    removeButton.textContent = "Remove Row"
    removeButton.onclick= event => {removeRow(event)}

    dateCell.appendChild(countryInput)
    refugeesCell.appendChild(refugeesInput)
    removeButtonCell.appendChild(removeButton)

    row.appendChild(dateCell)
    row.appendChild(refugeesCell)
    row.appendChild(removeButtonCell)
    tBody.appendChild(row)
}

const fillTable = data => {
    data.forEach(d => {
        addRow(d.date, d.refugees)
    })
}

const removeRow = (event) => {
    console.log(event)
    tBody.removeChild(event.target.parentElement.parentElement)
    // updateData();
}


/**
 * This function is triggered by the 'Update Data' button at the bottom of the data table.
 * It creates a new data object, mimicking the original data read from the csv.
 * It also invokes the render function, updating the diagrams.
 */
let latestData = undefined;

const updateData = () => {
    console.log("Update data aka create new data element")
    const data = []
    const tableRows = document.getElementsByClassName('dataRow');

    data.columns = ['date', 'refugees']

    for (let i = 0, row; row = tableRows[i]; i++) {
        const newLine = new Object({'date' : row.cells[0].children[0].value, 'refugees' : +row.cells[1].children[0].value})
        data.push(newLine)
    }

    console.log('Newly updated data set:')
    console.log(data)

    latestData = data;
    render()
}

const timeSlider = document.getElementById('timeSlider')
console.log(timeSlider)
timeSlider.addEventListener('change', (e) => {
    render()
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
const diagramRenderCallbacks = []

window.registerDiagramRenderCallback = (callback) =>
{
    diagramRenderCallbacks.push(callback)

    /**
     * This will only happen, if the data was already loaded before the callback is getting registered.
     * If the callback is registered before the data is loaded, it will be called through the render call in the data loading.
     */
    if (latestData !== undefined) {
        callback(latestData)
    }
}

const render = () => {
    console.log('Render diagrams through registered callbacks')
    for (const diagramRenderCallback of diagramRenderCallbacks) {
        diagramRenderCallback(latestData, timeValue())
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
d3.csv(dataPath).then(data => {
    data.forEach(d => {                         // Foreach data-point in data
        d.refugees = +d.refugees;           // Cast value to float and take times 1000
        d.date = new Date(d.date);             // Kind of unnecessary, but fixed webstorm complaining
    });
    console.log('Loaded data:')
    console.log(data);
    fillTable(data);

    latestData = data;
    render();
})
