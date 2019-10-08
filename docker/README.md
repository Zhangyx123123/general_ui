# Docker-Build Layout

改採用統一的Docker multi build階段方式，Runtime 採用指定的 CentOS。
結構上從 anonymous layer 改為多個image，並且一個資料夾代表著一個 image 的建置流程。以下為現有的Image檔案

``` plaintext
.
├── base    //node 的開發環境
├── build   //build 為 general-ui 的 compiled 完畢的產物
├── runtime //runtime copy 多個build image 產物並在runtime os 執行 nginx
└── slim    //只包含前端與 nginx Server
```

## How to Build

目前規定統一用 docker-compose 來執行 build 命令，因此每一個資料夾內應該都要有以下檔案:

1. docker-compose.yaml (定義build)
1. 相對應的Dockerfile (如果只有一個版本，那名字建議用預設名，不需額外指定)
1. build.env (build需要的變數定義)
1. test.yaml (驗證Unit-Test)

有了這些檔案，在最外層定義的 build.sh 就可以根據資訊來執行 build 流程

## How to Run

最外層定義docker-compose.yaml services來維持一個可以 Run 的版本?