import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'

const vuetify = createVuetify({
    ssr: true,
    defaults: {
        global: {
            ripple: false,
        },
        VSheet: {
            elevation: 4,
        },
    },
})
