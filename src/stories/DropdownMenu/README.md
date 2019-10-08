# Dropdown Menu
----------------

## Usage
系統內 **可點擊 DOM 元素出現的context menu選單**，點擊選單選項，執行該選項綁定的動作，能用在任意 DOM 元素上

---
## Sample Code
在元素上使用 plugin `v-dropdown` 加入

#### <font color="red">Notice:</font>  
綁定 Dropdown Menu 的 DOM 元件 position 必須要設成 <font color="red">relative</font> 以讓 Dropdown 能相對於元件位置顯示

### Simple Usage
```
  // template
  <div id="needDropdown" v-dropdown="dropdownOption"></div>

  // script
  dropdownOption: {
    options: [
      {
        text: '選項一',
        onclick: clickOptionOne,
      },
      {
        text: '選項二',
        onclick: clickOptionTwo,
      },
      ...
    ],
  }

  // scss 
  #needDropdown {
    position: relative;
  }
```

### 自定寬度並往左方延伸的 DropdownMenu
```
  // template
  <div id="needDropdown" v-dropdown="dropdownOption"></div>

  // script
  dropdownOption: {
    width: '300px',
    alignLeft: true,
    options: [
      {
        text: '選項一',
        onclick: clickOptionOne,
      },
      {
        text: '選項二',
        onclick: clickOptionTwo,
      },
      ...
    ],
  }

  // scss
  #needDropdown {
    position: relative;
  }
```

---
## Dropdown Options
Type: Object of options

| Options | required | Type | Default | 說明 |
|---|---|---|---|---|
| options | true | Array | [<br>&nbsp;&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;text: 'some text',<br>&nbsp;&nbsp;&nbsp;&nbsp;onclick: function,<br>&nbsp;&nbsp;&nbsp;&nbsp;disabled: true, // Boolean, 選項是否可以點擊,<br>&nbsp;&nbsp;},<br>&nbsp;&nbsp;...<br>], | Array中每個Object是一個選項<br>text: 選項顯示文字<br>onclick: 點選選項執行的動作
| width | - | String | - | 自訂選單寬度
| alignLeft | - | Boolean | false | Menu 顯示位置，<br> false: 切齊元素左下角，DropdownMenu 往右延伸<br>true: 切齊元素右下角，DropdownMenu 往左長

---
## Tooltip Events

#### 為相容 IE11 使用 dropdown event 必須要 <br>`import event from '@/utils/js/event';`<br> 使用 `event.createEvent(eventName)` 來 new Event Object

### dropdown-reload
重新載入 dropdown，經常用於更新 dropdown 選項 時使用

```
  // template
  <div ref="elemBlock" v-dropdown="dropdownOption">
  </div>

  // script 
  dropdownOption.options = {    // 假如更改 tooltip option
    text: '我是新選項',
    onclick: handleClickOption,
  };  
  this.$refs.elemBlock.dispatchEvent(event.createEvent('dropdown-reload')); // 重新載入 dropdown 套用 更改
```

### dropdown-show
直接觸發 Event 強制讓 dropdown 出現

```
  // template
  <div ref="elemBlock" v-dropdown="dropdownOption">
  </div>

  // script 
  this.$refs.elemBlock.dispatchEvent(event.createEvent('dropdown-show')); // 讓 dropdown 出現
```

### dropdown-hide
直接觸發 Event 強制讓 dropdown 消失

```
  // template
  <div ref="elemBlock" v-tooltip="dropdownOption">
  </div>

  // script 
  this.$refs.elemBlock.dispatchEvent(event.createEvent('dropdown-hide')); // 讓 dropdown 消失
```