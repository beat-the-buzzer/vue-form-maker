import { createRouter, createWebHashHistory } from 'vue-router'
import Designer from '../views/Designer.vue'
import Preview from '../views/Preview.vue'

const routes = [
  {
    path: '/',
    redirect: '/designer'
  },
  {
    path: '/designer',
    name: 'designer',
    component: Designer,
    meta: { title: '表单设计' }
  },
  {
    path: '/preview',
    name: 'preview',
    component: Preview,
    meta: { title: '表单预览' }
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
