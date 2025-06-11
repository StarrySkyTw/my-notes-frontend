<script setup>
import { ref, onMounted, computed, nextTick } from 'vue';
import axios from 'axios';
import { marked } from 'marked'; // 匯入 marked 套件

// --- 常數與響應式狀態定義 ---
const API_URL = 'http://127.0.0.1:8080/api';

// 使用 ref() 建立響應式狀態，類似 React 的 useState
const notes = ref([]); // 儲存筆記列表
const newNoteSubject = ref(''); // 綁定科目輸入框
const newNoteContent = ref(''); // 綁定內容輸入框
const error = ref(''); // 儲存錯誤訊息
const isLoading = ref(true); // 新增讀取狀態

// 用於編輯功能的狀態
const editingNoteId = ref(null); // 正在編輯的筆記 ID
const editingSubject = ref(''); // 正在編輯的筆記標題
const editingContent = ref(''); // 正在編輯的筆記內容

// --- Markdown 渲染 ---
const renderMarkdown = (markdownText) => {
  if (!markdownText) return '';
  // 設定 marked，讓它能處理換行等
  return marked.parse(markdownText, { breaks: true, gfm: true });
};

// --- 邏輯函式 (CRUD) ---

// [Read] 獲取所有筆記
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

// [Create] 新增筆記
const createNote = async () => {
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

// [Delete] 刪除筆記
const deleteNote = async (noteId) => {
    // 簡單的確認對話框，避免誤刪
  if (!window.confirm('確定要刪除這則筆記嗎？')) {
    return;
  }
  try {
    await axios.delete(`${API_URL}/notes/${noteId}`);
    await fetchNotes(); // 刪除後重新整理列表
  } catch (err) {
    error.value = `刪除筆記 ${noteId} 失敗`;
  }
};

// --- 編輯相關函式 ---

// 開始編輯
const startEditing = (note) => {
  editingNoteId.value = note.id;
  editingSubject.value = note.subject;
  editingContent.value = note.content;
};

// 取消編輯
const cancelEditing = () => {
  editingNoteId.value = null;
  editingSubject.value = '';
  editingContent.value = '';
};

// [Update] 更新筆記
const updateNote = async () => {
  if (!editingSubject.value.trim() || !editingContent.value.trim()) {
    alert('科目和內容都不能為空！');
    return;
  }
  try {
    await axios.put(`${API_URL}/notes/${editingNoteId.value}`, {
      subject: editingSubject.value,
      content: editingContent.value,
    });
    cancelEditing(); // 結束編輯模式
    await fetchNotes(); // 更新後重新整理列表
  } catch (err) {
    error.value = `更新筆記失敗`;
  }
};

// --- 生命週期鉤子 ---
// onMounted() 會在元件首次渲染到畫面上之後執行，類似 React 的 useEffect([])
onMounted(() => {
  fetchNotes();
});
</script>

<template>
  <div class="bg-slate-100 min-h-screen font-sans text-slate-800 p-4">
    <div class="max-w-3xl w-full mx-auto">
      
      <header class="text-center my-8">
        <h1 class="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-500 pb-2">
          智慧學習筆記
        </h1>
        <p class="text-lg text-slate-500 mt-2">支援 Markdown 的全端筆記應用</p>
      </header>
      
      <!-- 新增筆記表單 -->
      <div class="bg-white p-6 md:p-8 rounded-2xl shadow-lg mb-10">
        <h2 class="text-2xl font-bold text-slate-700 mb-6">新增一筆學習紀錄</h2>
        <form @submit.prevent="createNote">
            <input v-model="newNoteSubject" placeholder="筆記標題，例如：Vue 學習" class="w-full px-4 py-3 mb-4 border border-slate-300 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"/>
            <textarea v-model="newNoteContent" placeholder="內容支援 Markdown 語法...&#10;# 標題&#10;* 項目符號" rows="5" class="w-full px-4 py-3 border border-slate-300 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"></textarea>
            <button type="submit" class="w-full mt-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold py-3 px-4 rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5">新增筆記</button>
        </form>
      </div>
      
      <!-- 訊息中心 -->
      <div v-if="error" class="text-center my-4 p-3 bg-red-100 text-red-700 rounded-lg">{{ error }}</div>
      <div v-if="isLoading" class="text-center my-4 text-slate-500">讀取中...</div>

      <!-- 筆記列表 -->
      <div class="space-y-6">
        <div v-for="note in notes" :key="note.id" class="bg-white rounded-2xl shadow-lg transition-shadow duration-300 hover:shadow-xl">
            <!-- 編輯模式 -->
            <div v-if="editingNoteId === note.id" class="p-6">
                 <input v-model="editingSubject" class="text-2xl font-bold text-slate-800 w-full mb-4 p-2 border-b-2 border-indigo-400 focus:outline-none"/>
                 <textarea v-model="editingContent" rows="8" class="w-full p-3 border border-slate-300 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"></textarea>
                 <div class="flex justify-end space-x-3 mt-4">
                     <button @click="cancelEditing" class="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors">取消</button>
                     <button @click="updateNote" class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">儲存變更</button>
                 </div>
            </div>
          
            <!-- 顯示模式 -->
            <div v-else class="p-6">
              <div class="flex justify-between items-start">
                  <h3 class="text-2xl font-bold text-slate-800 mb-3">{{ note.subject }}</h3>
                  <div class="flex space-x-2 flex-shrink-0">
                      <button @click="startEditing(note)" class="p-2 text-slate-400 hover:text-indigo-600 rounded-full transition-colors"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg></button>
                      <button @click="deleteNote(note.id)" class="p-2 text-slate-400 hover:text-red-600 rounded-full transition-colors"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg></button>
                  </div>
              </div>
              <!-- Markdown 渲染區域 -->
              <!-- 現在 `.prose` class 會由 @tailwindcss/typography 外掛自動提供完整的樣式 -->
              <div class="prose max-w-none" v-html="renderMarkdown(note.content)"></div>
            </div>
        </div>
      </div>

    </div>
  </div>
</template>

<!-- [修正] 移除了手動、不完整的 .prose 樣式，因為現在由外掛全權處理 -->
<style>
/* 如果有需要，可以在這裡保留一些不屬於 prose 的全局樣式 */
html {
  scroll-behavior: smooth;
}
</style>