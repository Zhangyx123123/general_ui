# Label Switch
----------------

## Usage
系統內 **可切換選項的Switch**

---
## Sample Code

### Simple Usage
```
  <label-switch
    v-model="selectAction"
    :options="labelOptions"
    @change="handleChange"
  />
```

---
## Props

| Prop | required | Type | Accepted Values | Default | 說明 |
|---|---|---|---|---|---|
| value<br>(v-model) | false | String / Number | - | - | 當前 Active 的選項 val 值，若沒有傳入，則沒有初始 Active 的選項
| options | true | Array | [<br>&nbsp;&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;text: ...,<br>&nbsp;&nbsp;&nbsp;&nbsp;val: ...,<br>&nbsp;&nbsp;},<br>&nbsp;&nbsp;...<br>], | [] | 可放入多組選項 Object，每個選項需包含<br>**text：**顯示的選項名稱<br>**val：** 選項的 value

---
## Emit Events

| Event | Callback $event | 說明 |
|---|---|---|
| change | optionValue | 點擊 LabelSwitch 切換選項時，回傳點選的選項 value