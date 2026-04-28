<template>
  <aside
    class="flex h-full flex-col border-r border-[var(--ui-border)] bg-[var(--ui-surface)]"
  >
    <div class="border-b border-[var(--ui-border)] px-4 py-4">
      <RouterLink
        to="/admin/dashboard"
        class="flex items-center gap-3 no-underline"
      >
        <div
          class="flex h-11 w-11 items-center justify-center rounded-[var(--ui-radius-md)] bg-[var(--ui-text)] text-base font-bold text-white"
        >
          F
        </div>
        <div>
          <div class="text-sm font-semibold text-[var(--ui-text)]">
            FDS Admin
          </div>
          <div class="text-xs text-[var(--ui-text-soft)]">
            Management workspace
          </div>
        </div>
      </RouterLink>
    </div>

    <nav class="flex flex-1 flex-col gap-1 px-3 py-4">
      <RouterLink
        v-for="item in items"
        :key="item.to"
        :to="item.to"
        :class="itemClass(item.to)"
      >
        <span class="text-base">{{ item.icon }}</span>
        <span>{{ item.label }}</span>
      </RouterLink>
    </nav>

    <div class="border-t border-[var(--ui-border)] px-4 py-4">
      <UiBadge
        :label="adminRoleLabel"
        variant="neutral"
        size="md"
      />
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { RouterLink, useRoute } from "vue-router";
import { UiBadge } from "@/components/ui";
import { useAppStore } from "@/stores/app";
import { cn } from "@/utils/cn";

const route = useRoute();
const appStore = useAppStore();

const items = [
  { label: "Dashboard", to: "/admin/dashboard", icon: "⌘" },
  { label: "Đơn hàng", to: "/admin/orders", icon: "▦" },
  { label: "Mẫu ảnh", to: "/admin/templates", icon: "▣" },
  { label: "Ra ngoài client", to: "/fds", icon: "↗" },
];

const adminRoleLabel = computed(() => appStore.adminProfile?.role || "admin");

function itemClass(to: string) {
  const active = route.path === to || route.path.startsWith(`${to}/`);
  return cn(
    "inline-flex min-h-11 items-center gap-3 rounded-[var(--ui-radius-md)] px-3 text-sm font-medium no-underline transition",
    active
      ? "bg-[var(--ui-primary)] text-white"
      : "text-[var(--ui-text-muted)] hover:bg-[var(--ui-surface-soft)] hover:text-[var(--ui-text)]",
  );
}
</script>
