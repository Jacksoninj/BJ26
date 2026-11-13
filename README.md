# 北京 2026 行程

2026 年 12 月 20–26 日、兩人七日六夜北京旅行。以使用者提供的上一版 HTML 日期及航班備註為基礎。

- 七日早午晚時間線，停留時間、地鐵線號、步行及接駁備註。
- 35 個可搜尋景點；拖曳到任何日期／時段，跨日移動、排序、復原。
- 「附近優先」按當日最後一站，空白日按住宿區中心排序；顯示直線距離，並非交通導航。
- 故宮等預約提醒、互動地圖、高德導航、照片來源及機位。
- 只選住宿地區；HK$300–2,500／房／晚預算滑桿，可選擇附上整份 DIY 行程。
- 訪客毋須登入；問卷在按下提交且伺服器確認後儲存，錯誤時保留表格並允許重試。
- 朱紅暖金單一配色、系統深色模式、鍵盤操作、減少動態及文字放大。

## 部署

前端：https://jacksoninj.github.io/BJ26/

前端無建置步驟，GitHub Pages 由 `main` 根目錄提供。可用 `python3 -m http.server` 預覽。

後端採兩個分開的 Sites：

1. 公開的 submission gateway 只允許 `/api/submit` 的 POST／OPTIONS。它不能查詢回答。來源位於 `submission-gateway/worker.js`。
2. owner-private 回答服務使用 D1 持久儲存；`/api/responses` 和 `/admin` 均額外在伺服器核對擁有人身分。來源及 migration 位於 `backend/`。

管理後台：https://bj26-travel-responses.lghplot.chatgpt.site/admin

公開入口：https://bj26-public-submit.lghplot.chatgpt.site

私人後台需要擁有人帳戶登入，訪客頁面及填寫問卷不用登入。網站沒有把回答存進公開 GitHub、Issues 或瀏覽器作為雲端儲存。瀏覽器儲存只用於本機草稿及行程。

## 環境設定（不含秘密值）

- 私人服務：D1 binding `DB`、secret `OWNER_EMAIL`。
- 公開入口：secret `PRIVATE_SERVICE_TOKEN`，只能在伺服器使用。此 token 不在 GitHub 或前端。
- 私人服務 schema：依次執行 `0000_responses.sql` 及 `0001_preferences.sql`。

重新部署 Sites 時使用對應原有 project，保留私人回答服務的 owner-only 存取設定。來源副本不包含 Site 憑證、使用者回答或私人帳戶資料。

## 驗證

`node --test tests/*.test.js` 檢查計劃資料、跨日移動、重複景點、休館警告、地理排序及提交內容。

航班 CA102／CA109 是舊版提供的未核實資料，以機票為準。住宿價格帶是規劃估算；Trip.com 頁面參考價不是本次六晚的確認報價。
