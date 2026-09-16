<template>
  <div class="page-container">
    <div class="designer-toolbar">
      <a-input
        v-model:value="state.formTitle"
        placeholder="表单标题"
        class="title-input"
      />
      <a-space>
        <a-button type="primary" @click="addField('text')">
          + 文本输入
        </a-button>
        <a-button type="primary" @click="addField('radio')">
          + 单选
        </a-button>
        <a-button type="primary" @click="addField('checkbox')">
          + 多选
        </a-button>
        <a-button type="primary" @click="addField('date')">
          + 日期选择
        </a-button>
        <a-button type="primary" @click="addField('table')">
          + 表格
        </a-button>
        <a-popconfirm
          title="确定要清空所有字段吗？"
          @confirm="clearFields"
        >
          <a-button danger>清空</a-button>
        </a-popconfirm>
        <a-button type="primary" ghost @click="goPreview">预览表单</a-button>
        <a-button @click="showJsonPreview">预览 JSON</a-button>
      </a-space>
    </div>

    <a-divider />

    <div v-if="state.fields.length === 0" class="empty-tip">
      <p>暂无字段，请点击上方按钮添加表单字段</p>
    </div>

    <div v-else class="fields-list">
      <a-card
        v-for="(field, index) in state.fields"
        :key="field.id"
        class="field-card"
        size="small"
      >
        <template #title>
          <div class="field-card-header">
            <a-tag :color="typeColor(field.type)">
              {{ typeLabel(field.type) }}
            </a-tag>
            <span class="field-index">#{{ index + 1 }}</span>
            <span class="field-label-preview">{{ field.label }}</span>
          </div>
        </template>
        <template #extra>
          <a-space size="small">
            <a-tooltip title="上移">
              <a-button
                size="small"
                :disabled="index === 0"
                @click="moveField(field.id, 'up')"
              >
                <template #icon><ArrowUpOutlined /></template>
              </a-button>
            </a-tooltip>
            <a-tooltip title="下移">
              <a-button
                size="small"
                :disabled="index === state.fields.length - 1"
                @click="moveField(field.id, 'down')"
              >
                <template #icon><ArrowDownOutlined /></template>
              </a-button>
            </a-tooltip>
            <a-tooltip title="复制">
              <a-button size="small" @click="duplicateField(field.id)">
                <template #icon><CopyOutlined /></template>
              </a-button>
            </a-tooltip>
            <a-popconfirm title="确定删除该字段？" @confirm="removeField(field.id)">
              <a-tooltip title="删除">
                <a-button size="small" danger>
                  <template #icon><DeleteOutlined /></template>
                </a-button>
              </a-tooltip>
            </a-popconfirm>
          </a-space>
        </template>

        <div class="field-config">
          <a-row :gutter="16">
            <a-col :span="8">
              <div class="config-item">
                <label class="config-label">字段标签</label>
                <a-input v-model:value="field.label" placeholder="请输入字段标签" />
              </div>
            </a-col>
            <a-col :span="8">
              <div class="config-item">
                <label class="config-label">字段名 (name)</label>
                <a-input v-model:value="field.name" placeholder="请输入字段名" />
              </div>
            </a-col>
            <a-col :span="8">
              <div class="config-item">
                <label class="config-label">是否必填</label>
                <a-switch v-model:checked="field.required" />
              </div>
            </a-col>
          </a-row>

          <!-- 文本输入：占位符 & 最大输入字数 -->
          <a-row v-if="field.type === 'text'" :gutter="16" class="mt-12">
            <a-col :span="12">
              <div class="config-item">
                <label class="config-label">占位提示</label>
                <a-input v-model:value="field.placeholder" placeholder="请输入占位提示" />
              </div>
            </a-col>
            <a-col :span="6">
              <div class="config-item">
                <label class="config-label">最大输入字数</label>
                <a-input-number
                  v-model:value="field.maxLength"
                  :min="1"
                  :max="9999"
                  placeholder="留空则不限制"
                  style="width: 100%"
                />
              </div>
            </a-col>
            <a-col :span="6">
              <div class="config-item">
                <label class="config-label">显示字数统计</label>
                <a-switch v-model:checked="field.showCount" />
              </div>
            </a-col>
          </a-row>

          <!-- 单选/多选：选项编辑 -->
          <div v-if="field.type === 'radio' || field.type === 'checkbox'" class="options-editor mt-12">
            <label class="config-label">选项列表</label>
            <div
              v-for="(opt, optIdx) in field.options"
              :key="optIdx"
              class="option-row"
            >
              <a-input
                v-model:value="opt.label"
                placeholder="选项标签"
                class="option-input"
                @change="updateOptionValue(opt)"
              />
              <a-button
                size="small"
                danger
                :disabled="field.options.length <= 1"
                @click="removeOption(field, optIdx)"
              >
                <template #icon><DeleteOutlined /></template>
              </a-button>
            </div>
            <a-button type="dashed" size="small" block @click="addOption(field)">
              + 添加选项
            </a-button>
          </div>

          <!-- 表格：列配置 -->
          <div v-if="field.type === 'table'" class="columns-editor mt-12">
            <a-row :gutter="16" class="mb-8">
              <a-col :span="6">
                <label class="config-label">最小行数</label>
                <a-input-number
                  v-model:value="field.minRows"
                  :min="0"
                  :max="50"
                  style="width: 100%"
                />
              </a-col>
            </a-row>
            <label class="config-label">列配置</label>
            <div
              v-for="(col, colIdx) in field.columns"
              :key="colIdx"
              class="column-row"
            >
              <a-input
                v-model:value="col.label"
                placeholder="列名"
                class="col-input"
              />
              <a-input
                v-model:value="col.key"
                placeholder="字段key"
                class="col-input"
              />
              <a-select
                v-model:value="col.type"
                placeholder="列类型"
                class="col-type"
              >
                <a-select-option value="text">文本</a-select-option>
                <a-select-option value="number">数字</a-select-option>
                <a-select-option value="date">日期</a-select-option>
              </a-select>
              <a-tooltip title="是否必填">
                <a-switch
                  v-model:checked="col.required"
                  checked-children="必填"
                  un-checked-children="选填"
                />
              </a-tooltip>
              <a-button
                size="small"
                danger
                :disabled="field.columns.length <= 1"
                @click="removeColumn(field, colIdx)"
              >
                <template #icon><DeleteOutlined /></template>
              </a-button>
            </div>
            <a-button type="dashed" size="small" block @click="addColumn(field)">
              + 添加列
            </a-button>
          </div>
        </div>
      </a-card>
    </div>

    <!-- JSON 预览弹窗 -->
    <a-modal
      v-model:open="jsonVisible"
      title="表单 JSON 预览"
      width="720px"
      :footer="null"
    >
      <a-typography-paragraph>
        <pre class="json-preview">{{ jsonText }}</pre>
      </a-typography-paragraph>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useFormStore, FIELD_TYPES } from '../store/useFormStore'
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  CopyOutlined,
  DeleteOutlined
} from '@ant-design/icons-vue'

const router = useRouter()
const { state, addField, removeField, moveField, duplicateField, clearFields } = useFormStore()

const jsonVisible = ref(false)
const jsonText = computed(() => JSON.stringify(state, null, 2))

function showJsonPreview() {
  jsonVisible.value = true
}

function typeLabel(type) {
  return FIELD_TYPES[type]?.label || type
}

function typeColor(type) {
  const colors = {
    text: 'blue',
    radio: 'green',
    checkbox: 'orange',
    date: 'purple'
  }
  return colors[type] || 'default'
}

function addOption(field) {
  const idx = field.options.length + 1
  field.options.push({ label: `选项${idx}`, value: `option${idx}` })
}

function removeOption(field, idx) {
  field.options.splice(idx, 1)
}

function updateOptionValue(opt) {
  // 同步 value 与 label（若 value 未单独管理）
  opt.value = opt.label
}

function addColumn(field) {
  const idx = field.columns.length + 1
  field.columns.push({
    key: `col${idx}`,
    label: `列${idx}`,
    type: 'text',
    placeholder: '请输入',
    required: false
  })
}

function removeColumn(field, idx) {
  field.columns.splice(idx, 1)
}

function goPreview() {
  router.push({ name: 'preview' })
}
</script>

<style scoped>
.designer-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

.title-input {
  width: 280px;
  font-size: 16px;
  font-weight: 500;
}

.fields-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.field-card {
  border-radius: 6px;
}

.field-card-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.field-index {
  color: #999;
  font-size: 12px;
}

.field-label-preview {
  font-weight: 500;
}

.field-config {
  padding: 4px 0;
}

.config-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.config-label {
  font-size: 13px;
  color: #666;
}

.mt-12 {
  margin-top: 12px;
}

.options-editor {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.option-row {
  display: flex;
  gap: 8px;
  align-items: center;
}

.option-input {
  flex: 1;
  max-width: 360px;
}

.columns-editor {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.column-row {
  display: flex;
  gap: 8px;
  align-items: center;
}

.col-input {
  flex: 1;
}

.col-type {
  width: 110px;
}

.mb-8 {
  margin-bottom: 8px;
}

.json-preview {
  background: #f5f5f5;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  padding: 12px 16px;
  max-height: 60vh;
  overflow: auto;
  font-size: 13px;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-all;
  margin: 0;
}
</style>
