# Vue 3 + TypeScript + Vite

This template should help get you started developing with Vue 3 and TypeScript in Vite. The template uses Vue 3 `<script setup>` SFCs, check out the [script setup docs](https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup) to learn more.

Learn more about the recommended Project Setup and IDE Support in the [Vue Docs TypeScript Guide](https://vuejs.org/guide/typescript/overview.html#project-setup).

## 创建项目步骤：

### 1. 创建项目 (会提示输入项目名，回车确认即可，这里我们直接指定名字)
npm create vite@latest smart-nutri-admin -- --template vue-ts

### 2. 进入项目目录
cd smart-nutri-admin

### 3. 安装基础依赖
npm install

### 安装 核心库 (Router, Pinia, Axios)
npm install vue-router pinia axios

### 安装 UI组件库 (Element Plus) 和它的图标库
npm install element-plus @element-plus/icons-vue

### 安装 CSS 预处理器 (让写样式更方便)
npm install sass sass-loader -D

### 安装 工具库 (Dayjs处理时间, ECharts画图, VueUse常用工具)
npm install dayjs echarts @vueuse/core

### 安装 Node类型声明 (防止 TypeScript 报错)
npm install @types/node -D

