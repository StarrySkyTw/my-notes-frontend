# my-notes-frontend
使用框架Vue.js實作「智慧學習筆記」前端網站

# 如何開啟前端伺服器
請事先安裝好NPM指令，並執行以下步驟：
```bash
cd ${PATH_TO}/my-notes-frontend
npm install
npm run dev
```
將會看到Vue伺服器在本地端開啟的訊息，例如範例中的`http://localhost:5173`。
![Server log](/screenshots/server_log.png)

# 前端伺服器執行範例
- 在瀏覽器在訪問Vue伺服器在本地端開啟的port(`http://localhost:5173`)，就會看到智慧學習筆記網站已儲存在資料庫中的內容，並且可以新增、編輯或刪除筆記：
    - ![API example](/screenshots/app_example.png)
