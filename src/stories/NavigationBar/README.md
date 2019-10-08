# Info Input
----------------

## Usage
系統內 **有分頁的Navigation Bar**，可以設置右手邊 SearchInput

* 如果 page header 只包含 分頁 nav 和 search input 時，Navigation Bar 本身可以作為一個完整的 page header 使用
* 使用時必須在 component 引用 NavigationBar 

```import NavBar from '@/components/NavigationBar';```

---
## Sample Code

### Simple Usage
```
  // template
  <nav-bar
    v-model="currentPage"
    :options="pageOption"
  >
  </nav-bar>
  
  // script
  import NavBar from '@/components/NavigationBar'; 
```

### Navigaiton Bar with Search Input on righthand side

```
  // template
  <nav-bar
    v-model="currentPage"
    :options="pageOption"
    @search="doSearch"
    showSearch>
  </nav-bar>
  
  // script
  import NavBar from '@/components/NavigationBar'; 
```


---
## Props

| Prop | required | Type | Default | 說明 |
|---|---|---|---|---|
| value<br>(v-model) | false | String | - | 當前 Active 的選項，若沒有傳入，則沒有初始 Active 的選項
| options | true | {<br>&nbsp;&nbsp;pageKey: pageName,<br>&nbsp;&nbsp;...<br>}, | {} | 可放入多組由 pageKey 和 pageName 組成的 key-value pair<br>**pageKey:** 選項的key值<br>**pageName:** 顯示的選項名稱
| showSearch | false | Boolean | false | 是否顯示搜尋框

---
## Emit Events

| Event | Callback $event | 說明 |
|---|---|---|
| input | pageKey | 點擊 Navigation Bar 切換分頁時，回傳點選的 pageKey
| search | inputText | 搜尋框 focus 時按 enter，回傳搜尋框內輸入的文字內容