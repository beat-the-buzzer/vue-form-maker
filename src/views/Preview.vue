<template>
  <div class="page-container">
    <div class="preview-header">
      <h2 class="form-title">{{ state.formTitle }}</h2>
      <a-button type="primary" ghost @click="goDesigner">返回设计</a-button>
    </div>

    <a-divider />

    <div v-if="state.fields.length === 0" class="empty-tip">
      <p>暂无表单字段，请先前往设计页面添加</p>
      <a-button type="primary" @click="goDesigner">去设计表单</a-button>
    </div>

    <a-form
      v-else
      ref="formRef"
      :model="formData"
      :rules="rules"
      layout="vertical"
    >
      <FieldRenderer
        v-for="field in state.fields"
        :key="field.id"
        :field="field"
        v-model="formData[field.id]"
      />

      <a-form-item>
        <a-space>
          <a-button type="primary" @click="onSubmit">提交表单</a-button>
          <a-button @click="onReset">重置</a-button>
        </a-space>
      </a-form-item>
    </a-form>

    <a-modal
      v-model:open="resultVisible"
      title="表单提交结果"
      width="560px"
      :footer="null"
    >
      <pre class="result-json">{{ formattedResult }}</pre>
    </a-modal>
  </div>
</template>

<script setup>
import { reactive, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import dayjs from 'dayjs'
import { useFormStore } from '../store/useFormStore'
import FieldRenderer from '../components/FieldRenderer.vue'

const router = useRouter()
const { state } = useFormStore()

const formRef = ref()
const resultVisible = ref(false)
const submitResult = ref({})

// 构建表单数据和校验规则
const formData = reactive({})

function initFormData() {
  Object.keys(formData).forEach((k) => delete formData[k])
  state.fields.forEach((field) => {
    if (field.type === 'checkbox') {
      formData[field.id] = field.defaultValue ? [...field.defaultValue] : []
    } else if (field.type === 'table') {
      // 初始化表格：至少 minRows 行空对象
      const minRows = field.minRows || 0
      const initial = Array.isArray(field.defaultValue) ? [...field.defaultValue] : []
      while (initial.length < minRows) {
        initial.push({})
      }
      formData[field.id] = initial
    } else {
      formData[field.id] = field.defaultValue ?? (field.type === 'date' ? null : '')
    }
  })
}

const rules = computed(() => {
  const r = {}
  state.fields.forEach((field) => {
    r[field.id] = field.required
      ? [{ required: true, message: `请填写「${field.label}」`, trigger: 'change' }]
      : []
  })
  return r
})

initFormData()

const formattedResult = computed(() =>
  JSON.stringify(submitResult.value, null, 2)
)

function formatValue(field) {
  const value = formData[field.id]
  if (field.type === 'date' && dayjs.isDayjs(value)) {
    return value.format('YYYY-MM-DD')
  }
  // 表格：遍历每行，对日期列做格式化
  if (field.type === 'table' && Array.isArray(value)) {
    const dateCols = (field.columns || []).filter((c) => c.type === 'date')
    if (dateCols.length === 0) return value
    return value.map((row) => {
      const newRow = { ...row }
      dateCols.forEach((col) => {
        if (dayjs.isDayjs(newRow[col.key])) {
          newRow[col.key] = newRow[col.key].format('YYYY-MM-DD')
        }
      })
      return newRow
    })
  }
  return value
}

function validateTableFields() {
  const errors = []
  state.fields
    .filter((f) => f.type === 'table')
    .forEach((field) => {
      const rows = formData[field.id] || []
      const requiredCols = (field.columns || []).filter((c) => c.required)
      if (requiredCols.length === 0) return
      rows.forEach((row, rowIdx) => {
        requiredCols.forEach((col) => {
          const val = row[col.key]
          const empty =
            val === undefined ||
            val === null ||
            val === '' ||
            (Array.isArray(val) && val.length === 0)
          if (empty) {
            errors.push(`「${field.label}」第 ${rowIdx + 1} 行的「${col.label}」为必填项`)
          }
        })
      })
    })
  return errors
}

async function onSubmit() {
  try {
    await formRef.value.validate()
    // 校验表格内必填项
    const tableErrors = validateTableFields()
    if (tableErrors.length > 0) {
      tableErrors.forEach((msg) => message.error(msg))
      return
    }
    const result = {}
    state.fields.forEach((field) => {
      const key = field.name || field.id
      result[key] = formatValue(field)
    })
    submitResult.value = result
    resultVisible.value = true
    message.success('表单提交成功')
  } catch (err) {
    message.error('请完成必填项后再提交')
  }
}

function onReset() {
  formRef.value.resetFields()
  initFormData()
  message.info('表单已重置')
}

function goDesigner() {
  router.push({ name: 'designer' })
}
</script>

<style scoped>
.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.form-title {
  margin: 0;
  font-size: 22px;
}

.result-json {
  background: #f5f5f5;
  padding: 16px;
  border-radius: 4px;
  margin: 0;
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 13px;
  overflow-x: auto;
}
</style>
