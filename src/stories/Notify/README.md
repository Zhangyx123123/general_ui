# Notification
----------------

## Usage
系統內所有 **系統通知** ，會在 5 秒後自動消失

#### <font color="red">NOTICE：</font>
通知訊息不宜過長，約 16 個全形字內為佳

---
## Sample Code

### <font color="#00A699">成功通知</font>
```
  // 只有 成功通知的 msg 需要用 object 方式傳入 { text: msg } 
  
  // script
  const msg = '這是成功通知';
  this.$notify({ text: msg });
```

### <font color="#1875F0">一般通知</font>
```
  // script
  const msg = '這是一般通知';
  this.$notifyInfo(msg);
```

### <font color="#f68c6d">警示通知</font>
```
  // script
  const msg = '這是警示通知';
  this.$notifyWarn(msg);
```

### <font color="#f76260">錯誤通知</font>
```
  // script
  const msg = '這是錯誤通知';
  this.$notifyFail(msg);
```