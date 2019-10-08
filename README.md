# 檔案庫內容
> BFOP 的 UI 標準本

# 開發守則，若在 development 上是`必須遵守`                                             
1. `禁止使用其他的 chart library`，除非需要圖表功能 c3.js 無提供
2. `禁止直接使用任何額外的 UI Framework library`，以目前已經有的元件為主，若目前無元件則可以設計新的元件
3. `禁止關閉 eslint`，除了特殊情況下，所有的 coding style 必須符合 eslint 限制
4. `commit 訊息必須描寫完整`，說明改動了什麼，如果有的話需提及 JIRA Issue
5. `客製的 branch 必須開成 project-<project name>`的形式

# 開發環境設定
> 請使用以下指令設定 commit 的模板
```
git config commit.template ./.git-commit-template
```
## 使用 vs code 當作開發工具，請先將 code 指令安裝至 Path 中
在 vs-code 中使用 F1 或 ⌘+p 後，輸入 'Shell Command: Install 'code' command in PATH'
將 code 指令新增至可執行的目錄中

## 預設使用 vs code 來當作 commit 時的編輯工具
git config core.editor "code --wait"

## vs code 中建議安裝之模組
- [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
- [Vetur](https://marketplace.visualstudio.com/items?itemName=octref.vetur)

## vs code 中建議使用的設定 (⌘+,)
```json
"eslint.autoFixOnSave": true,
"eslint.validate": [
  {
    "language": "vue",
    "autoFix": true
  },
  {
    "language": "javascript",
    "autoFix": true
  }
],
```


# branch 規則
Branch 名稱 | 說明
---|---
master | 正式版發布，該分支上會使用 `tag` 設定版本號碼
development | 自 `master` 中發展，為**開發中版本**，開發過程會持續推進
project-`XXXX` | 自 `master` 中發展客製使用，必須只做**差異化開發**，隨時可 merge `master` 來達到更新目的。範例：project-minsheng
feature/`XXXX` | 自 `development` 中發展出，為**新功能**之開發，完成後 merge 回 `development` 中。範例：feature/intentV2
bug/`BFOP-XXX` | 自 `development` 中發展出，為**修正 bug** 時使用，完成後 merge 回 `development`，並移除。若各客製需要修正，則 cherry-pick 該 commit 即可。範例：bug/BFOP-123
release/`vX.X.X` | 自 `development` 中發展出，為**發布前準備**，此 branch 上只做該版本的 bug 修正，在修正後 merge 進 `master` 及 `development` 中。範例：release/v1.1.1
hotfix/`vX.X.X` | 自 `master` 中發展出，只做**重大問題**的修正，修正後 merge 進 master 及 `development` 中。範例：hotfix/v1.1.9

# 自動化建置
## 分支列表
- master
- development
- release/vX.X.X
- hotfix/vX.X.X
- project-minsheng

## 建置方式
1. 在 gitlab 接收到 push 後，觸發 jenkins 自動建置
2. 可在 [Jenkins](http://jenkins.emotibot.com:8080/job/FrontendTaipei/) 中看到 commit 資訊
3. 建置完成後結果將寫在 gitlab 的 commit 下方，範例: [Commit Link](https://gitlab.emotibot.com/deployment/general-ui/commit/3fb1cf7fb32153a20ac8d812692aa926e2b28090)
4. 也可在 [gitlab pipeline](https://gitlab.emotibot.com/deployment/general-ui/pipelines) 中看到

# 常用指令
``` bash
# 安裝需要的 js library 到 node_modules 中
npm install

# 在本地跑起測試用 UI server 在 localhost:8080
npm run dev

# 建置目前的 UI，完成後放置在 dist 資料夾中
npm run build

# 建置目前的 UI，並產生出 js 模組的報告
npm run build --report

# 執行單元測試
npm run unit

# 執行 end-to-end 測試
npm run e2e

# 執行所有的測試
npm test

# 在本地跑起 storybook 來當作元件開發文件
npm run storybook
```
