<template>
  <a-form-item
    :label="field.label"
    :required="field.required"
    :name="field.id"
  >
    <!-- 文本输入 -->
    <a-input
      v-if="field.type === 'text'"
      v-model:value="modelValue"
      :placeholder="field.placeholder"
      :maxlength="field.maxLength"
      :show-count="field.showCount"
      allow-clear
    />

    <!-- 单选 -->
    <a-radio-group
      v-else-if="field.type === 'radio'"
      v-model:value="modelValue"
    >
      <a-radio
        v-for="opt in field.options"
        :key="opt.value"
        :value="opt.value"
      >
        {{ opt.label }}
      </a-radio>
    </a-radio-group>

    <!-- 多选 -->
    <a-checkbox-group
      v-else-if="field.type === 'checkbox'"
      v-model:value="modelValue"
    >
      <a-checkbox
        v-for="opt in field.options"
        :key="opt.value"
        :value="opt.value"
      >
        {{ opt.label }}
      </a-checkbox>
    </a-checkbox-group>

    <!-- 日期选择 -->
    <a-date-picker
      v-else-if="field.type === 'date'"
      v-model:value="modelValue"
      style="width: 100%"
      placeholder="请选择日期"
    />

    <!-- 可编辑表格 -->
    <div v-else-if="field.type === 'table'" class="editable-table">
      <table class="et-table">
        <thead>
          <tr>
            <th
              v-for="col in field.columns"
              :key="col.key"
            >
              <span v-if="col.required" class="et-required">*</span>{{ col.label }}
            </th>
            <th class="et-action-col">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, rowIdx) in rows" :key="rowIdx">
            <td v-for="col in field.columns" :key="col.key">
              <a-input
                v-if="col.type === 'text'"
                v-model:value="row[col.key]"
                :placeholder="col.placeholder || '请输入'"
                @change="onCellChange"
              />
              <a-input-number
                v-else-if="col.type === 'number'"
                v-model:value="row[col.key]"
                :placeholder="col.placeholder || '请输入'"
                style="width: 100%"
                @change="onCellChange"
              />
              <a-date-picker
                v-else-if="col.type === 'date'"
                v-model:value="row[col.key]"
                style="width: 100%"
                placeholder="请选择日期"
                @change="onCellChange"
              />
            </td>
            <td class="et-action-col">
              <a-button
                type="link"
                size="small"
                danger
                :disabled="rows.length <= field.minRows"
                @click="removeRow(rowIdx)"
              >
                删除
              </a-button>
            </td>
          </tr>
          <tr v-if="rows.length === 0">
            <td :colspan="field.columns.length + 1" class="et-empty">
              暂无数据
            </td>
          </tr>
        </tbody>
      </table>
      <a-button type="dashed" size="small" block class="et-add-row" @click="addRow">
        + 添加一行
      </a-button>
    </div>
  </a-form-item>
</template>

<script setup>
import { computed, watch } from 'vue'

const props = defineProps({
  field: {
    type: Object,
    required: true
  },
  modelValue: {
    type: [String, Array, Object, null],
    default: undefined
  }
})

const emit = defineEmits(['update:modelValue'])

const modelValue = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

// 表格数据行
const rows = computed({
  get: () => {
    const val = props.modelValue
    return Array.isArray(val) ? val : []
  },
  set: (val) => emit('update:modelValue', val)
})

// 确保表格至少有 minRows 行
function ensureMinRows() {
  if (props.field.type !== 'table') return
  const minRows = props.field.minRows || 0
  const list = Array.isArray(props.modelValue) ? [...props.modelValue] : []
  let changed = false
  while (list.length < minRows) {
    list.push({})
    changed = true
  }
  if (changed) {
    emit('update:modelValue', list)
  }
}

// 初始化时确保最小行数
watch(
  () => props.field.id,
  () => ensureMinRows(),
  { immediate: true }
)

function addRow() {
  const list = Array.isArray(props.modelValue) ? [...props.modelValue] : []
  list.push({})
  emit('update:modelValue', list)
}

function removeRow(idx) {
  const list = Array.isArray(props.modelValue) ? [...props.modelValue] : []
  list.splice(idx, 1)
  emit('update:modelValue', list)
}

function onCellChange() {
  // 触发响应式更新（a-input v-model 已直接修改行对象）
  const list = Array.isArray(props.modelValue) ? [...props.modelValue] : []
  emit('update:modelValue', list)
}
</script>

<style scoped>
.editable-table {
  width: 100%;
}

.et-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 8px;
}

.et-table th,
.et-table td {
  border: 1px solid #e8e8e8;
  padding: 6px 8px;
  text-align: left;
  font-size: 13px;
}

.et-table th {
  background: #fafafa;
  font-weight: 500;
}

.et-action-col {
  width: 70px;
  text-align: center;
}

.et-empty {
  text-align: center;
  color: #999;
  padding: 16px;
}

.et-add-row {
  margin-top: 4px;
}

.et-required {
  color: #ff4d4f;
  margin-right: 2px;
}
</style>
