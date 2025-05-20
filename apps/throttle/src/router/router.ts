import { createRouter, createWebHistory } from "vue-router"
import HomeView from "@/views/HomeView.vue"
import SelectConnections from "@/connections/SelectConnections.component.vue"

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: HomeView,
    },
    {
      path: "/throttle/:locoId?",
      name: "throttle",
      component: () => import("../views/ThrottleView.vue"),
    },
    {
      path: "/connect",
      name: "connect",
      component: SelectConnections,
    },
    {
      path: "/connect/deja",
      name: "deja",
      component: () =>
        import("../connections/deja/DejaConnection.component.vue"),
    },
    {
      path: "/connect/emulator",
      name: "emulator",
      component: () =>
        import("../connections/emulator/EmulatorConnect.component.vue"),
    },
    {
      path: "/connect/layout-id",
      name: "layout-id",
      component: () =>
        import("../connections/layout-id/LayoutConnect.component.vue"),
    },
    {
      path: "/connect/serial",
      name: "serial",
      component: () =>
        import("../connections/serial/SerialConnect.component.vue"),
    },
  ],
})

export default router
