<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios'; // 我們使用 axios 來發送 HTTP 請求，它比原生的 fetch 更方便

// --- 常數與響應式狀態定義 ---
const API_URL = 'http://127.0.0.1:8080/api';

// 使用 ref() 建立響應式狀態，類似 React 的 useState
const notes = ref([]); // 儲存筆記列表
const newNoteSubject = ref(''); // 綁定科目輸入框
const newNoteContent = ref(''); // 綁定內容輸入框
const error = ref(''); // 儲存錯誤訊息
const isLoading = ref(true); // 新增讀取狀態

// --- 邏輯函式 ---

// 1. 獲取所有筆記
const fetchNotes = async () => {
  isLoading.value = true;
  error.value = '';
  try {
    // 使用 axios.get 發送 GET 請求
    const response = await axios.get(`${API_URL}/notes`);
    notes.value = response.data; // 將回傳的資料賦值給 notes ref (要用 .value)
  } catch (err) {
    error.value = '無法獲取筆記資料，請確認後端伺服器是否已啟動。';
    console.error(err);
  } finally {
    isLoading.value = false;
  }
};

// 2. 處理表單提交
const handleSubmit = async () => {
  if (!newNoteSubject.value.trim() || !newNoteContent.value.trim()) {
    alert('科目和內容都不能為空！');
    return;
  }

  try {
    // 使用 axios.post 發送 POST 請求
    await axios.post(`${API_URL}/notes`, {
      subject: newNoteSubject.value,
      content: newNoteContent.value,
    });

    // 新增成功後，清空輸入框
    newNoteSubject.value = '';
    newNoteContent.value = '';
    
    // 重新獲取一次列表來更新畫面
    await fetchNotes(); 
  } catch (err) {
    error.value = '新增筆記失敗';
    console.error(err);
  }
};

// --- 生命週期鉤子 ---
// onMounted() 會在元件首次渲染到畫面上之後執行，類似 React 的 useEffect([])
onMounted(() => {
  fetchNotes();
});
</script>

<template>
  <div class="bg-slate-100 min-h-screen font-sans text-slate-800 flex items-center justify-center p-4">
    <div class="max-w-2xl w-full mx-auto">
      
      <!-- 標題區 -->
      <header class="text-center mb-10">
        <h1 class="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-teal-400 pb-2">
          智慧學習筆記
        </h1>
        <p class="text-lg text-slate-500 mt-2">一個幫助你規劃學習的簡單工具</p>
      </header>

      <!-- 新增筆記表單卡片 -->
      <div class="bg-white p-6 md:p-8 rounded-2xl shadow-lg mb-10">
        <h2 class="text-2xl font-bold text-slate-700 mb-6">新增一筆學習紀錄</h2>
        <form @submit.prevent="handleSubmit">
          <div class="mb-5">
            <label for="subject" class="block text-slate-600 mb-2 font-semibold">科目</label>
            <input
              type="text"
              id="subject"
              v-model="newNoteSubject"
              placeholder="例如：微積分"
              class="w-full px-4 py-3 border border-slate-300 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow duration-300"
            />
          </div>
          <div class="mb-6">
            <label for="content" class="block text-slate-600 mb-2 font-semibold">學習內容 / 待辦事項</label>
            <textarea
              id="content"
              v-model="newNoteContent"
              placeholder="例如：完成 P.35 練習題"
              rows="4"
              class="w-full px-4 py-3 border border-slate-300 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow duration-300"
            />
          </div>
          <button
            type="submit"
            class="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
          >
            新增筆記
          </button>
        </form>
      </div>

      <!-- 錯誤或讀取訊息顯示 -->
      <div v-if="error" class="text-center my-4 p-4 bg-red-100 text-red-700 rounded-lg">{{ error }}</div>
      <div v-if="isLoading" class="text-center my-4 text-slate-500">讀取中...</div>

      <!-- 筆記列表 -->
      <div v-if="!isLoading && notes.length > 0">
        <h2 class="text-2xl font-bold text-slate-700 mb-6 text-center">我的筆記清單</h2>
        <div class="space-y-4">
          <div v-for="note in notes" :key="note.id" 
               class="bg-white p-5 rounded-xl shadow-md border-l-4 border-blue-400 flex items-start space-x-4 transition-transform duration-300 hover:scale-105 hover:shadow-xl">
            <div class="flex-shrink-0 bg-blue-100 text-blue-600 font-bold rounded-full h-10 w-10 flex items-center justify-center text-lg">
              {{ note.id }}
            </div>
            <div class="flex-grow">
              <h3 class="font-bold text-xl text-slate-800 mb-1">{{ note.subject }}</h3>
              <p class="text-slate-600 text-base">{{ note.content }}</p>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 空白狀態 -->
      <div v-if="!isLoading && notes.length === 0 && !error" class="text-center bg-white p-8 rounded-xl shadow-lg">
          <p class="text-slate-500 text-lg">目前沒有任何筆記，快新增一筆吧！</p>
      </div>

    </div>
  </div>
</template>

<style>
/* 可以在這裡添加全局樣式或使用 <style scoped> 添加元件範圍的樣式 */
/* 例如，讓整個頁面滾動更平滑 */
html {
  scroll-behavior: smooth;
}
</style>