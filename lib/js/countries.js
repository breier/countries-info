/**
 * Configure the whole table adn assume the JSON data has all the fields
**/

Vue.use(VueTables.ClientTable)

Vue.component('img-component', { /* Image template for modal-table */
    props: ['data'],
    template: '<img :src="data" alt="FLAG" height="35">'
})

Vue.component('default-component', { /* Text and Array template for modal-table */
    props: ['data'],
    template: '<span>{{ data }}</span>'
})

Vue.component('language-component', { /* Object template for modal-table assuming fields */
    props: ['data'],
    template: '<li>{{ data.name }} ({{ data.nativeName }})</li>'
})

Vue.component('currency-component', { /* Object template for modal-table assuming fields */
    props: ['data'],
    template: '<li>{{ data.name }} ({{ data.code }} / {{ data.symbol }})</li>'
})

Vue.component('regional-block-component', { /* Object template for modal-table assuming fields */
    props: ['data'],
    template: '<li>{{ data.name }} ({{ data.acronym }})</li>'
})

const countries = new Vue({
    el: '#countries',
    data: {
        countryInfoGrid: { /* My own field mapping for fields, titles and templates */
            'flag': { name: 'Flag', template: 'img-component', value: null },
            'name': { name: 'Name', template: 'default-component', value: null },
            'nativeName': { name: 'Native Name', template: 'default-component', value: null },
            'demonym': { name: 'Demonym', template: 'default-component', value: null },
            'capital': { name: 'Capital', template: 'default-component', value: null },
            'region': { name: 'Region', template: 'default-component', value: null },
            'subregion': { name: 'Sub-Region', template: 'default-component', value: null },
            'population': { name: 'Population', template: 'default-component', value: null },
            'languages': { name: 'Languages', template: 'language-component', value: null },
            'currencies': { name: 'Currencies', template: 'currency-component', value: null },
            'area': { name: 'Area', template: 'default-component', value: null },
            'alpha3Code': { name: 'Alpha Code', template: 'default-component', value: null },
            'topLevelDomain': { name: 'Top Level Domain', template: 'default-component', value: null },
            'callingCodes': { name: 'Calling Codes', template: 'default-component', value: null },
            'timezones': { name: 'Time Zones', template: 'default-component', value: null },
            'borders': { name: 'Borders', template: 'default-component', value: null },
            'regionalBlocs': { name: 'Regional Blocks', template: 'regional-block-component', value: null }
        },
        countriesList: [], /* The property containing all the raw JSON data from the API */
        columns: [ /* Columns to display at the main table */
            'flag',
            'name',
            'region',
            'population',
            'languages',
            'currencies'
        ],
        options: { /* Main table options */
            filterable: ['name', 'region', 'languages', 'currencies'],
            sortable: ['name', 'region', 'population', 'languages', 'currencies'],
            columnsDisplay: {
                'region': 'min_mobileL',
                'population': 'min_tabletP',
                'languages': 'min_tabletL',
                'currencies': 'min_desktop'
            },
            sortIcon: { /* Adjusting for Font Awesome */
                base:'fa',
                up:'fa-sort-desc',
                down:'fa-sort-asc',
                is:'fa-sort'
            },
            pagination: {
                chunk: 5,
                nav: 'scroll'
            },
            rowClassCallback: function(row) { /* Workaround to get the rows later and enable onClick event */
                return 'vue-rows'
            },
            templates: {
                languages: function (h, row) { /* Column "slot" replacer with array of objects (assuming fields) */
                    var output = ''
                    for (item in row.languages) {
                        if (output.length > 2) output += ', '
                        output += row.languages[item].name
                    }
                    return h('div', { attrs: { class: 'ellipsize', title: output } }, [output])
                },
                currencies: function (h, row) { /* Column "slot" replacer with array of objects (assuming fields) */
                    var output = ''
                    for (item in row.currencies) {
                        /* Sanitize empty and invalid values found in the API */
                        if (row.currencies[item].code == '(none)' || row.currencies[item].code == null) continue
                        if (output.length > 2) output += ', '
                        output += row.currencies[item].code
                    }
                    return h('div', { attrs: { class: 'ellipsize', title: output } }, [output])
                }
            },
            customSorting: {
                languages: function (ascending) { /* Fixes sorting with the same text as displayed in the table (assuming fields) */
                    return function (a, b) {
                        var firstA = a.languages[0].name.toLowerCase()
                        var firstB = b.languages[0].name.toLowerCase()

                        if (ascending) {
                            return firstA >= firstB ? 1 : -1
                        }
                        return firstA <= firstB ? 1 : -1
                    }
                },
                currencies: function (ascending) { /* Fixes sorting with the same text as displayed in the table (assuming fields) */
                    return function (a, b) {
                        var firstA = 'zzz'
                        for (item in a.currencies) { /* Sanitize empty and invalid values found in the API */
                            if (a.currencies[item].code == '(none)' || a.currencies[item].code == null) continue
                            var firstA = a.currencies[item].code.toLowerCase()
                            break
                        }

                        var firstB = 'zzx'
                        for (item in b.currencies) { /* Sanitize empty and invalid values found in the API */
                            if (b.currencies[item].code == '(none)' || b.currencies[item].code == null) continue
                            var firstB = b.currencies[item].code.toLowerCase()
                            break
                        }

                        if (ascending) {
                            return firstA >= firstB ? 1 : -1;
                        }
                        return firstA <= firstB ? 1 : -1;
                    }
                }
            }
        }
    },
    methods: {
      /**
       * Method to display modal when row is clicked, this is a workaround since vue-tables-2
       * does not support onRowClick option and the first lines are there to get the row.id
       * requesting a full set of data for one country from the API by "Full Country Name"
      **/
        showFullContent: function(event) {
            var trObject = event.target
            while (trObject.tagName.toLowerCase() != 'tr') { trObject = trObject.parentNode }
            try {
              fetch('https://restcountries.eu/rest/v2/name/'+ $(trObject).find('div.ellipsize:first').attr('title') +'?fullText=true')
                .then(response => response.json())
                .then(json => {
                    if (json[0] != null) {
                        for (item in json[0]) { /* Writing API data to internal field mapper */
                            if (this.countryInfoGrid[item] != null) this.countryInfoGrid[item].value = json[0][item]
                        }
                    }
                    $('#full-content-modal').modal('show') /* And finnally displaying the bootstrap modal */
                })
            } catch (e) {
              $(body).append("<h4>We couldn't reach the API. Try again later!</h4><p>"+ e +"</p>")
            }
        }
    },
    updated () { /* Adds Click Event Listener to all rows when rendered */
        $('table tr.vue-rows').on('click', countries.showFullContent)
    }
})
