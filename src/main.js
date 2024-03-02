import './assets/style.css'
import { createApp } from 'vue'
import App from './App.vue'
import components from "@/js/registration.js"
import router from "@/router/router.js";
import authorizationProcess from "./js/authorization.js";

const app = createApp(App);
app.use(router)
app.use(authorizationProcess)

components.forEach(component => app.component(component.name, component));
app.mount('#app')

