import { createRouter, createWebHistory } from "vue-router";
import { pinia } from "@/stores";
import { useAppStore } from "@/stores/app";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      redirect: "/fds",
    },
    {
      path: "/",
      component: () => import("@/layouts/MainLayout.vue"),
      children: [
        {
          path: "fds",
          name: "fds-home",
          component: () => import("@/pages/DesignerPage.vue"),
          meta: {
            title: "FDS Designer",
          },
        },
        {
          path: "guide",
          name: "guide",
          component: () => import("@/pages/GuidePage.vue"),
          meta: {
            title: "FDS Guide",
          },
        },
      ],
    },
    {
      path: "/admin/login",
      name: "admin-login",
      component: () => import("@/pages/admin/AdminLoginPage.vue"),
      meta: {
        title: "Admin Login",
        guestOnly: true,
      },
    },
    {
      path: "/admin",
      component: () => import("@/layouts/AdminLayout.vue"),
      meta: {
        requiresAdminAuth: true,
      },
      children: [
        {
          path: "",
          redirect: {
            name: "admin-dashboard",
          },
        },
        {
          path: "dashboard",
          name: "admin-dashboard",
          component: () => import("@/pages/admin/AdminDashboardPage.vue"),
          meta: {
            title: "FDS Admin Dashboard",
            description: "Tổng quan khu vực quản trị.",
          },
        },
        {
          path: "orders",
          name: "admin-orders",
          component: () => import("@/pages/admin/AdminOrdersPage.vue"),
          meta: {
            title: "FDS Admin Orders",
            description: "Quản trị danh sách đơn hàng.",
          },
        },
        {
          path: "templates",
          name: "admin-templates",
          component: () => import("@/pages/admin/AdminTemplatesPage.vue"),
          meta: {
            title: "FDS Admin Templates",
            description: "Quản trị template ảnh cho client.",
          },
        },
        {
          path: "home",
          name: "admin-home",
          component: () => import("@/pages/admin/AdminDashboardPage.vue"),
          meta: {
            title: "FDS Admin",
          },
        },
      ],
    },
    {
      path: "/:pathMatch(.*)*",
      name: "not-found",
      component: () => import("@/pages/system/NotFoundPage.vue"),
      meta: {
        title: "404 Not Found",
      },
    },
  ],
  scrollBehavior() {
    return { top: 0 };
  },
});

router.beforeEach((to) => {
  const appStore = useAppStore(pinia);
  appStore.hydrate();

  if (to.meta.requiresAdminAuth && !appStore.isAuthenticated) {
    return {
      name: "admin-login",
      query: { redirect: to.fullPath },
    };
  }

  if (to.meta.guestOnly && appStore.isAuthenticated) {
    return {
      name: "admin-dashboard",
    };
  }

  return true;
});

router.afterEach((to) => {
  if (typeof document !== "undefined") {
    document.title = `${to.meta.title ?? "FDS"} | FDS`;
  }
});

export default router;
