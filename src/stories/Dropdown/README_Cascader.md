# Dropdown Cascader
----------------

## Usage
系統內所有 **兩層式下拉式選單**

---
## Sample Code

### Simple Usage
```
  <dropdown-cascader
    v-model="checkedValue"
    :options="options"
    :width="300px"
    :placeholder="placeholder"
  />
```

---
## Props

| Prop | required | Type | Default | 說明 |
|---|---|---|---|---|
| value<br>(v-model) | - | Array | [ checkedFirstLayer, checkedSecondLayer ] | 已選中的選項，依序是選中項目的第一層 value 和 第二層 value
| options | - | Array | 見下方 [option 格式說明](#options) | - | 下拉選單內的選項
| width | - | String | auto | 自訂下拉 Input 框寬度
| placeholder | - | String | - | 自訂沒選擇選項時顯示的placeholder

<a id="options"></aid>
### props: options 格式說明

Type: Array of Objects
每個 Object 是 **第一層選項**，將依序列在下拉選單中

| Object Keys | required | Type | Default | 說明 |
|---|---|---|---|---|
| text | true | String | - | 顯示的選項文字
| value | true | String | - | 該選項的 value
| options | true | Array | - | 第二層選項，格式同第一層選項，但沒有 options


```
  options: [
    {
      text: '選項 1',
      value: 'val 1'
      options: [
        {
          text: '選項 1-1',
          value: 'val 1-1',
        },
        {
          text: '選項 1-2',
          value: 'val 1-2',
        },
      ]
    },
    {
      text: '選項 2',
      value: 'val 2'
      options: [
        {
          text: '選項 2-1',
          value: 'val 2-1',
        }
      ],
    },
  ]
```

---
## Emit Events

| Event | Callback $event | 說明 |
|---|---|---|
| input | Array of checked values | 點選選項時，回傳目前選中的選項