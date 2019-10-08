# Tooltip
----------------

## Usage
系統內所有 **Tooltip**

---
## Sample Code
在元素上使用 plugin `v-tooltip` 加入

### Simple Usage: Hover 顯示黑底的一般提示 tooltip
```
  // template
  <div id="needTooltip" v-tooltip="tooltip"></div>

  // script
  tooltip: {
    msg: 'I am a tooltip',
  },
```

### Simple Usage: 紅底錯誤提示 tooltip
```
  // template
  <div id="needTooltip" v-tooltip="tooltip"></div>

  // script
  tooltip: {
    msg: 'I am a tooltip',
    errorType: true,
  },
```

### Simple Usage: 由 Event 觸發顯示的 tooltip
```
  // template
  <div id="needTooltip" ref="needTooltip" v-tooltip="tooltip"></div>

  // script
  tooltip: {
    msg: 'I am a tooltip',
    eventOnly: true,
  },
```

---
## Tooltip Object Options

| Object key | required | Type | Default | 說明 |
|---|---|---|---|---|
| msg | - | String | - | - | Tooltip 顯示的內容
| errorType | - | Boolean | false | Tooltip 樣式<br> false: 黑底一般 tooltip<br> true: 紅底錯誤 tooltip
| alignLeft | - | Boolean | false | Tooltip 顯示位置，<br> false: 元素右上角往右延伸<br>true: 元素右上角往左延伸
| left | - | Number | 0 | 自訂 Tooltip 離左方 offset (px)
| top | - | Number | 0 | 自訂 Tooltip 離上方 offset (px)
| animateShow | - | Boolean | false | Tooltip 是否會在一段時間後自動消失
| animateTime | - | Number 單位 ms | 3000 | Tooltip 出現時長，會自動消失
| clickShow | - | Boolean | false | 點擊元素觸發 Tooltip 出現，點擊元素外觸發 Tooltip 消失
| eventOnly | - | Boolean | false | Tooltip 是否僅由 Event 控制出現 / 消失，可觸發 Event，見下方 Tooltip Events

* 若 clickShow 和 eventOnly 皆為 false，Tooltip 預設為 Hover 出現

---
## Tooltip Events

#### 為相容 IE11 使用 tooltip event 必須要 <br>`import event from '@/utils/js/event';`<br> 使用 `event.createEvent(eventName)` 來 new Event Object

### tooltip-reload
重新載入 tooltip，經常用於更換 tooltip msg 時使用

```
  // template
  <div ref="elemBlock" v-tooltip="tooltip">
  </div>

  // script 
  tooltip.msg = 'I am a new tooltip msg';  // 假如更改 tooltip option
  this.$refs.elemBlock.dispatchEvent(event.createEvent('tooltip-reload')); // 重新載入tooltip 套用 更改
```

### tooltip-show
讓 tooltip 出現

```
  // template
  <div ref="elemBlock" v-tooltip="tooltip">
  </div>

  // script 
  this.$refs.elemBlock.dispatchEvent(event.createEvent('tooltip-show')); // 讓 tooltip 出現
```

### tooltip-hide
讓 tooltip 消失

```
  // template
  <div ref="elemBlock" v-tooltip="tooltip">
  </div>

  // script 
  this.$refs.elemBlock.dispatchEvent(event.createEvent('tooltip-hide')); // 讓 tooltip 消失
```