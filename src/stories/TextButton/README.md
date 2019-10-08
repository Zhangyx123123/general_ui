# Text Button
----------------

## Usage
系統內所有 **文字按鈕** 或 **帶Icon的文字按鈕** 

---
## Sample Code

### Simple Usage
```
  <text-button button-type="primary" @click="handleOnClick">
    按鈕上的文字
  </text-button>
```
### Button with Icon
```
  <text-button
    :button-type="'default'"
    :icon-type="'info_warning'"
    :icon-size="16"
    @click="handleOnClick">
    有Icon的按鈕
  </text-button>
```
---
## Props

| Prop | required | Type | Default | 說明 |
|---|---|---|---|---|
| buttonType | - | One of ['default', 'fill', 'primary', 'disable', 'error'] | 'default' | 按鈕的樣式類型<br>**'default'**: 預設樣式，通常用於導入、導出及其他一般操作按鈕上<br>**'fill'**: 一般樣式<br>**'primary'**: 主要樣式，通常用於新增、搜尋、儲存等按鈕上<br>**'disable'**: 失效按鈕<br>**'error'**: 錯誤按鈕，通常用於刪除等按鈕上|
| width | - | String | '60px' | 按鈕寬度，若沒給固定值，會自動依按鈕文字長度變寬
| height | - | String | '28px' | 按鈕高度
| iconType | - | One of IconTypes | - | 給予 iconType 以使用有 icon 的按鈕
| iconSize | - | Number | 16 | icon 大小
| iconAlign | - | One of ['left', 'right'] | 'left' | 指定icon 位置在按鈕內左方或右方

---
## Emit Events

| Event | Callback $event | 說明 |
|---|---|---|
| click | onclick event | 點擊按鈕事件 |