/**
 * The main #app, I tried to keep it simple even though it's a router
 * The idea is to be able to run from index.html straight in the browser
 * No web-server required (pure front-end)
**/

const app = new Vue({
    el: '#nav',
    data: {
        active: location.hash,
        topMenu: {
            countries: { name: 'List', path: '#countries', icon: 'globe', isActive: false },
            details: { name: 'Details', path: '#details', icon: 'dashboard', isActive: false }
        }
    },
    methods: { /* Simple method to check URL hash and set the active page-content */
        checkActiveMenu: function() {
            window.scrollTo(0, 0)
            this.active = location.hash
            var validActive = false
            if (this.topMenu == null) return location.reload()
            if (typeof this.topMenu != 'object') return location.reload()

            for (item in this.topMenu) {
                if (this.topMenu[item].path == this.active) {
                    this.topMenu[item].isActive = true
                    validActive = true
                } else {
                    this.topMenu[item].isActive = false
                }
            }
            if (!validActive && this.topMenu.countries != null) {
                location.href = this.topMenu.countries.path
            }
        }
    },
    created () { /* Main request "onLoad" at the API to gather most important data */
        this.checkActiveMenu()
        try {
          fetch('https://restcountries.eu/rest/v2/all?fields=flag;name;region;population;languages;currencies;area')
              .then(response => response.json())
              .then(json => {
                  countries.countriesList = json
                  /* Parde JSON data and Render Charts even if not visible */
                  details.parseChartData(json)
              })
        } catch (e) {
          $(body).append("<h4>We couldn't reach the API. Try again later!</h4><p>"+ e +"</p>")
        }
    }
})
/* Add an Event Listener to URI hashchange to keep our router/menu working */
window.addEventListener('hashchange', app.checkActiveMenu)
