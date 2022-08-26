const featuredCountriesFile = '2022-08-18_featured-in-refugee-response-plan.csv'
const otherNeighboursFile = '2022-08-18_other-neighbouring-countries.csv'


/**
 * The following loads the data from the csv and prefills the data table
 */
const loadCountryData = (_callback) => {
    const thisScriptElement = d3.select('#country-data-loader');
    let sourcePath = thisScriptElement.attr('src');
    sourcePath = sourcePath.slice(0, sourcePath.length - 22);
    const featuredCountriesPath = sourcePath + featuredCountriesFile;
    const otherNeighboursPath = sourcePath + otherNeighboursFile;

    let loadedParts = 0;
    const data = [];
    data.columns = ['country', 'refugees'];

    const addDataPart = dataPart => {
        dataPart.forEach(entry => {
            data.push(entry)
        });

        loadedParts++;
        if (loadedParts >= 2) {
            data.sort((a, b) => b.refugees - a.refugees)

            console.log("All neighbor country data loaded. Full data is:")
            console.log(data);

            _callback(data)
        }
    }

    const loadDataPart = data => {
        console.log(data)
        let strippedData = [];
        for (let i = 0; i < data.length; i++) {
            strippedData.push({'country': data[i]["Country"], 'refugees': +data[i]["Border crossings from Ukraine*"]})
        }
        console.log(strippedData)
        addDataPart(strippedData)
    }

    d3.csv(featuredCountriesPath).then(data => {
        console.log('Loaded featured countries data:')
        loadDataPart(data)
    })

    d3.csv(otherNeighboursPath).then(data => {
        console.log('Loaded other neighbour countries data:')
        loadDataPart(data)
    })
}