import { createRouter, createWebHistory } from "vue-router";

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
      path: "/admin",
      component: () => import("@/layouts/AdminLayout.vue"),
      children: [
        {
          path: "",
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

router.afterEach((to) => {
  if (typeof document !== "undefined") {
    document.title = `${to.meta.title ?? "FDS"} | FDS`;
  }
});

export default router;
