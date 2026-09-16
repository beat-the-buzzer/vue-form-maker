import { reactive, computed } from 'vue'

/**
 * 字段类型定义
 * - text: 文本输入
 * - radio: 单选
 * - checkbox: 多选
 * - date: 日期选择
 */
export const FIELD_TYPES = {
  text: {
    label: '文本输入',
    icon: 'EditOutlined',
    defaultProps: () => ({
      label: '文本输入',
      name: 'textField',
      placeholder: '请输入文本',
      maxLength: 100,
      showCount: true,
      required: false,
      defaultValue: ''
    })
  },
  radio: {
    label: '单选',
    icon: 'CheckCircleOutlined',
    defaultProps: () => ({
      label: '单选题',
      name: 'radioField',
      required: false,
      options: [
        { label: '选项1', value: 'option1' },
        { label: '选项2', value: 'option2' }
      ],
      defaultValue: ''
    })
  },
  checkbox: {
    label: '多选',
    icon: 'CheckSquareOutlined',
    defaultProps: () => ({
      label: '多选题',
      name: 'checkboxField',
      required: false,
      options: [
        { label: '选项1', value: 'option1' },
        { label: '选项2', value: 'option2' }
      ],
      defaultValue: []
    })
  },
  date: {
    label: '日期选择',
    icon: 'CalendarOutlined',
    defaultProps: () => ({
      label: '日期选择',
      name: 'dateField',
      required: false,
      defaultValue: null
    })
  },
  table: {
    label: '表格',
    icon: 'TableOutlined',
    defaultProps: () => ({
      label: '可编辑表格',
      name: 'tableField',
      required: false,
      minRows: 1,
      columns: [
        { key: 'col1', label: '列1', type: 'text', placeholder: '请输入', required: false },
        { key: 'col2', label: '列2', type: 'text', placeholder: '请输入', required: false }
      ],
      defaultValue: []
    })
  }
}

const state = reactive({
  formTitle: '我的表单',
  fields: []
})

let idSeed = 1

function genId() {
  return `field_${idSeed++}_${Date.now()}`
}

function addField(type) {
  const config = FIELD_TYPES[type]
  if (!config) return
  const field = {
    id: genId(),
    type,
    ...config.defaultProps()
  }
  state.fields.push(field)
  return field
}

function removeField(id) {
  const idx = state.fields.findIndex((f) => f.id === id)
  if (idx > -1) state.fields.splice(idx, 1)
}

function moveField(id, direction) {
  const idx = state.fields.findIndex((f) => f.id === id)
  if (idx === -1) return
  if (direction === 'up' && idx > 0) {
    const tmp = state.fields[idx - 1]
    state.fields[idx - 1] = state.fields[idx]
    state.fields[idx] = tmp
  } else if (direction === 'down' && idx < state.fields.length - 1) {
    const tmp = state.fields[idx + 1]
    state.fields[idx + 1] = state.fields[idx]
    state.fields[idx] = tmp
  }
}

function duplicateField(id) {
  const idx = state.fields.findIndex((f) => f.id === id)
  if (idx === -1) return
  const source = state.fields[idx]
  const copy = JSON.parse(JSON.stringify(source))
  copy.id = genId()
  copy.label = `${source.label}_副本`
  state.fields.splice(idx + 1, 0, copy)
}

function clearFields() {
  state.fields.splice(0, state.fields.length)
}

function getFields() {
  return computed(() => state.fields)
}

export function useFormStore() {
  return {
    state,
    addField,
    removeField,
    moveField,
    duplicateField,
    clearFields,
    getFields
  }
}
