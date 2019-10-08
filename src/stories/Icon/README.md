# Icon
----------------

## Usage
系統內所有 **Icon**

---
## Sample Code

### Simple Usage
```
  <icon
    iconType="iconType"
    :size="iconSize"
    >
  </icon>
```

### Icon with Hover style
```
  <icon
    iconType="iconType"
    :size="iconSize"
    enableHover
    >
  </icon>
```
---
## Props

| Prop | required | Type | Default | 說明 |
|---|---|---|---|---|
| iconType | true | One of 下方[可用 Icons](#myIcons) |  - | Icon 樣式
| size | - | Number | 0 | Icon 大小，單位為 px
| enableHover | - | Boolean | false | Icon 是否允許 Hover 樣式<br>對名稱為 'info' 的 Icon 使用enableHover，hover 時 icon 會替換成 'info_hover' Icon
| button | - | Boolean | false | Hover Icon 時 cursor 是否使用 pointer

---
## Emit Events

| Event | Callback $event | 說明 |
|---|---|---|
| click | onclick event | 點擊 Icon 事件 |

---
<a id="myIcons"></a>

## 可用 Icons
* <h3>[General Icons](#generalIcons)</h3>
* <h3>[Tool Control Icons](#toolControlIcons)</h3>
* <h3>[Arrow Icons](#arrowIcons)</h3>
* <h3>[Menu Icons](#menuIcons)</h3>
* <h3>[Header Icons](#headerIcons)</h3>
* <h3>[Notification & Info Icons](#notificationAndInfoIcons)</h3>
* <h3>[Category Tree Icons](#categoryTreeIcons)</h3>
* <h3>[Intent Page Icons](#intentPageIcons)</h3>
* <h3>[Robot Profile Icons](#robotProfileIcons)</h3>
* <h3>[TaskEngineV2 Icons](#taskEngineV2Icons)</h3>
* <h3>[Other Icons](#otherIcons)</h3>


<a id="generalIcons"></a>
### General Icons
| iconType | Icon | hovered iconType | Icon |
| --- | --- | --- | --- |
| check | <img src="../../assets/icons/check_icon.svg"/>
| check_green | <img src="../../assets/icons/check_green_icon.svg"/>
| checked | <div style="background:black"><img src="../../assets/icons/checked_icon.svg"/></div>
| delete | <img src="../../assets/icons/delete_icon.svg"/> | delete_hover | <img src="../../assets/icons/delete_hover_icon.svg"/>
| edit_pen | <img src="../../assets/icons/edit_pen_icon.svg"/>
| edit_blue | <img src="../../assets/icons/edit_blue_icon.svg"/>
| edit_white | <div style="background:black"><img src="../../assets/icons/edit_white_icon.svg"/></div>
| edit_thin | <img src="../../assets/icons/edit_thin_icon.svg"/>
| setting | <img src="../../assets/icons/setting_icon.svg"/> | setting_hover | <img src="../../assets/icons/setting_hover_icon.svg"/>
| search | <img src="../../assets/icons/search_icon.svg"/>
| upload | <img src="../../assets/icons/upload_icon.svg"/>
| export | <img src="../../assets/icons/export_icon.svg"/>
| trash_can | <img src="../../assets/icons/trash_can_icon.svg"/>

<a id="toolControlIcons"></a>
### Tool Control Icons
| iconType | Icon |  hovered iconType | Icon |
| --- | --- | --- | --- |
| daggle | <img src="../../assets/icons/daggle_icon.svg"/>
| more | <img src="../../assets/icons/more_icon.svg"/> | more_hover | <img src="../../assets/icons/more_hover_icon.svg"/>
| more_blue | <img src="../../assets/icons/more_blue_icon.svg"/>
| close_expand | <img src="../../assets/icons/close_expand_icon.svg"/>


<a id="arrowIcons"></a>
### Arrow Icons
| iconType | Icon |
| --- | --- |
| red_arrow | <img src="../../assets/icons/red_arrow_icon.svg"/>
| year_left | <img src="../../assets/icons/year_left_icon.svg"/>
| year_right | <img src="../../assets/icons/year_right_icon.svg"/>
| month_left | <img src="../../assets/icons/month_left_icon.svg"/>
| month_right | <img src="../../assets/icons/month_right_icon.svg"/>
| month_right_white | <div style="background:black"><img src="../../assets/icons/month_right_white_icon.svg"/></div>

<a id="menuIcons"></a>
### Menu Icons
| iconType | Icon |
| --- | --- |
| menu_expand | <div style="background:black"><img src="../../assets/icons/menu_expand_icon.svg"/></div> |
| menu_statistics | <img src="../../assets/icons/menu_statistics_icon.svg"/>
| menu_ssm | <img src="../../assets/icons/menu_ssm_icon.svg"/>
| menu_robot | <img src="../../assets/icons/menu_robot_icon.svg"/>
| menu_wordbank | <img src="../../assets/icons/menu_wordbank_icon.svg"/>
| menu_te | <img src="../../assets/icons/menu_te_icon.svg"/>
| menu_privilege | <img src="../../assets/icons/menu_privilege_icon.svg"/>
| menu_dashboard | <img src="../../assets/icons/menu_dashboard_icon.svg"/>
| menu_intent | <img src="../../assets/icons/menu_intent_icon.svg"/>

<a id="headerIcons"></a>
### Header Icons 
| iconType | Icon |
| --- | --- |
| header_enterprise | <div style="background:black"><img src="../../assets/icons/header_enterprise_icon.svg"/></div>
| header_user | <div style="background:black"><img src="../../assets/icons/header_user_icon.svg"/></div>
| header_dialog | <div style="background:black"><img src="../../assets/icons/header_dialog_icon.svg"/></div>
| header_dropdown | <div style="background:black"><img src="../../assets/icons/header_dropdown_icon.svg"/></div>
| header_dropdown_gray | <img src="../../assets/icons/header_dropdown_gray_icon.svg"/>
| header_dropdown_white | <div style="background:black"><img src="../../assets/icons/header_dropdown_white_icon.svg"/></div>
| robot | <div style="background:black"><img src="../../assets/icons/robot_icon.svg"/></div>

<a id="notificationAndInfoIcons"></a>
### Notification & Info Icons
| iconType | Icon | hovered iconType | Icon |
| --- | --- | --- | --- |
| info | <img src="../../assets/icons/info_icon.svg"/> | info_hover | <img src="../../assets/icons/info_hover_icon.svg"/>
| info_success | <img src="../../assets/icons/info_success_icon.svg"/>
| info_warning | <img src="../../assets/icons/info_warning_icon.svg"/>
| info_warning_gray | <img src="../../assets/icons/info_warning_gray_icon.svg"/>
| info_error | <img src="../../assets/icons/info_error_icon.svg"/>
| info_close | <img src="../../assets/icons/info_close_icon.svg"/>

<a id="categoryTreeIcons"></a>
### Category Tree Icons
| iconType | Icon |
| --- | --- |
| category_add | <img src="../../assets/icons/category_add_icon.svg"/>
| category_close | <img src="../../assets/icons/category_close_icon.svg"/>
| category_dropdown | <img src="../../assets/icons/category_dropdown_icon.svg"/>
| category_open | <img src="../../assets/icons/category_open_icon.svg"/>

<a id="monitorIcons"></a>
### Monitor Icons
| iconType | Icon | hovered iconType | Icon |
| --- | --- | --- | --- |
| detail | <img src="../../assets/icons/detail_icon.svg"/> | detail_hover | <img src="../../assets/icons/detail_hover_icon.svg"/>
| stop | <img src="../../assets/icons/stop_icon.svg"/> | stop_hover | <img src="../../assets/icons/stop_hover_icon.svg"/>
| start | <img src="../../assets/icons/start_icon.svg"/> | start_hover | <img src="../../assets/icons/start_hover_icon.svg"/>
| pause | <img src="../../assets/icons/pause_icon.svg"/> | pause_hover | <img src="../../assets/icons/pause_hover_icon.svg"/>
| list | <img src="../../assets/icons/list_icon.svg"/> | list_hover | <img src="../../assets/icons/list_hover_icon.svg"/>
| monitor | <img src="../../assets/icons/monitor_icon.svg"/> | monitor_hover | <img src="../../assets/icons/monitor_hover_icon.svg"/>
| edit_task | <img src="../../assets/icons/edit_task_icon.svg"/> | edit_task_hover | <img src="../../assets/icons/edit_task_hover_icon.svg"/>
| delete_task | <img src="../../assets/icons/delete_task_icon.svg"/> | delete_task_hover | <img src="../../assets/icons/delete_task_hover_icon.svg"/>

<a id="intentPageIcons"></a>
### Intent Page Icons
| iconType | Icon |
| --- | --- | 
| intent | <img src="../../assets/icons/intent_icon.svg"/> 

<a id="robotProfileIcons"></a>
### Robot Profile Icons
| iconType | Icon |
| --- | --- | 
| profile_question | <img src="../../assets/icons/profile_question_icon.svg"/>
| profile_answer | <img src="../../assets/icons/profile_answer_icon.svg"/>

<a id="taskEnginenV2Icons"></a>
### TaskEngineV2 Top Panel Icons
| iconType | Icon |
| --- | --- | 
| save | <img src="../../assets/icons/save_icon.svg"/>
| canlendar | <img src="../../assets/icons/canlendar_icon.svg"/>
| knowledge_base | <img src="../../assets/icons/knowledge_base_icon.svg"/>

<a id="otherIcons"></a>
### Others
| iconType | Icon |
| --- | --- |
| add | <img src="../../assets/icons/add_icon.svg"/>
| close | <img src="../../assets/icons/close_icon.svg"/>
| drop_down | <img src="../../assets/icons/drop_down_icon.svg"/>
| edit | <img src="../../assets/icons/edit_icon.svg"/>
| enterprise_admin | <img src="../../assets/icons/enterprise_admin_icon.svg"/>
| expand | <img src="../../assets/icons/expand_icon.svg"/>
| help | <img src="../../assets/icons/help_icon.svg"/>
| normal_acc | <img src="../../assets/icons/normal_acc_icon.svg"/>
| white_add | <div style="background:black"><img src="../../assets/icons/white_add_icon.svg"/></div>