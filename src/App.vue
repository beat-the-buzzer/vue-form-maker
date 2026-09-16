<template>
  <a-layout class="app-layout">
    <a-layout-header class="app-header">
      <div class="header-inner">
        <h1 class="logo">Vue 表单生成器</h1>
        <a-menu
          v-model:selectedKeys="selectedKeys"
          mode="horizontal"
          theme="dark"
          class="app-menu"
          @click="onMenuClick"
        >
          <a-menu-item key="designer">表单设计</a-menu-item>
          <a-menu-item key="preview">表单预览</a-menu-item>
        </a-menu>
      </div>
    </a-layout-header>
    <a-layout-content class="app-content">
      <router-view />
    </a-layout-content>
    <a-layout-footer class="app-footer">
      Vue Form Maker ©2026
    </a-layout-footer>
  </a-layout>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const selectedKeys = ref([route.name || 'designer'])

watch(
  () => route.name,
  (name) => {
    selectedKeys.value = [name]
  }
)

const onMenuClick = ({ key }) => {
  router.push({ name: key })
}
</script>

<style scoped>
.app-layout {
  min-height: 100vh;
}

.app-header {
  padding: 0;
  height: 64px;
}

.header-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  height: 100%;
}

.logo {
  color: #fff;
  font-size: 18px;
  margin: 0;
  white-space: nowrap;
}

.app-menu {
  flex: 1;
  justify-content: flex-end;
  border-bottom: none;
  background: transparent;
}

.app-content {
  padding: 24px;
}

.app-footer {
  text-align: center;
  color: #888;
}
</style>
