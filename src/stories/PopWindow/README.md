# PopWindow
----------------

## Usage
系統內所有 **彈出視窗**

---
## Sample Code

### $popWarn：用於警示刪除等將造成資料不可回復的彈窗
```
  const option = {
    data: {
      msg: '你確定要刪除資料嗎？',
    },
    callback: {
      ok: () => {
        // 執行刪除資料
      },
    },
  };
  this.$popWarn(option);
```
### $popCheck：其他類型的警示彈窗
```
  const option = {
    data: {
      msg: '編輯資料尚未儲存，確定要取消編輯嗎？',
    },
    callback: {
      ok: () => {
        // 執行取消編輯
      },
    },
  };
  that.$popCheck(option);
```

### $popDescription：段落式的說明文字彈窗，可點擊彈窗外範圍關閉
```
  const option = {
    title: '說明彈窗的標題',
    component: somePop,   // 自訂 popWindow 版型以 component 置入
  };
  that.$popDescription(option);
```

### $pop：自訂彈窗
```
  const options = {
    title: '彈窗的標題',
    component: somePop,   // 自訂 popWindow 版型以 component 置入
    data: {               // 傳入 somePop component 的 prop value
      myData: someData,   // value.myData        
      readonly: true,     // value.readonly
    },
    buttons: ['ok'],      // 自訂使用哪些預設按鈕 default: ['ok', 'cancel']
    validate: false,      // 點擊確認按鈕，是否傳入 validate event 至 component
    callback: {           // 點擊彈窗按鈕，觸發動作
      ok: (data) => {     // 點擊確認按鈕，接收傳入的 data
        // 執行某些動作
      },
    },
  };
  this.$pop(options);
```

---
## Options

| Option | Type | Accepted Values | Default | 說明 |
|---|---|---|---|---|
| title | String | - | - | 彈窗標題
| buttons | Array | - | ['ok', 'cancel'] | 預設彈窗按鈕配置
| ok_msg | String | - | '確認' | ok 按鈕顯示文字
| cancel_msg | String | - | '取消' | cancel 按鈕顯示文字
| component | Component | - | - | 自訂彈窗內容，以component置入
| bindValue | Boolean | - | true | 傳入 component 的 data 是否以 v-model 傳入
| data | Object | - | - | 傳入綁定 component 的 prop<br>如果 bindValue=true：在 prop value取得<br>如果bindValue=false：在 prop origData取得
| extData | Object | - | - | 傳入綁定 component 的 prop<br> 在 prop extData 取得<br><font color=red>Duplicated，盡量使用上方的 data 來傳值</font>
| disable_ok | Boolean | - | false | ok 按鈕是否預設為不可點擊
| validate | Boolean | - | false | 點擊 ok 按鈕後，傳入 'validate' 事件至綁定的 component
| custom_button | Array | [{<br>&nbsp;&nbsp;msg: that.$t('general.delete), // 按鈕文字<br>&nbsp;&nbsp;type: 'error',   // textButton type<br>&nbsp;&nbsp;closeAfterClick: // Boolean, 點擊後是否關閉彈窗<br>&nbsp;&nbsp;callback: // Function，點擊按鈕後執行<br>&nbsp;&nbsp;event: 'event-name' // String，要emit的事件名<br>&nbsp;&nbsp;payload: // emit event帶的payload}] | [] | 自訂按鈕，按鈕位置在彈窗右下角預設按鈕的左邊
| left_button | Object | {<br>&nbsp;&nbsp;msg: that.$t('general.delete'), // 按鈕文字<br>&nbsp;&nbsp;type: 'error',   // textButton type<br>&nbsp;&nbsp;closeAfterClick: // Boolean, 點擊後是否關閉彈窗<br>&nbsp;&nbsp;callback: // Function，點擊按鈕後執行<br>&nbsp;&nbsp;event: 'event-name' // String，要emit的事件名<br>&nbsp;&nbsp;payload: // emit event帶的payload} | undefined | 自訂按鈕，按鈕位置在彈窗左下角
| callback | Object | {<br>&nbsp;&nbsp;ok: // Function，點擊 ok 按鈕後執行<br>&nbsp;&nbsp;cancel: // Function，點擊 cancel 按鈕後執行<br>}


---
## Reminder Options
| Option | Type | Accepted Values | Default |Required| 說明 |
|---|---|---|---|---|---|
|buttonRef|String|'cancelBtn' or 'okBtn'|-|true|要讓小彈窗顯示在哪個button上|
|content|String|-|-|-|小彈窗的內容訊息|
|ok_msg|String|-|'確認'|-|ok 按鈕顯示文字|
|cancel_msg|String|-|'取消'|-|cancel 按鈕顯示文字|
|cancel|Function|-|-|-|預設會關掉彈窗|
|ok|Function|-|-|-|點擊 ok 按鈕後執行|


---
## popWindow Events

```
  // in Component somePop
  this.$emit('validateSuccess');  // 告知 popWindow 在 somePop 內資料驗證完成，popWindow 執行 callback ok 的動作
  this.$emit('disableOK');  // disable 彈窗 ok 按鈕
  this.$emit('enableOK');   // enable 彈窗 ok 按鈕
  this.$emit('cancel');  // 關閉彈窗
  this.$emit('showReminder', { // 顯示二次確認小彈窗
          buttonRef: 'cancelBtn', // 要讓小彈窗顯示在哪個button上面 ex: cancelBtn, okBtn
          content: '', // 小彈窗的內容訊息
          ok_msg: 'ok' // ok 按鈕顯示文字,
          cancel_msg: 'cancel' // cancel 按鈕顯示文字,
          cancel: () => { }, // cancel的callback，預設會關掉彈窗
          ok: () => { this.$emit('cancelValidateSuccess'); // ok的callback },
        });
```