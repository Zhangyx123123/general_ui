# Loading
----------------

## Usage
系統內 **Loading 動畫**，包含 `<loading-dot>` 和 `<loading-dot>` 兩種

`<loading-line>` 使用時機：使用者觸發某操作 eg.點擊訓練按鈕，而需要等待系統回覆的 loading
`<loading-dot>` 使用時機：系統載入頁面內容時的 loading

---
## Sample Code

### Loading Line
```
  <loading-line
    :magnify="magnifyLine">
  </loading-line>
```

### Loading Dot
```
  <loading-dot
    :magnify="magnifyDot">
  </loading-dot>
```


---
## Props

| Prop | required | Type | Default | 說明 |
|---|---|---|---|---|
| magnify | false | Number | 1 | Loading 動畫放大/縮小倍數