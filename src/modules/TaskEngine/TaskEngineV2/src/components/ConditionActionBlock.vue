<template>
<div class="condition-action-block">
  <div class="header">
    <button class="add" @click="addConditionActionClick($event, 'toggleAddCondition')" v-dropdown="sourceDropdown" @blur="toggleAddCondition = false">
      {{ $t('task_engine_v2.condition_action_block.add_condition')}}
      <img class="arrow" :class="{rotate180: toggleAddCondition}" src="@/assets/icons/expand_blue_icon.svg"/>
    </button>
    <button class="add" @click="addConditionActionClick($event, 'toggleAddAction')" v-dropdown="actionDropdown" @blur="toggleAddAction = false">
      {{ $t('task_engine_v2.condition_action_block.add_action')}}
      <img class="arrow" :class="{rotate180: toggleAddAction}" src="@/assets/icons/expand_blue_icon.svg"/>
    </button>
    <span class="info">
      {{ $t('task_engine_v2.condition_action_block.to') }}
      {{ $t('task_engine_v2.condition_action_block.colon') }}
      <div class="to-node">{{ toNodeText }}</div>
      {{ $t('task_engine_v2.condition_action_block.condition_action', { condition: rules.length, action: actions.length + 1}) }}
    </span>
    <button
      class="delete"
      v-if="edgeType!=='pc_succeed' && edgeType!=='pc_failed' && edgeType!=='virtual_global_edges'"
      @click="deleteEdge">
      {{ $t('task_engine_v2.condition_action_block.delete') }}
    </button>
    <button class="toggle" :class="{collapse: !showConditionsAndActions}" @click="togglebutton">
      <img src="@/assets/icons/month_left_icon.svg"/>
    </button>
  </div>
  <template v-if="showConditionsAndActions">
    <!-- 条件设置 -->
    <div class="normal-edge" v-if="(edgeType==='normal' || edgeType==='trigger' || edgeType==='normal_2.0') && rules.length">
      <div class="title" v-t="'task_engine_v2.condition_action_block.condition_setup'"></div>
      <div class="dropdown-select-container">
        {{ $t('task_engine_v2.condition_action_block.match') }}
        <dropdown-select
          class="dropdown-select"
          :options="conditionOptions"
          :showCheckedIcon="false"
          width="100px"
          @input="selectedOption = [conditionOptions.find(option => option.value === $event[0]).value]"
          :value="selectedOption"
          :inputBarStyle="selectStyle">
          </dropdown-select>
        {{ $t('task_engine_v2.condition_action_block.below_conditions')}}
      </div>
      <draggable v-model='reles' :options="{ghostClass:'ghost'}" @start="drag=true" @end="drag=false; emitUpdate();" >
        <template v-for="(rule, index) in rules">
        <div :key="rule.id" class="block">
          <div class="row">
            <span class="label" v-if="index === 0" v-t="'task_engine_v2.condition_action_block.if'"></span>
            <span class="label" v-if="index !== 0">{{ andOrIfText }}</span>
            <dropdown-select
              class="dropdown-select"
              :ref="`selectSource_${index}`"
              :value="[rule.source]"
              @input="onSelectSourceInput(index, $event)"
              :options="sourceOptions"
              :showCheckedIcon="false"
              :inputBarStyle="selectStyle"/>
            <dropdown-select
              class="dropdown-select"
              :ref="`selectFunction_${index}`"
              :value="[rule.funcName]"
              @input="onSelectFunctionInput(index, $event)"
              :options="getFuncOptions(rule.source)"
              :showCheckedIcon="false"
              :fixedListWidth="false"
              :inputBarStyle="selectStyle"/>
            <icon class="trash" :size="14" iconType="trash" @click="deleteRule(index)"></icon>
          </div>
          <!-- 完全相符 / 包含文本 -->
          <div class="row" v-if="rule.funcName === 'match' || rule.funcName == 'contains'">
            <span class="label" v-t="'task_engine_v2.condition_action_block.label_content'"></span>
            <input ref="input-content" class="input-content" v-model="rule.content" v-tooltip="inputTooltip" :placeholder="$t('task_engine_v2.condition_action_block.input_placeholder')" @focus="onInputFocus"/>
          </div>
          <!-- 正则表示式 -->
          <div class="row" v-if="rule.funcName === 'regular_exp'">
            <span class="label" v-t="'task_engine_v2.condition_action_block.label_pattern'"></span>
            <input ref="input-content" class="input-content" v-model="rule.content.pattern" v-tooltip="inputTooltip" :placeholder="$t('task_engine_v2.condition_action_block.input_placeholder')" @focus="onInputFocus"/>
          </div>
          <!-- Intent -->
          <div class="row" v-if="rule.funcName === 'intent_parser'">
            <span class="label" v-t="'task_engine_v2.condition_action_block.label_content'"></span>
            <div class="dropdown-container"
              :key="intentDropdown.options.length ? `${index}_has_options`: index"
              v-dropdown="renderIntentDropdown(index)"
            >
              <input ref="input-content" v-tooltip="inputTooltip" class="input-content" v-model="rule.content.intentName" @focus="onInputFocus">
            </div>
          </div>
          <!-- 键值匹配 -->
          <div :key="rule.funcName" v-if="rule.funcName === 'key_val_match'">
            <div class="row">
              <span class="label" v-t="'task_engine_v2.condition_action_block.label_compare_operator'"></span>
              <dropdown-select
                class="dropdown-select"
                :key="rule.funcName"
                :value="[rule.content.compare]"
                @input="rule.content.compare = $event[0]"
                :options="keyValMatchCompareOptions"
                :showCheckedIcon="false"
                :inputBarStyle="selectStyle"/>
            </div>
            <div class="row">
              <span class="label" v-t="'task_engine_v2.condition_action_block.label_key'"></span>
              <div ref="insertVarDropdown" class="dropdown-container" v-dropdown="insertVarDropdown(rule.id, rule.content, 'key')">
                <input ref="input-content" v-tooltip="inputTooltip" class="input-content" v-model="rule.content.key" :placeholder="$t('task_engine_v2.condition_action_block.input_placeholder')" @focus="onInputFocus">
              </div>
            </div>
            <div class="row">
              <span class="label" v-t="'task_engine_v2.condition_action_block.label_value'"></span>
              <input v-if="rule.content.compare === '>' || rule.content.compare === '>=' || rule.content.compare === '<' || rule.content.compare === '<='"
                class="input-content"
                oninput="this.value = this.value.replace(/[^0-9]/g, '');"
                v-model="rule.content.val"
                :placeholder="$t('task_engine_v2.condition_action_block.input_placeholder')"
                @focus="onInputFocus"/>
              <input v-else
                class="input-content"
                v-model="rule.content.val"
                :placeholder="$t('task_engine_v2.condition_action_block.input_placeholder')"
                @focus="onInputFocus"/>
            </div>
          </div>
          <!-- 键键匹配 -->
          <div :key="rule.funcName" v-if="rule.funcName === 'key_key_match'">
            <div class="row">
              <span class="label" v-t="'task_engine_v2.condition_action_block.label_compare_operator'"></span>
              <dropdown-select
                class="dropdown-select"
                :key="rule.funcName"
                :value="[rule.content.compare]"
                @input="rule.content.compare = $event[0]"
                :options="keyKeyMatchCompareOptions"
                :showCheckedIcon="false"
                :inputBarStyle="selectStyle"/>
            </div>
            <div class="row">
              <span class="label" v-t="'task_engine_v2.condition_action_block.label_key'"></span>
              <div ref="insertVarDropdown" class="dropdown-container" v-dropdown="insertVarDropdown(rule.id, rule.content, 'key1')">
                <input ref="input-content" v-tooltip="inputTooltip" class="input-content" v-model="rule.content.key1" :placeholder="$t('task_engine_v2.condition_action_block.input_placeholder')" @focus="onInputFocus">
              </div>
            </div>
            <div class="row">
              <span class="label" v-t="'task_engine_v2.condition_action_block.label_key'"></span>
              <div ref="insertVarDropdown" class="dropdown-container" v-dropdown="insertVarDropdown(rule.id, rule.content, 'key2')">
                <input ref="input-content" v-tooltip="inputTooltip" class="input-content" v-model="rule.content.key2" :placeholder="$t('task_engine_v2.condition_action_block.input_placeholder')" @focus="onInputFocus"/>
              </div>
            </div>
          </div>
          <!-- 包含键 -->
          <div :key="rule.funcName" class="row" v-if="rule.funcName === 'contain_key'">
            <span class="label" v-t="'task_engine_v2.condition_action_block.label_key'"></span>
            <div ref="insertVarDropdown" class="dropdown-container" v-dropdown="insertVarDropdown(rule.id, rule.content, 'key')">
              <input ref="input-content" v-tooltip="inputTooltip" class="input-content" v-model="rule.content.key" :key="rule.funcName" :placeholder="$t('task_engine_v2.condition_action_block.input_placeholder')" @focus="onInputFocus">
            </div>
          </div>
          <!-- 不包含键 -->
          <div :key="rule.funcName" class="row" v-if="rule.funcName === 'not_contain_key'">
            <span class="label" v-t="'task_engine_v2.condition_action_block.label_key'"></span>
            <div ref="insertVarDropdown" class="dropdown-container" v-dropdown="insertVarDropdown(rule.id, rule.content, 'key')">
              <input ref="input-content" v-tooltip="inputTooltip" class="input-content" v-model="rule.content.key" :key="rule.funcName" :placeholder="$t('task_engine_v2.condition_action_block.input_placeholder')" @focus="onInputFocus">
            </div>
          </div>
           <!-- 序列长度匹配 -->
           <div :key="rule.funcName" v-if="rule.funcName === 'list_length_match'">
            <div class="row">
              <span class="label" v-t="'task_engine_v2.condition_action_block.label_compare_operator'"></span>
              <dropdown-select
                class="dropdown-select"
                :key="rule.funcName"
                :value="[rule.content.compare]"
                @input="rule.content.compare = $event[0]"
                :options="listLengthMatchCompareOptions"
                :showCheckedIcon="false"
                :inputBarStyle="selectStyle"/>
            </div>
            <div class="row">
              <span class="label" v-t="'task_engine_v2.condition_action_block.label_key'"></span>
              <div ref="insertVarDropdown" class="dropdown-container" v-dropdown="insertVarDropdown(rule.id, rule.content, 'key')">
                <input ref="input-content" v-tooltip="inputTooltip" class="input-content" v-model="rule.content.key" :placeholder="$t('task_engine_v2.condition_action_block.input_placeholder')" @focus="onInputFocus">
              </div>
            </div>
            <div class="row">
              <span class="label" v-t="'task_engine_v2.condition_action_block.label_value'"></span>
              <input
                class="input-content"
                ref="input-content"
                v-tooltip="inputTooltip"
                oninput="this.value = this.value.replace(/[^0-9]/g, '');"
                v-model="rule.content.val"
                :placeholder="$t('task_engine_v2.condition_action_block.input_placeholder')"
                @focus="onInputFocus"/>
            </div>
          </div>
          <!-- 轮次检查 -->
          <div class="row" v-if="rule.funcName === 'counter_check'">
            <span class="label" v-t="'task_engine_v2.condition_action_block.label_content'"></span>
            <dropdown-select
              class="dropdown-select"
              :key="rule.funcName"
              :value="[rule.content]"
              @input="rule.content = $event[0]"
              :options="counterCheckOptions"
              :showCheckedIcon="false"
              :inputBarStyle="selectStyle"/>
          </div>
          <!-- 正则表示式 -->
          <template v-if="rule.funcName === 'regular_exp_from_var'">
            <div class="row">
              <span class="label" v-t="'task_engine_v2.condition_action_block.label_pattern'"></span>
              <input ref="input-content" v-tooltip="inputTooltip" class="input-content" v-model="rule.content.pattern" :placeholder="$t('task_engine_v2.condition_action_block.input_placeholder')" @focus="onInputFocus"/>
            </div>
            <div class="row">
              <span class="label" v-t="'task_engine_v2.condition_action_block.label_source_key'"></span>
              <div ref="insertVarDropdown" class="dropdown-container" v-dropdown="insertVarDropdown(rule.id, rule.content, 'from_key')">
                <input ref="input-content" v-tooltip="inputTooltip" class="input-content" v-model="rule.content.from_key" :placeholder="$t('task_engine_v2.condition_action_block.input_placeholder')" @focus="onInputFocus">
              </div>
            </div>
          </template>
          <!-- 数据转换解析匹配 -->
          <div :key="rule.funcName" v-if="rule.funcName === 'user_custom_transform'">
            <div class="row">
              <span class="label" v-t="'task_engine_v2.condition_action_block.label_mapping_table'"></span>
              <dropdown-select
                class="dropdown-select"
                filterable
                :value="[rule.content.trans]"
                @input="rule.content.trans = $event[0]"
                :options="mapTableOptions"
                :showCheckedIcon="false"
                :inputBarStyle="selectStyle"/>
            </div>
            <div class="row">
              <span class="label" v-t="'task_engine_v2.condition_action_block.label_source_key'"></span>
              <div ref="insertVarDropdown" class="dropdown-container" v-dropdown="insertVarDropdown(rule.id, rule.content, 'from_key')">
                <input ref="input-content" v-tooltip="inputTooltip" class="input-content" v-model="rule.content.from_key" :placeholder="$t('task_engine_v2.condition_action_block.input_placeholder')" @focus="onInputFocus"/>
              </div>
            </div>
          </div>
        </div>
      </template>
      </draggable>
    </div>
    <!-- 执行动作 -->
    <div class="normal-edge" v-if="(edgeType==='normal' || edgeType==='trigger' || edgeType==='normal_2.0')">
      <div class="title" v-t="'task_engine_v2.condition_action_block.action_setup'"></div>
      <draggable v-model='actions' :options="{ghostClass:'ghost'}" @start="drag=true" @end="drag=false; emitUpdate();">
      <template v-for="(action, index) in actions">
        <div :key="action.id" class="block">
          <!-- 键值赋值 / 键键赋值-->
          <template v-if="action.type === ActionType.AssignValue">
            <div class="row">
              <span class="label" v-t="'task_engine_v2.condition_action_block.label_assign_value'"></span>
              <dropdown-select
                class="dropdown-select"
                :ref="`selectSource_${index}`"
                :value="[action.content.operation]"
                @input="action.content.operation = $event[0];"
                :options="assignValueOptions"
                :showCheckedIcon="false"
                :inputBarStyle="selectStyle"/>
              <icon class="trash" :size="14" iconType="trash" @click="deleteAction(index)"></icon>
            </div>
            <div class="row" v-if="action.content.operation === 'set_key_to_value'">
              <span class="label" v-t="'task_engine_v2.condition_action_block.label_exec'"></span>
              <div key="set_key_to_value_input1" ref="insertVarDropdown" class="dropdown-container" v-dropdown="insertVarDropdown(action.id, action.content, 'key')">
                <input ref="input-content" v-tooltip="inputTooltip" class="input-content" v-model="action.content.key" :placeholder="$t('task_engine_v2.condition_action_block.key_placeholder')" @focus="onInputFocus">
              </div>
              <span class="label" v-t="'task_engine_v2.condition_action_block.label_equal'"></span>
              <input ref="input-content" v-tooltip="inputTooltip" class="input-content" v-model="action.content.val" :placeholder="$t('task_engine_v2.condition_action_block.value_placeholder')" @focus="onInputFocus"/>
            </div>
            <div class="row" v-if="action.content.operation === 'set_key_to_key'">
              <span class="label" v-t="'task_engine_v2.condition_action_block.label_exec'"></span>
              <div key="set_key_to_key_input1" ref="insertVarDropdown" class="dropdown-container" v-dropdown="insertVarDropdown(action.id, action.content, 'key1')">
                <input ref="input-content" v-tooltip="inputTooltip" class="input-content" v-model="action.content.key1" :placeholder="$t('task_engine_v2.condition_action_block.key_placeholder')" @focus="onInputFocus">
              </div>
              <span class="label" v-t="'task_engine_v2.condition_action_block.label_equal'"></span>
              <div ref="insertVarDropdown" class="dropdown-container" v-dropdown="insertVarDropdown(action.id, action.content, 'key2')">
                <input ref="input-content" v-tooltip="inputTooltip" class="input-content" v-model="action.content.key2" :placeholder="$t('task_engine_v2.condition_action_block.key_placeholder')" @focus="onInputFocus">
              </div>
            </div>
          </template>
          <!-- Web API 调用 -->
          <div class="row" v-if="action.type === ActionType.WebAPI">
            <span class="label" v-t="'task_engine_v2.condition_action_block.label_web_api'"></span>
            <input ref="input-content" v-tooltip="inputTooltip" class="input-content" v-model="action.content" :placeholder="$t('task_engine_v2.condition_action_block.http_placeholder')" @focus="onInputFocus"/>
            <icon class="trash" :size="14" iconType="trash" @click="deleteAction(index)"></icon>
          </div>
          <!-- 文字回复 -->
          <div class="row" v-if="action.type === ActionType.ResponseText">
            <span class="label" v-t="'task_engine_v2.condition_action_block.label_text_response'"></span>
            <input ref="input-content" v-tooltip="inputTooltip" class="input-content" v-model="action.content" :placeholder="$t('task_engine_v2.condition_action_block.input_placeholder')" @focus="onInputFocus"/>
            <icon class="trash" :size="14" iconType="trash" @click="deleteAction(index)"></icon>
          </div>
          <!-- 自定义解析器 -->
          <template v-if="action.type === ActionType.CustomParser">
            <div class="row">
              <span class="label" v-t="'task_engine_v2.condition_action_block.label_custom_parser'"></span>
              <dropdown-select
                class="dropdown-select"
                :ref="`selectSource_${index}`"
                :value="[action.parser]"
                @input="customParserInput(action, {parser: $event[0], source: 'text'})"
                :options="customParserOptions"
                :placeholder="$t('task_engine_v2.condition_action_block.parser_placeholder')"
                :showCheckedIcon="false"
                :showSearchBar="true"
                :inputBarStyle="selectStyle"/>
              <icon class="trash" :size="14" iconType="trash" @click="deleteAction(index)"></icon>
            </div>
            <div :key="action.parser" v-if="action.parser != null">
              <div class="row">
                <span class="label" v-t="'task_engine_v2.condition_action_block.label_source'"></span>
                <dropdown-select
                  class="dropdown-select"
                  :ref="`selectSource_${index}`"
                  :value="[action.source]"
                  @input="customParserInput(action, {source: $event[0], parser: action.parser})"
                  :options="sourceOptions"
                  :showCheckedIcon="false"
                  :inputBarStyle="selectStyle"/>
              </div>
              <div class="row" v-if="action.source === 'global_info'">
                <span class="label" v-t="'task_engine_v2.condition_action_block.label_source_key'"></span>
                <div ref="insertVarDropdown" class="dropdown-container" v-dropdown="insertVarDropdown(action.id, action.content, 'from_key')">
                  <input ref="input-content" v-tooltip="inputTooltip" class="input-content" v-model="action.content.from_key" :placeholder="$t('task_engine_v2.condition_action_block.input_placeholder')" @focus="onInputFocus">
                </div>
              </div>
            </div>
          </template>
          <!-- 解析器 -->
          <template v-if="action.type === ActionType.Parser">
            <div class="row">
              <span class="label" v-t="'task_engine_v2.condition_action_block.label_parser'"></span>
              <dropdown-select
                class="dropdown-select"
                :ref="`selectSource_${index}`"
                :value="[action.parser]"
                @input="parserInput(action, {parser: $event[0], source: 'text'})"
                :options="parserOptions"
                :placeholder="$t('task_engine_v2.condition_action_block.parser_placeholder')"
                :showCheckedIcon="false"
                :inputBarStyle="selectStyle"/>
              <icon class="trash" :size="14" iconType="trash" @click="deleteAction(index)"></icon>
            </div>
            <!-- 规则解析器 -->
            <div :key="action.parser" v-if="action.parser === 'reg_parser'">
              <div class="row">
                <span class="label" v-t="'task_engine_v2.condition_action_block.label_source'"></span>
                <dropdown-select
                  class="dropdown-select"
                  :ref="`selectSource_${index}`"
                  :value="[action.source]"
                  @input="parserInput(action, {source: $event[0], parser: action.parser})"
                  :options="sourceOptions"
                  :showCheckedIcon="false"
                  :inputBarStyle="selectStyle"/>
              </div>
              <div class="row">
                <span class="label" v-t="'task_engine_v2.condition_action_block.label_pattern'"></span>
                <input ref="input-content" v-tooltip="inputTooltip" class="input-content" v-model="action.content.pattern" :placeholder="$t('task_engine_v2.condition_action_block.reg_placeholder')" @focus="onInputFocus"/>
              </div>
              <div class="row" v-if="action.source === 'global_info'">
                <span class="label" v-t="'task_engine_v2.condition_action_block.label_source_key'"></span>
                <div ref="insertVarDropdown" class="dropdown-container" v-dropdown="insertVarDropdown(action.id, action.content, 'from_key')">
                  <input ref="input-content" v-tooltip="inputTooltip" class="input-content" v-model="action.content.from_key" @focus="onInputFocus">
                </div>
              </div>
              <div class="row">
                <span class="label"></span>
                <button
                  class="add-new-row"
                  v-t="'task_engine_v2.condition_action_block.add_target_key'"
                  @click="action.content.operations.push({index: 0, key: '', operation: 'set_to_global_info'})">
                </button>
              </div>
              <template v-for="(operation, idx) in action.content.operations">
                <div class="row" :key="idx">
                  <span class="label" v-t="'task_engine_v2.condition_action_block.label_match'"></span>
                  <input class="input-content" ref="input-content" v-tooltip="inputTooltip"
                      oninput="this.value = this.value.replace(/[^0-9]/g, ''); this.value = this.value.replace(/(^[0-9]{1,2}).*/g, '$1');"
                      v-model.number="operation.index"
                      @focus="onInputFocus"/>
                  <span class="label" v-t="'task_engine_v2.condition_action_block.label_target_key'"></span>
                  <input ref="input-content" v-tooltip="inputTooltip" class="input-content" v-model="operation.key" @focus="onInputFocus">
                  <button class="delete-button" v-t="'task_engine_v2.condition_action_block.delete'" @click="action.content.operations.splice(idx, 1)"></button>
                </div>
              </template>
            </div>
            <!-- 是否解析器 -->
            <div :key="action.parser" v-if="action.parser === 'polarity_parser'">
              <div class="row">
                <span class="label" v-t="'task_engine_v2.condition_action_block.label_source'"></span>
                <dropdown-select
                  class="dropdown-select"
                  :ref="`selectSource_${index}`"
                  :value="[action.source]"
                  @input="parserInput(action, {source: $event[0], parser: action.parser})"
                  :options="sourceOptions"
                  :showCheckedIcon="false"
                  :inputBarStyle="selectStyle"/>
              </div>
              <div class="row" v-if="action.source === 'global_info'">
                <span class="label" v-t="'task_engine_v2.condition_action_block.label_source_key'"></span>
                <div ref="insertVarDropdown" class="dropdown-container" v-dropdown="insertVarDropdown(action.id, action.content, 'from_key')">
                  <input ref="input-content" v-tooltip="inputTooltip" class="input-content" v-model="action.content.from_key" :placeholder="$t('task_engine_v2.condition_action_block.input_placeholder')" @focus="onInputFocus">
                </div>
              </div>
              <div class="row">
                <span class="label" v-t="'task_engine_v2.condition_action_block.label_target_key'"></span>
                <input ref="input-content" v-tooltip="inputTooltip" class="input-content" v-model="action.content.key" :placeholder="$t('task_engine_v2.condition_action_block.input_placeholder')" @focus="onInputFocus"/>
              </div>
            </div>
            <!-- 酒店预定语句解析器 / 通用语句解析器 / 场景语句解析器 -->
            <div :key="action.parser" v-if="action.parser === 'common_parser' || action.parser === 'hotel_parser' || action.parser === 'task_parser'">
              <div class="row">
                <span class="label" v-t="'task_engine_v2.condition_action_block.label_source'"></span>
                <dropdown-select
                  class="dropdown-select"
                  :ref="`selectSource_${index}`"
                  :value="[action.source]"
                  @input="parserInput(action, {source: $event[0], parser: action.parser})"
                  :options="sourceOptions"
                  :showCheckedIcon="false"
                  :inputBarStyle="selectStyle"/>
              </div>
              <div class="row">
                <span class="label" v-t="'task_engine_v2.condition_action_block.label_content'"></span>
                <dropdown-select
                  class="dropdown-select"
                  :key="action.funcName"
                  :ref="`selectTargetEntity_${index}`"
                  :multi="true"
                  :value="action.content.tags.split(',')"
                  @input="action.content.tags = $event.join(',')"
                  :options="entityModuleOptions(action.funcName)"
                  :showCheckedIcon="true"
                  :showSearchBar="true"
                  :placeholder="$t('task_engine_v2.condition_action_block.multi_placeholder')"
                  :inputBarStyle="selectFixedStyle"/>
              </div>
              <div class="row" v-if="action.source === 'global_info'">
                <span class="label" v-t="'task_engine_v2.condition_action_block.label_source_key'"></span>
                <div ref="insertVarDropdown" class="dropdown-container" v-dropdown="insertVarDropdown(action.id, action.content, 'from_key')">
                  <input ref="input-content" v-tooltip="inputTooltip" class="input-content" v-model="action.content.from_key" :placeholder="$t('task_engine_v2.condition_action_block.input_placeholder')" @focus="onInputFocus">
                </div>
              </div>
            </div>
            <!-- 转换数据解析器 -->
            <div :key="action.parser" v-if="action.parser === 'user_custom_parser'">
              <div class="row">
                <span class="label" v-t="'task_engine_v2.condition_action_block.label_source'"></span>
                <dropdown-select
                  class="dropdown-select"
                  :ref="`selectSource_${index}`"
                  :value="[action.source]"
                  @input="parserInput(action, {source: $event[0], parser: action.parser})"
                  :options="sourceOptions"
                  :showCheckedIcon="false"
                  :inputBarStyle="selectStyle"/>
              </div>
              <div class="row">
                <span class="label" v-t="'task_engine_v2.condition_action_block.label_mapping_table'"></span>
                <dropdown-select
                  :key="action.source"
                  class="dropdown-select"
                  filterable
                  :value="[action.content.trans]"
                  @input="action.content.trans = $event[0]"
                  :options="mapTableOptions"
                  :showCheckedIcon="false"
                  :inputBarStyle="selectStyle"/>
              </div>
              <div class="row" v-if="action.source === 'global_info'">
                <span class="label" v-t="'task_engine_v2.condition_action_block.label_source_key'"></span>
                <div ref="insertVarDropdown" class="dropdown-container" v-dropdown="insertVarDropdown(action.id, action.content, 'from_key')">
                  <input ref="input-content" v-tooltip="inputTooltip" class="input-content" v-model="action.content.from_key" :placeholder="$t('task_engine_v2.condition_action_block.input_placeholder')" @focus="onInputFocus"/>
                </div>
              </div>
              <div class="row">
                <span class="label" v-t="'task_engine_v2.condition_action_block.label_target_key'"></span>
                <input ref="input-content" v-tooltip="inputTooltip" class="input-content" v-model="action.content.to_key" :placeholder="$t('task_engine_v2.condition_action_block.input_placeholder')" @focus="onInputFocus"/>
              </div>
            </div>
            <!-- NLU解析器 -->
            <div :key="action.parser" v-if="action.parser === 'nlu_parser'">
              <div class="row" v-if="(action.funcUrl !== undefined && action.funcUrl !== '') || hadCustomUrl">
                <div class="label label-start">
                  {{$t("task_engine_v2.condition_block.label_link")}}
                </div>
                <input v-tooltip="inputTooltip" class="input-content" v-model="action.funcUrl" @focus="onInputFocus">
              </div>
              <div class="row">
                <span class="label" v-t="'task_engine_v2.condition_action_block.label_type'"></span>
                <dropdown-select
                  class="dropdown-select"
                  :ref="`selectSource_${index}`"
                  :value="[action.nluType]"
                  :placeholder="$t('task_engine_v2.condition_action_block.nlu_placeholder')"
                  @input="nluParserInput(action, { nluType: $event[0], source: 'text'})"
                  :options="nluTypeOptions"
                  :showCheckedIcon="false"
                  :inputBarStyle="selectStyle"/>
              </div>
              <div class="row" v-if="action.nluType === NLUTypeMap.TIME">
                <span class="label" v-t="'task_engine_v2.condition_action_block.label_default'"></span>
                <dropdown-select
                  class="dropdown-select"
                  :ref="`selectSource_${index}`"
                  :value="[action.content.tags.split(',')[0]]"
                  @input="action.content.tags = $event[0]"
                  :options="nluTimeOptions"
                  :showCheckedIcon="false"
                  :inputBarStyle="selectStyle"/>
              </div>
              <template v-if="action.nluType === NLUTypeMap.SELECT">
                <div class="row">
                  <span class="label" v-t="'task_engine_v2.condition_action_block.label_select_mode'"></span>
                  <dropdown-select
                    class="dropdown-select"
                    :ref="`selectSource_${index}`"
                    :value="[action.content.tags.split(',')[0]]"
                    @input="setNluSelectOptionType(action, $event[0])"
                    :options="nluSelectOptions"
                    :showCheckedIcon="false"
                    :inputBarStyle="selectStyle"/>
                </div>
                <template v-if="action.content.tags === NLUParserMap.SELECT_CUSTOMIZE_OPTIONS">
                  <div class="row">
                    <span class="label"></span>
                    <button
                      class="add-new-row"
                      v-t="'task_engine_v2.condition_action_block.add_option'"
                      @click="addNLUSelectOption(action)">
                    </button>
                  </div>
                  <div class="row" v-for="(option, index) in action.content.options" :key="index">
                    <span class="label">{{`${$t('task_engine_v2.condition_action_block.label_option')}${index + 1}`}}</span>
                    <input ref="input-content" v-tooltip="inputTooltip" class="input-content" v-model="action.content.options[index]" @focus="onInputFocus">
                    <button class="delete-button red" v-t="'task_engine_v2.condition_action_block.delete'" @click="action.content.options.splice(index, 1); $forceUpdate();"></button>
                  </div>
                </template>
                <div class="row" v-if="action.content.tags === NLUParserMap.SELECT_OPTIONS_IN_KEY">
                  <span class="label" v-t="'task_engine_v2.condition_action_block.label_option_key'"></span>
                  <input ref="input-content" v-tooltip="inputTooltip" class="input-content" v-model="action.content.option_key" :placeholder="$t('task_engine_v2.condition_action_block.input_placeholder')" @focus="onInputFocus">
                </div>
                <div class="row">
                  <span class="label" v-t="'task_engine_v2.condition_action_block.label_fuzzy_match'"></span>
                  <toggle v-model="action.content.fuzzy_match" :size="'medium'" :showLabel="true" :label="toggleLabel"></toggle>
                </div>
              </template>
              <div class="row">
                <span class="label" v-t="'task_engine_v2.condition_action_block.label_source'"></span>
                <dropdown-select
                  :key="action.source"
                  class="dropdown-select"
                  :ref="`selectSource_${index}`"
                  :value="[action.source]"
                  @input="action.source = $event[0]; delete action.content.from_key"
                  :options="sourceOptions"
                  :showCheckedIcon="false"
                  :inputBarStyle="selectStyle"/>
              </div>
              <div class="row" v-if="action.source === 'global_info'">
                <span class="label" v-t="'task_engine_v2.condition_action_block.label_source_key'"></span>
                <div ref="insertVarDropdown" class="dropdown-container" v-dropdown="insertVarDropdown(action.id, action.content, 'from_key')">
                  <input ref="input-content" v-tooltip="inputTooltip" class="input-content" v-model="action.content.from_key" :placeholder="$t('task_engine_v2.condition_action_block.input_placeholder')" @focus="onInputFocus">
                </div>
              </div>
              <div class="row" v-if="action.nluType === NLUTypeMap.PERSON_NAME">
                <span class="label" v-t="'task_engine_v2.condition_action_block.label_get_surname'"></span>
                <toggle :value="renderOnlyParseSurname(action.content.tags)" @change="onlyParseSurnameChange(action, $event)" :size="'medium'" :showLabel="true" :label="toggleLabel"></toggle>
              </div>
              <div class="row"
                v-if="action.content.tags!==NLUParserMap.SELECT_CUSTOMIZE_OPTIONS &&
                      action.content.tags!==NLUParserMap.SELECT_OPTIONS_IN_KEY &&
                      action.content.tags!==NLUParserMap.POLARITY">
                <span class="label" v-t="'task_engine_v2.condition_action_block.label_has_context'"></span>
                <toggle v-model="action.content.has_context" :size="'medium'" :showLabel="true" :label="toggleLabel"></toggle>
              </div>
            </div>
          </template>
          <!-- JS 脚本使用 -->
          <template v-if="action.type === ActionType.JSScript">
            <div class="row">
              <span class="label" v-t="'task_engine_v2.condition_action_block.label_script'"></span>
              <dropdown-select
                class="dropdown-select"
                :value="[action.content]"
                @input="action.content = $event[0]"
                :options="jsCodeOptions"
                :placeholder="$t('task_engine_v2.condition_action_block.script_placeholder')"
                :showCheckedIcon="false"/>
              <icon class="trash" :size="14" iconType="trash" @click="deleteAction(index)"></icon>
            </div>
          </template>
          <!-- 删除键 -->
          <div class="row" v-if="action.type === ActionType.RemoveKey">
            <span class="label" v-t="'task_engine_v2.condition_action_block.label_remove_key'"></span>
            <input ref="input-content" v-tooltip="inputTooltip" class="input-content" v-model="action.content" :placeholder="$t('task_engine_v2.condition_action_block.key_placeholder')" @focus="onInputFocus"/>
            <icon class="trash" :size="14" iconType="trash" @click="deleteAction(index)"></icon>
          </div>
        </div>
      </template>
      </draggable>
      <div class="block">
        <div class="row" v-if="edgeType!=='trigger'">
          <span class="label" v-t="'task_engine_v2.condition_action_block.to'"></span>
          <dropdown-select
            class="dropdown-select"
            ref="selectGoto"
            filterable
            :value="[toNode]"
            @input="onSelectGoto($event[0])"
            :options="toNodeOptions"
            :fixedListWidth="false"
            :showCheckedIcon="false"
            :inputBarStyle="selectStyle"/>
        </div>
      </div>
    </div>
  </template>
</div>
</template>

<script>
import draggable from 'vuedraggable';
import event from '@/utils/js/event';
import DropdownSelect from '@/components/DropdownSelect';
import intentApi from '@/modules/IntentEngine/_api/intent';
import Toggle from '@/components/basic/Toggle';
import general from '@/modules/TaskEngine/_utils/general';
import taskEngineApi from '@/modules/TaskEngine/_api/taskEngine';
import nerFactoryDalApi from '@/modules/TaskEngine/_api/nerFactoryDal';
import scenarioInitializer from '../_utils/scenarioInitializer';
import optionConfig from '../_utils/optionConfig';


const ActionType = optionConfig.ActionType;
const NLUParserMap = optionConfig.NLUParserMap;
const NLUTypeMap = optionConfig.NLUTypeMap;
const NLUTypeOptions = optionConfig.NLUTypeOptions;
const ConditionOption = {
  AND: 'AND',
  OR: 'OR',
};
const NLUTimeParsers = optionConfig.NLUTimeParsers;
const NLUSelectParsers = optionConfig.NLUSelectParsers;

export default {
  api: intentApi,
  components: {
    draggable,
    DropdownSelect,
    Toggle,
  },
  props: {
    num: {
      type: Number,
    },
    index: {
      type: Number,
    },
    showConditionsAndAction: {
      type: Boolean,
    },
    nodeId: {
      type: String,
      required: true,
    },
    initialEdge: {
      type: Object,
      required: true,
    },
    toNodeOptions: {
      type: Array,
      required: true,
    },
    globalVarOptions: {
      type: Array,
      required: true,
    },
    mapTableOptions: {
      type: Array,
      required: true,
    },
    jsCodeAlias: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    const edge = this.initialEdge;
    const edgeType = edge.edge_type;
    const sourceOptions = optionConfig.getSourceOptionsV2(this);
    const sourceDropdownOptions = sourceOptions.map(option => ({
      ...option,
      onclick: () => {
        this.addRule(option.value);
        this.toggleAddCondition = false;
      },
    }));
    const sourceDropdown = {
      width: '150px',
      alignLeft: true,
      options: sourceDropdownOptions,
    };
    const actionOptions = optionConfig.getActionOptions(this);
    const actionDropdownOptions = actionOptions.map(option => ({
      ...option,
      onclick: () => {
        this.addAction(option.value);
        this.toggleAddAction = false;
      },
    }));
    const actionDropdown = {
      width: '150px',
      alignLeft: true,
      options: actionDropdownOptions,
    };
    const funcOptionMap = optionConfig.getFuncOptionMapV2(this);
    const actionOptionMap = optionConfig.getActionOptionMap(this);
    const keyValMatchCompareOptions = optionConfig.getKeyValMatchCompareOptions(this);
    const keyKeyMatchCompareOptions = optionConfig.getKeyKeyMatchCompareOptions(this);
    const listLengthMatchCompareOptions = optionConfig.getListLengthMatchCompareOptions(this);
    const counterCheckOptions = optionConfig.getCounterCheckOptions(this);
    const obj = this.renderNormalEdge(edge);
    const rules = obj.rules;
    const toNode = obj.toNode;
    const actions = obj.actions;
    const conditionOptions = [
      { text: this.$t('task_engine_v2.condition_action_block.condition_options.all'), value: ConditionOption.AND },
      { text: this.$t('task_engine_v2.condition_action_block.condition_options.any'), value: ConditionOption.OR },
    ];
    this.getTaskConfigInfo();
    return {
      edge,
      edgeType,
      rules,
      actions,
      toNode,
      selectStyle: {
        height: '32px',
        'border-radius': '2px',
      },
      selectFixedStyle: {
        height: '32px',
        'border-radius': '2px',
        flex: true,
        width: '522px',
      },
      keyValMatchCompareOptions,
      keyKeyMatchCompareOptions,
      listLengthMatchCompareOptions,
      counterCheckOptions,
      sourceOptions,
      funcOptionMap,
      inputTooltip: {
        msg: this.$t('task_engine_v2.err_empty'),
        eventOnly: true,
        errorType: true,
        alignLeft: true,
        absolute: true,
      },
      toggleAddCondition: false,
      toggleAddAction: false,
      showConditionsAndActions: true,
      sourceDropdown,
      actionDropdown,
      conditionOptions,
      selectedOption: [edge.logic || conditionOptions[0].value],
      intentDropdown: {
        width: '450px',
        options: [],
      },
      ActionType,
      assignValueOptions: actionOptionMap[ActionType.AssignValue],
      customParser: [],
      customParserOptions: [],
      parserOptions: actionOptionMap[ActionType.Parser],
      nluTypeOptions: NLUTypeOptions.map(parser => ({
        text: this.$t(`task_engine_v2.condition_action_block.nlu_options.${parser}`),
        value: parser,
      })),
      NLUTypeMap,
      nluTimeOptions: NLUTimeParsers.map(parser => ({
        text: this.$t(`task_engine_v2.condition_action_block.nlu_time_options.${parser}`),
        value: parser,
      })),
      nluSelectOptions: NLUSelectParsers.map(parser => ({
        text: this.$t(`task_engine_v2.condition_action_block.nlu_select_options.${parser}`),
        value: parser,
      })),
      NLUParserMap,
      toggleLabel: {
        on: this.$t('task_engine_v2.condition_action_block.on'),
        off: this.$t('task_engine_v2.condition_action_block.off'),
      },
      hadCustomUrl: false,
    };
  },
  computed: {
    toNodeText() {
      const isNodeOptionExist = this.toNodeOptions.find(option => option.value === this.toNode);
      if (!isNodeOptionExist) { this.toNode = null; }
      return this.toNodeOptions.find(option => option.value === this.toNode).text;
    },
    jsCodeOptions() {
      return this.jsCodeAlias.map(item => ({ value: item, text: item }));
    },
    andOrIfText() {
      return this.selectedOption[0] === ConditionOption.AND ?
        this.$t('task_engine_v2.condition_action_block.and_if') : this.$t('task_engine_v2.condition_action_block.or_if');
    },
  },
  watch: {
    num() {
      this.showConditionsAndActions = this.showConditionsAndAction;
    },
    selectedOption() {
      this.emitUpdate();
    },
    actions: {
      handler() {
        this.emitUpdate();
      },
      deep: true,
    },
    rules: {
      handler() {
        this.emitUpdate();
      },
      deep: true,
    },
    toNode: {
      handler() {
        this.emitUpdate();
      },
      deep: true,
    },
    globalVarOptions: {
      handler() {
        this.$nextTick(() => {
          if (this.$refs.insertVarDropdown) {
            this.$refs.insertVarDropdown.forEach((dpd) => {
              dpd.dispatchEvent(event.createEvent('dropdown-reload'));
            });
          }
        });
      },
    },
  },
  methods: {
    togglebutton() {
      this.showConditionsAndActions = !this.showConditionsAndActions;
      const obj = {
        open: this.showConditionsAndActions ? 1 : 0,
        index: this.index,
      };
      this.$emit('changeFlag', obj);
    },
    onInputFocus(evt) {
      evt.target.dispatchEvent(event.createEvent('tooltip-hide'));
    },
    renderNormalEdge(edge) {
      // render andRules
      const rules = edge.condition_rules.map(rule => ({
        id: this.$uuid.v1(),
        source: rule.source,
        funcName: rule.function.function_name,
        content: rule.function.content,
      }));
      // render Actions
      const actions = edge.actions.map(action => ({
        id: this.$uuid.v1(),
        source: action.source,
        funcName: action.function.function_name,
        content: action.function.content,
        type: action.type,
        parser: action.parser,
        nluType: action.nluType,
        funcUrl: action.function.function_url,
      }));
      // render toNode
      const toNode = edge.to_node_id;
      return { rules, toNode, actions };
    },
    deleteEdge() {
      this.$emit('deleteEdge');
    },
    addRule(source = 'text') {
      this.edge.valid = false;
      const rule = scenarioInitializer.initialRule(source);
      this.rules.push({
        id: this.$uuid.v1(),
        source: rule.source,
        funcName: rule.functions[0].function_name,
        content: rule.functions[0].content,
      });
    },
    addAction(actionType = 'parser') {
      this.edge.valid = false;
      const action = scenarioInitializer.initialAction(actionType);
      this.actions.push({
        id: this.$uuid.v1(),
        source: action.source,
        funcName: action.function.function_name,
        content: action.function.content,
        type: actionType,
      });
    },
    deleteRule(index) {
      this.edge.valid = false;
      this.rules.splice(index, 1);
    },
    deleteAction(index) {
      this.edge.valid = false;
      this.actions.splice(index, 1);
    },
    onSelectSourceInput(index, newValue) {
      const newSource = newValue[0];
      const options = this.funcOptionMap[newSource];
      if (this.rules[index].source === newSource) return;
      this.rules[index].source = newSource;
      const selectFunctionRef = `selectFunction_${index}`;
      if (this.$refs[selectFunctionRef]) {
        this.$refs[selectFunctionRef][0].$emit('updateOptions', options);
        this.$refs[selectFunctionRef][0].$emit('select', options[0].value);
      }
      this.reloadTooltip();
    },
    onSelectFunctionInput(index, newValue) {
      const newFuncName = newValue[0];
      const originalEdgeType = this.edgeType;
      this.changeToNormalEdge(originalEdgeType, index, newFuncName);
      this.reloadTooltip();
    },
    customParserInput(action, { parser, source }) {
      action.parser = parser;
      action.source = source;
      action.funcName = action.type;
      action.content = scenarioInitializer.initialFunctionContentV2(action.type, this.nodeId);
      action.content.parserData =
        this.customParsers.filter(item => item.parserId === parser)[0];
      delete action.nluType;
      this.$forceUpdate();
    },
    parserInput(action, { parser, source }) {
      action.parser = parser;
      action.source = source;
      action.funcName = parser;
      if (parser === 'reg_parser') {
        if (source === 'text') {
          action.funcName = 'regular_exp';
        } else if (source === 'global_info') {
          action.funcName = 'regular_exp_from_var';
        }
      } else if (parser === 'user_custom_parser') {
        if (source === 'text') {
          action.funcName = 'user_custom_parser';
        } else if (source === 'global_info') {
          action.funcName = 'user_custom_transform';
        }
      }
      action.content = scenarioInitializer.initialFunctionContentV2(action.funcName, this.nodeId);
      delete action.nluType;
      this.$forceUpdate();
    },
    nluParserInput(action, { nluType, source }) {
      action.nluType = nluType;
      action.source = source;
      action.content = scenarioInitializer.initialFunctionContentV2(action.funcName, this.nodeId);
      switch (nluType) {
        case NLUTypeMap.ADDRESS: {
          action.content.tags = NLUParserMap.ADDRESS;
          break;
        }
        case NLUTypeMap.TIME: {
          action.content.tags = NLUParserMap.TIME_FUTURE;
          break;
        }
        case NLUTypeMap.MONEY: {
          action.content.tags = NLUParserMap.MONEY;
          break;
        }
        case NLUTypeMap.MOBILE_PHONE: {
          action.content.tags = NLUParserMap.MOBILE_PHONE;
          break;
        }
        case NLUTypeMap.PERSON_NAME: {
          action.content.tags = NLUParserMap.PERSON_NAME;
          break;
        }
        case NLUTypeMap.SELECT: {
          action.content.tags = NLUParserMap.SELECT_CUSTOMIZE_OPTIONS;
          this.$set(action.content, 'options', ['']);
          this.$set(action.content, 'fuzzy_match', true);
          action.content.has_context = true;
          break;
        }
        case NLUTypeMap.POLARITY: {
          action.content.tags = NLUParserMap.POLARITY;
          action.content.has_context = true;
          break;
        }
        default:
          break;
      }
      this.$forceUpdate();
    },
    setNluSelectOptionType(action, type) {
      const content = action.content;
      content.tags = type;
      delete content.options;
      delete content.option_key;
      if (type === NLUParserMap.SELECT_CUSTOMIZE_OPTIONS) {
        this.$set(content, 'options', ['']);
      }
      if (type === NLUParserMap.SELECT_OPTIONS_IN_KEY) {
        this.$set(content, 'option_key', '');
      }
    },
    renderOnlyParseSurname(tags) {
      if (tags === NLUParserMap.SURNAME) {
        return true;
      }
      return false;
    },
    onlyParseSurnameChange(action, onlyParseSurname) {
      action.content.tags = onlyParseSurname ? NLUParserMap.SURNAME : NLUParserMap.PERSON_NAME;
    },
    reloadTooltip() {
      if (this.$refs['input-content']) {
        this.$refs['input-content'].forEach((el) => {
          el.dispatchEvent(event.createEvent('tooltip-reload'));
        });
      }
    },
    changeToNormalEdge(originalEdgeType, index, newFuncName) {
      if (this.rules[index].funcName === newFuncName) return;
      this.rules[index].funcName = newFuncName;
      // initial content
      const content = scenarioInitializer.initialFunctionContentV2(newFuncName, this.nodeId);
      this.rules[index].content = content;

      // update parser options
      if (newFuncName === 'common_parser' ||
          newFuncName === 'task_parser' ||
          newFuncName === 'hotel_parser') {
        const options = this.entityModuleOptions(newFuncName);
        const selectRef = `selectTargetEntity_${index}`;
        if (this.$refs[selectRef] && this.$refs[selectRef].length > 0) {
          this.$refs[selectRef][0].$emit('updateOptions', options);
          content.tags.split(',').forEach((target) => {
            this.$refs[selectRef][0].$emit('select', target);
          });
        }
      }
    },
    onSelectTargetEntity(index, newValue) {
      this.rules[index].content.tags = newValue.join(',');
      // this.emitUpdate();
    },
    onSelectMapTableInput(index, newValue) {
      const newMapTable = newValue[0];
      if (this.rules[index].content.trans === newMapTable) return;
      this.rules[index].content.trans = newMapTable;
      // this.emitUpdate();
    },
    insertVarDropdown(id, obj, key) {
      const options = this.globalVarOptions.map(option => ({
        text: `${option.text}：${option.value}`,
        onclick: this.insertVarSelect.bind(this, obj, key, option.value),
      }));
      return {
        options,
        width: '542px',
      };
    },
    insertVarSelect(obj, key, value) {
      obj[key] = value;
      this.$forceUpdate();
      this.emitUpdate();
    },
    renderIntentDropdown(index) {
      let options = this.intentDropdown.options.map((option) => {
        const onclick = () => {
          this.rules[index].content = {
            module: 'intent_engine_2.0',
            intentName: option.name,
          };
        };
        return {
          ...option,
          onclick,
        };
      });
      // pre-pend a no intent option, trigger scenario when there is no intent matched
      const textNoIntent = this.$t('task_engine_v2.condition_block.option.no_intent');
      options = [
        {
          text: textNoIntent,
          onclick: () => {
            this.rules[index].content = {
              module: 'intent_engine_2.0',
              intentName: textNoIntent,
            };
          },
        },
        ...options,
      ];
      return {
        ...this.intentDropdown,
        options,
      };
    },
    emitUpdate() {
      const conditionBlock = {
        id: this.edge.id,
        edge_type: this.edgeType,
        to_node_id: this.toNode,
        logic: this.selectedOption[0],
        actions: this.actions.map(action => ({
          source: action.source,
          function: {
            function_name: action.funcName,
            content: action.content,
            function_url: action.funcUrl,
          },
          type: action.type,
          parser: action.parser,
          nluType: action.nluType,
        })),
        condition_rules: this.rules.map(rule => ({
          source: rule.source,
          function: {
            function_name: rule.funcName,
            content: rule.content,
          },
        })),
      };
      this.$nextTick(() => {
        conditionBlock.valid = this.isValid();
        this.$emit('update', conditionBlock);
      });
    },
    entityModuleOptions(parser) {
      const entityModuleOptions = optionConfig.getEntityModuleOptionsMap();
      return entityModuleOptions[parser];
    },
    getFuncOptions(source) {
      return this.funcOptionMap[source];
    },
    onSelectGoto(toNode) {
      if (toNode === 'add_new_dialogue_node') {
        const newNodeID = scenarioInitializer.guid_sort();
        this.$emit('addNewDialogueNode', newNodeID);
        this.toNode = newNodeID;
      } else {
        this.toNode = toNode;
      }
    },
    addConditionActionClick(e, flag) {
      // if (this[flag]) {
      //   e.target.dispatchEvent(new Event('dropdown-hide'));
      // }
      this[flag] = true;
    },
    addNLUSelectOption(action) {
      if (action.content.options) {
        action.content.options.push('');
      } else {
        this.$set(action.content, 'options', ['']);
      }
      this.$forceUpdate();
    },
    isValid() {
      return general.isInputContentsValid(this.$refs['input-content']);
    },
    showToolTip() {
      general.showInputContentTooltip(this.$refs['input-content']);
    },
    getTaskConfigInfo() {
      const that = this;
      taskEngineApi.taskConfig()
        .then((data) => {
          that.hadCustomUrl = data.task_engine_v2.enable_custom_url;
        });
    },
  },
  mounted() {
    this.$on('showToolTip', this.showToolTip);
    this.$api.getIntentsDetail().then((intents) => {
      this.intentDropdown.options = intents.map(intent => ({
        ...intent,
        text: intent.name,
      }));
    });
    this.appId = this.$cookie.get('appid');
    const that = this;
    nerFactoryDalApi.getNerParserList(this.appId).then((data) => {
      that.customParsers = data.data;
      that.customParserOptions = that.customParsers.map(parser => ({
        text: parser.name,
        value: parser.parserId,
      }));
    });
  },
};
</script>

<style lang="scss" scoped>
.condition-action-block {
  position: relative;
  background: #f7f7f7;
  border-radius: 2px;
  @include font-14px();
  cursor: move;
  padding-bottom: 10px;
  .dropdown-select {
    background-color: white;
  }
  .header {
    padding: 10px 20px;
    color: $color-font-mark;
    display: flex;
    align-items: center;
    box-shadow: inset 0 -1px 0 0 #dbdbdb;
    background-color: #eeeeee;
    button {
      border: none;
      outline: none;
      background-color: transparent;
      display: flex;
      align-items: center;
      @include font-14px();
      cursor: pointer;
      padding: 0;
    }
    .add {
      color: #3d80ff;
      &:not(:last-child) {
        margin-right: 20px;
      }
      .arrow {
        width: 12px;
        height: 12px;
        margin-left: 6px;
        transition: transform .5s ease-in-out;
        &.rotate180 {
          transform: rotate(180deg);
        }
      }
    }
    .info {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      .to-node {
        text-overflow: ellipsis;
        overflow: hidden;
        display: inline-block;
        max-width: 120px;
        white-space: nowrap;
      }
    }
    .delete {
      color: #f25c62;
      margin: 0 20px;
    }
    .toggle {
      transform: rotate(90deg);
      transition: transform .5s ease-in-out;
      &.collapse {
        transform: rotate(270deg);
      }
      img {
        width: 24px;
        height: 24px;
      }
    }
  }
  .normal-edge {
    padding: 0 20px;
    margin: 10px 0;
    .title {
      padding-top: 10px;
      color: $color-font-active;
    }
    .dropdown-select-container {
      color: $color-font-normal;
      margin: 10px 38px;
      display: flex;
      align-items: center;
      .dropdown-select {
        margin: 0 10px;
      }
    }
  }
  .block {
    border-radius: 1px;
    background-color: #eeeeee;
    color: $color-font-normal;
    position: relative;
    padding: 5px 0;
    margin: 10px 0;
    &:last-of-type {
      margin-bottom: 0;
    }
    .row {
      padding: 5px 42px 5px 0;
      display: flex;
      align-items: center;
      .label {
        text-align: right;
        width: 66px;
        margin-right: 10px;
        &:not(:first-of-type) {
          margin-left: 10px;
          width: auto;
        }
      }
      .dropdown-select {
        &:not(:first-of-type) {
          margin-left: 10px;
        }
        flex: 1;
        background-color: white;
      }
      .trash {
        align-self: flex-start;
        position: absolute;
        right: 10px;
        cursor: pointer;
      }
      .dropdown-container {
        flex: 1;
        .input-content {
          width: 100%;
        }
      }
    }
    .input-content {
      flex: 1;
    }
  }
  .add-new-row {
    color: $color-primary;
    border: none;
    background-color: transparent;
    padding: 0;
    @include font-14px();
    cursor: pointer;
  }
  .delete-button {
    width: 70px;
    height: 32px;
    background-color: $color-font-disabled;
    padding: 0;
    border: none;
    font-size: 12px;
    margin-left: 8px;
    color: white;
    cursor: pointer;
    &.red {
      background-color: $color-error;
    }
  }
}
</style>
