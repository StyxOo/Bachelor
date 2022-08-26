const dailyDataFile = '2022-07-23_crossings_daily.json';

/**
 * The following loads the data from the csv and prefills the data table
 */
const loadDailyData = (_callback) => {
    const thisScriptElement = d3.select('#daily-data-loader');
    let sourcePath = thisScriptElement.attr('src');
    sourcePath = sourcePath.slice(0, sourcePath.length - 20);
    const dataPath = sourcePath + dailyDataFile;

    d3.json(dataPath).then(data => {
        console.log("Read daily data JSON:");
        console.log(data);
        let newData = [];
        newData.columns = ['date', 'refugees'];

        data.data.timeseries.forEach(entry => {
            newData.push({'date': new Date(entry.data_date), 'refugees': entry.individuals})
        })

        console.log('Loaded daily data:')
        console.log(newData)

        _callback(newData)
    })
}