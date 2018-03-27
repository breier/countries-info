/**
 * Details / Chart / Dashboard "page"
**/

const details = new Vue({
    el: '#details',
    data: {
        mostWorthLanguage: 'Unknown', /* Easy bonus after all */
        doughnutCharts: [ /* List of Doughnut Charts to render, uncomment any line to display */
            { id: 'languages-bycountry-chart', title: 'Top Languages By Country', resource: {}, data: [] },
            { id: 'languages-bypopulation-chart', title: 'Top Languages By Population', resource: {}, data: [] },
          //  { id: 'languages-bydemography-chart', title: 'Top Languages By Demography', resource: {}, data: [] },
          //  { id: 'currencies-bycountry-chart', title: 'Top Currencies By Country', resource: {}, data: [] },
        ],
        barChart: [{ id: 'total-chart', title: 'Total Summary', resource: {}, data: [] }]
    },
    methods: {
        parseChartData: function(countriesList) { /* Processes all the raw data into chart material */
            var currenciesArray = []
            var languagesArray = []

            for (item in countriesList) {

                /* Sometime population or area isn't set and causes false data if not sanytized to 1 */
                var safePopulation = (parseInt(countriesList[item].population) > 0) ?
                  (parseInt(countriesList[item].population)) : 1
                var safeArea = (parseInt(countriesList[item].area) > 0) ?
                  (parseInt(countriesList[item].area)) : safePopulation

                /* Iterating through the languages in each and every country */
                for (languageItem in countriesList[item].languages) {
                    var languageIndex = -1
                    var languageName = countriesList[item].languages[languageItem].name
                    for (i in languagesArray) {
                        if (languagesArray[i].indexOf(languageName) != -1) languageIndex = i
                    } /* Just looked for the language in the Accumulator Array */

                    if (languageIndex === -1) { /* If not found, push a new entry */
                        languagesArray.push([
                            1,
                            parseInt(safePopulation / countriesList[item].languages.length),
                            parseInt(safePopulation / safeArea / countriesList[item].languages.length),
                            languageName
                        ])
                    } else { /* Otherwise, sum it up */
                        languagesArray[languageIndex][0] += 1
                        languagesArray[languageIndex][1] += parseInt(safePopulation / countriesList[item].languages.length)
                        languagesArray[languageIndex][2] += parseInt(safePopulation / safeArea / countriesList[item].languages.length)
                    }
                }

                /* Iterating through the currencies in each and every country */
                for (currencyItem in countriesList[item].currencies) {
                    var currencyIndex = -1
                    var currencyCode = countriesList[item].currencies[currencyItem].code
                    if (currencyCode == '(none)' || currencyCode == null) continue
                    for (i in currenciesArray) {
                        if (currenciesArray[i].indexOf(currencyCode) != -1) currencyIndex = i
                    } /* Just looked for the currency in the Accumulator Array */

                    if (currencyIndex === -1) { /* If not found, push a new entry */
                        currenciesArray.push([
                            1,
                            currencyCode
                        ])
                    } else { /* Otherwise, sum it up */
                        currenciesArray[currencyIndex][0] += 1
                    }
                }
            }

            /* Set Chart with the full array of results, the ID at the main array, the data index and the label index */
            if (this.doughnutCharts[0] != null) this.setChart(languagesArray, 0, 0, 3)
            if (this.doughnutCharts[1] != null) this.setChart(languagesArray, 1, 1, 3, 'mostWorthLanguage') /* A little callback */
            if (this.doughnutCharts[2] != null) this.setChart(languagesArray, 2, 2, 3)
            if (this.doughnutCharts[3] != null) this.setChart(currenciesArray, 3, 0, 1)

            if (this.barChart[0] != null) { /* No point setting variables if the chart wont show */
              var totalPopulation = 0
              for (var i in languagesArray) { totalPopulation += languagesArray[i][1] }
              totalPopulation = Math.round(totalPopulation / 1000000) / 1000 /* rounded to bilions with 3 points of precision */

              /* Setting ChartJS barChart Options */
              var chartLabels = ['Summary']
              var chartDatasets = [
                  { label: 'Countries', data: [countriesList.length], backgroundColor: [this.getColorByString('Countries')] },
                  { label: 'Currencies', data: [currenciesArray.length], backgroundColor: [this.getColorByString('Currencies')] },
                  { label: 'Languages', data: [languagesArray.length], backgroundColor: [this.getColorByString('Languages')] },
                  { label: 'Population', data: [totalPopulation], backgroundColor: [this.getColorByString('Population')] }
              ]

              /* Storing the results in an internal array */
              this.barChart[0].data = [
                  [countriesList.length, 'Countries'],
                  [currenciesArray.length, 'Currencies'],
                  [languagesArray.length, 'Languages'],
                  [totalPopulation, 'Population']
              ]

              /* Rendering the barChart */
              this.barChart[0].resource.data.labels = chartLabels
              this.barChart[0].resource.data.datasets = chartDatasets
              this.barChart[0].resource.update()
            }
        },
        /* Method to set doughnutCharts and optionally set a Parent property */
        setChart: function(data, chartId, dataId, dataLabel, setTopLabel) {
            data.sort(function(a, b) { return a[dataId] <= b[dataId] ? 1 : -1 }) /* Desc Sort by data index field */
            this.doughnutCharts[chartId].data = data.slice(0, 10) /* Keep only the top 10 */

            var chartLabels = [] /* Prepare ChartJS Options */
            var chartDatasets = [{ data: [], backgroundColor: [] }]
            for (item in this.doughnutCharts[chartId].data) {
                var currentLabel = this.doughnutCharts[chartId].data[item][dataLabel]
                if (currentLabel.length < 4) currentLabel += dataId
                chartLabels.push(this.doughnutCharts[chartId].data[item][dataLabel])
                chartDatasets[0].data.push(this.doughnutCharts[chartId].data[item][dataId])
                chartDatasets[0].backgroundColor.push(this.getColorByString(currentLabel))
            }

            if (setTopLabel != null) { /* Set Parent Variable "little callback" for the mostWorthLanguage to learn */
                if (this[setTopLabel] != null) this[setTopLabel] = this.doughnutCharts[chartId].data[0][dataLabel]
            }

            /* Rendering the doughnutChart */
            this.doughnutCharts[chartId].resource.data.labels = chartLabels
            this.doughnutCharts[chartId].resource.data.datasets = chartDatasets
            this.doughnutCharts[chartId].resource.update()
        },
        getColorByString: function(text) { /* A neat method to generate static different colors based on labels */
            var timesValue = 1
            for (var i=0; i<text.length; i++) {
              if (i>10) break /* First I make a big number with the first letters' ascii codes */
              timesValue *= text.charCodeAt(i)
            }
            var hexValue = timesValue.toString(16) /* Then I convert it to it's hexValue */

            var resultColor = 'rgba(' /* The I write a compliant rgba() color with 60% of opacity */
            for (var i=0; i<6; i+=2) resultColor += parseInt(hexValue.substr(i, 2), 16) +', '
            resultColor += '0.6 )'
            return resultColor
        }
    },
})

for (item in details.doughnutCharts) { /* Look up and instantiate Doughnut Charts */
    var ctxDoughnutChart = document.getElementById(details.doughnutCharts[item].id).getContext("2d");
    details.doughnutCharts[item].resource = new Chart(ctxDoughnutChart, {
        type: 'doughnut',
        data: { labels: [], datasets: [] }, /* They start empty as they're only going to be rendered the the method above */
        options: {
            responsive: true, /* Some simple configuratioins */
            maintainAspectRatio: true,
            legend: { position: 'right' }
        }
    })
}

if (details.barChart[0] != null) { /* Instantiate the one and only bar Chart (if enabled) */
  var ctxBarChart = document.getElementById(details.barChart[0].id).getContext("2d");
  details.barChart[0].resource = new Chart(ctxBarChart, {
    type: 'bar',
    data: { labels: [], datasets: [] }, /* Same as above, starts empty */
    options: {
      responsive: true, /* Some simple configuratioins */
      maintainAspectRatio: true,
      legend: { position: 'right' }
    }
  })
}
