# General Table
----------------

## Usage
系統內所有 **表格**

---

## Sample Code

### Simple Usage
```
  <general-table
    :table-data="tableData"
    :table-header="tableHeader"
    auto-height
    show-empty>
  </general-table>
```
### Table with checkbox
```
  <general-table 
    :table-header="tableHeader"
    :table-data="tableData
    :action="tableAction"
    @checkedChange="handleCheckedChange"
    checkbox
    showEmpty>
  </general-table>
```

---

## Props

| Prop | Required | Type | Default | 說明 |
|---|---|---|---|---|
| tableHeader | true | 見下方 [tableHeader 格式說明](#tableHeader) | - | 表格標題列 |
| tableData | true | 見下方 [tableData格式說明](#tableData) | - | 表格內容 |
| showEmpty | - | Boolean | false | 在無資料列時，是否顯示「暫無數據」
| showEmptyMsg | - | Array<br>[ 'msg1', 'msg2' ] | - | 在無資料時，顯示自訂的無數據訊息，預設顯示「暫無數據」
| checkbox | - | Boolean | false | 是否顯示 checkbox
| action | - | 見下方 [action格式說明](#action) | - | 若傳入 action，會顯示「操作」欄位
| autoHeight | -| Boolean | false | 欄位內容溢出寬度時是否換行
| fontClass | - | One of ['font-12', 'font-14', 'font-16'] | 'font-14' | 調整表格字體大小
| onclickRow | - | Function<br>function (rowData, rowIdx) | - | 若傳入 onclickRow function，則 表格資料行可以點擊，<br>點擊對綁定的 function 傳入 rowData, rowIdx
| isLoading | - | Boolean | false | 表格是否正在載入中，若 true 會顯示表格載入樣式

<a id="#tableHeader"></a>
### prop: tableHeader 格式
Type: Array of Objects

| Object Keys | Required | Type | Default | 說明 |
|---|---|---|---|---|
| key | true | String | - | 欄位 Header key 值，對應 TableData的 Object key 
| text | true | String | - | 欄位 Header 顯示名稱
| type | - | One of ['tag', 'toggle', 'action', 'icon'] | undefined | 欄位 body 類型<br> **'tag'** : 標籤樣式欄位，對應的tableData 欄位須為Array，Array 中的每個 text 會顯示成標籤樣式，見[tableData格式](#tableData)<br> **'toggle'**：toggle樣式欄位，對應的tableData欄位需指定toggle初始狀態，見[tableData格式](#tableData)<br> **'action'**：action樣式欄位，與prop action大致相同，但可每筆資料有不同的action按鈕，見[tableData格式](#tableData)<br> **'icon'**：icon樣式欄位，欄位內顯示icon，見[tableData格式](#tableData)
| info | - | String | - | 欄位 Header 的 說明資訊，給定 info 會在 Header 旁出現info Icon，滑到 info Icon 上方，可以看到欄位說明
| width | - | String | - | 欄位寬度，如 '200px', '20%'


```
  // Example:

  tableHeader: [
    {
      key: 'attr',
      text: '欄位名',
      width: '120px',
    },
    {
      key: 'attr-tag',
      text: '標籤欄位',
      type: 'tag',
    },
    {
      key: 'attr-toggle',
      text: '狀態欄位',
      type: 'toggle',
    },
    {
      key: 'attr-action',
      text: '操作欄位',
      type: 'action',
    },
    {
      key: 'attr-icon',
      text: 'icon欄位',
      type: 'icon',
    },
  ]
```

<a id="#tableData"></a>
### prop: tableData 格式
Type: Array of Objects
每個 Object 代表一列資料列
Object key 值應與唯一的 tableHeader 的 key 相對應，代表某個標題欄下的資料值

#### 以下是**特殊欄位**格式定義

| tableHeader.type 為.. | Type | Example | 說明 |
|---|---|---|---|
| 'tag' | Array of tag texts | ['這是標籤一', '這是標籤二'] | Array 中每個 text 各自會以標籤樣式呈現
| 'toggle' | Object | { "val" : true } | 只有唯一的 key 值 val 用來設置 toggle 開關狀態
| 'action' | Array of actions Objecs | [<br>&nbsp;&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;text: '',<br>&nbsp;&nbsp;&nbsp;&nbsp;type: 'primary',<br>&nbsp;&nbsp;&nbsp;&nbsp;onclick: function<br>&nbsp;&nbsp;},<br>] | 與prop: action類似，但可對每筆資料自訂不同action，若每筆資料操作相同，建議使用prop: action
| 'icon' | Object | {<br>&nbsp;&nbsp;iconType: 'check', <br>&nbsp;&nbsp;iconSize: 20, <br>} | 欄位內顯示 icon
| 有傳入action時可使用<br>action_enable | Object | {"edit": true, "delete": true} | 非必要，可控制「操作」欄位定義的操作是否可以點擊<br>key值須對應到 action 的 key
| hightlight | Boolean | true / false | 資料行是否 highlight 底色為深灰色



```
  // Example: 以 上方 tableHeader 範例為例

  tableData : [
    {
      attr: '這是欄位內容',   // 一般欄位的 type 應為 string
      attr-tag: ['這是標籤一', '這是標籤二'],
      attr-toggle: {
        "val" : true
      },
      attr-action: {
        text: '編輯',         // 操作顯示文字
        type: 'primary',     // 'primary', 沒設置為黑色
        onclick: handleEdit, // 點擊操作觸發
      },
      attr-icon: {
        iconType: 'check',   // 任一可使用的 icon-type，見 Icon
        iconSize: 20,        // number, 控制icon大小
      },
      action_enable: {  // 假設有傳入下方 action 範例，可設置action_enable
        "edit" : true,
        "delete" : true, 
      },
      hightlight: true,      // 是否 highlight 底色為深灰色
    },
    ...
  ]
```

<a id="#action"></a>
### prop: action 格式
Type: Array of Objects
每個 Object 代表一個可用的操作按鈕，目前可以放置 1 ~ 2 個操作按鈕

| Object Keys | Required | Type | Default | 說明 |
|---|---|---|---|---|
| key | true | String | - | 操作 key 值
| text | true | String | - | 操作顯示文字
| type | - | One of ['primary', 'error'] | undefined | 定義操作按鈕顏色<br>'primary': 主要顏色<br>'error': 錯誤顏色<br> 沒設置 type 為黑色
 onclick | - | function<br>function (dataRow) | - | 點擊操作觸發的事件<br> callback $event 傳入點擊的操作按鈕所在資料列資料 dataRow

```
  action: [
    {
      "key": "edit",
      "text": "編輯",
      "type": "primary"
    },
    {
      "key": "delete",
      "text": "刪除",
      "type": "error"
    }
  ]
```

---

## Emit Events

| Event | Callback $event | 說明 |
|---|---|---|
| checkedChange | checkedData | 有設置 checkbox 時，點擊 checkbox，回傳已勾選的所有資料列 |