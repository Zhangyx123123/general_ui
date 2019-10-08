## General CSS Style
---
參考 Zeplin [Style Guide](https://app.zeplin.io/project/5ad950fa2fd3d795016d89e2/screen/5b077259592aae584688458f)

### 可以使用以下已定義的字體大小 (已搭配適當的line-height)
```
  @include font-12px();
  @include font-14px();
  @include font-16px();
```

### 可以使用以下已定義的顏色

### 系統主色
<div style="display: inline-block"><font color=#1875f0 size=5>顏色</font></div> <div style="display:inline-flex;background-color:#1875f0; color: white"><font size=5>顏色</font></div> `$color-primary: #1875f0;` 

<div style="display: inline-block"><font color=#00a699 size=5>顏色</font></div> <div style="display:inline-flex;background-color:#00a699; color: white"><font size=5>顏色</font></div> `$color-success: #00a699; `

<div style="display: inline-block"><font color=#f68c6d size=5>顏色</font></div> <div style="display:inline-flex;background-color:#f68c6d; color: white"><font size=5>顏色</font></div> `$color-warning: #f68c6d; ` 

<div style="display: inline-block"><font color=#f76260 size=5>顏色</font></div> <div style="display:inline-flex;background-color:#f76260; color: white"><font size=5>顏色</font></div> `$color-error: #f76260;`

<div style="display: inline-block"><font color=#65748d size=5>顏色</font></div> <div style="display:inline-flex;background-color:#65748d; color: white"><font size=5>顏色</font></div> `$color-icon: #65748d;`

<div style="display: inline-block"><font color=#f7f7f7 size=5>顏色</font></div> <div style="display:inline-flex;background-color:#f7f7f7; color: white"><font size=5>顏色</font></div> `$color-disabled: #f7f7f7;`


### 文字顏色
<div style="display: inline-block"><font color=#666666 size=5>顏色</font></div> <div style="display:inline-flex;background-color:#666666; color: white"><font size=5>顏色</font></div> `$color-font-normal: #666666;` 

<div style="display: inline-block"><font color=#333333 size=5>顏色</font></div> <div style="display:inline-flex;background-color:#333333; color: white"><font size=5>顏色</font></div> `$color-font-active: #333333; `

<div style="display: inline-block"><font color=#999999 size=5>顏色</font></div> <div style="display:inline-flex;background-color:#999999; color: white"><font size=5>顏色</font></div> `$color-font-mark: #999999; ` 

<div style="display: inline-block"><font color=#cccccc size=5>顏色</font></div> <div style="display:inline-flex;background-color:#cccccc;color: white"><font size=5>顏色</font></div> `$color-font-disabled: #cccccc;`


### 邊框顏色
<div style="display: inline-block"><font color=#dbdbdb size=5>顏色</font></div> <div style="display:inline-flex;background-color:#dbdbdb; color: white"><font size=5>顏色</font></div> `$color-borderline: #dbdbdb;` 

<div style="display: inline-block"><font color=#e9e9e9 size=5>顏色</font></div> <div style="display:inline-flex;background-color:#e9e9e9; color: white"><font size=5>顏色</font></div> `$color-borderline-disabled: #e9e9e9;` 

<div style="display: inline-block"><font color=#4b4b64 size=5>顏色</font></div> <div style="display:inline-flex;background-color:#4b4b64; color: white"><font size=5>顏色</font></div> `$color-borderline-hover: #4b4b64;`


### 其他顏色
<div style="display: inline-block"><font color=#4b4b64 size=5>顏色</font></div> <div style="display:inline-flex;background-color:#4b4b64; color: white"><font size=5>顏色</font></div> `$color-button: #4b4b64;` 

<div style="display: inline-block"><font color=#ffffff size=5>顏色</font></div> <div style="display:inline-flex;background-color:#ffffff; color: white"><font size=5>顏色</font></div> `$color-white: #ffffff; `

<div style="display: inline-block"><font color=#F4F4F4 size=5>顏色</font></div> <div style="display:inline-flex;background-color:#F4F4F4; color: white"><font size=5>顏色</font></div> `$color-select: #F4F4F4; ` 

<div style="display: inline-block"><font color=#9393A2 size=5>顏色</font></div> <div style="display:inline-flex;background-color:#9393A2; color: white"><font size=5>顏色</font></div> `$color-select-hover: #9393A2;`

<div style="display: inline-block"><font color=#FEF3F0 size=5>顏色</font></div> <div style="display:inline-flex;background-color:#FEF3F0; color: white"><font size=5>顏色</font></div> `$color-input-error: #FEF3F0;`


## Page Layout
---
* 全站每頁上方標題字體統一
  ```
    @include font-16px();
    color: $color-font-active;
  ```

* 全站內文字型統一
  ```
    @include font-14px();
    color: $color-font-normal;
  ```

### 使用 class `card` 套用卡片樣式

#### Example: 寬高滿版的卡片
```
  <div class="card w-fill h-fill">
  </div>
```

#### 可套用樣式
| class | 說明 |
| --- | --- |
| card | 套用卡片樣式
| h-fill | 高度 滿版
| h-half | 高度 50%
| h-auto | 高度 auto
| w-fill | 寬度 滿版
| w-half | 寬度 50%
| w-auto | 寬度 auto


## Scrollbar
---
需要出現 Scrollbar 的地方，在 scss 引用

```
  // Overflow 時出現 Scrollbar
  @include auto-overflow();   // overflow x or y 都出現
  @include auto-overflowX();  // 只有 overflow x 方向出現
  @include auto-overflowY();  // 只有 overflow y 方向出現

  // Scrollbar 樣式
  @include customScrollbar();
  @include customXScrollbar();
```

## VPagination 分頁組件
---
使用 vue-easytable 的 VPagination，參考文件 [vue-easytable](http://doc.huangsw.com/vue-easytable/app.html#/pagination)

使用 `<v-pagination>` 引用分頁組件
系統內的分頁組件參考以下方式設定
```
  <v-pagination
    size="small"      // 組件大小，系統內統一為 small
    :pageIndex="pageIndex"    // 當前分頁頁碼
    :total="totalCount"       // 共有幾筆資料
    :page-size="pageLimit"    // 每頁顯示幾筆
    :pageSizeOption="[25, 50, 100, 200, 500, 1000]"   // 下拉選擇每頁顯示幾筆，系統內統一為此設定
    :layout="['prev', 'pager', 'next', 'sizer', 'jumper']" // 組建佈局設置，系統內統一為此設定
    @page-change="handlePageChange"  // 切換分頁時觸發，回傳前往頁碼
    @page-size-change="handlePageSizeChange" > // 每頁顯示幾筆改變時觸發，回傳每頁顯示筆數
  </v-pagination>
```


## 代補文件
---
### Basic Components
* <s>Icon</s>
* <s>DateTimePicker</s>
* TagInput
* <s>V-Pagination</s>

### Other Components
* CategoryCard & CategoryTreeItem

### Vue Prototype Extensions
* <s>$popWindow README</s> $popWindow Demo效果待修
* <s>$notify</s>

### Plugins
* <s>Tooltip</s>
* <s>DropdownMenu</s>