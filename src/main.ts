/*
 * @Author: Lemon C
 * @Date: 2025-07-02 11:25:16
 * @LastEditTime: 2026-04-15 16:43:05
 */
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import * as Pinia from 'pinia';
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import 'element-plus/theme-chalk/index.css'
import zhCn from 'element-plus/es/locale/lang/zh-cn' //1 引入中文
import GlobalComponents from "./plugin/globalComponent";
import tool from "@/utils"


(window as any).isOffline = true;

const app = createApp(App);
const pinia = Pinia.createPinia();

app.use(pinia);
app.use(router);
app.use(tool);


app.use(ElementPlus, {
    locale: zhCn //2 这里使用中文
});

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
}



app.use(GlobalComponents); // 全局注册vue组件




app.mount('#app');


