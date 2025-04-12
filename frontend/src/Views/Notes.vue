<template>
  <div class="notes-container">
    <div class="notes-header">
      <h2>My Notes</h2>
      <p>Keep track of your important notes and reminders</p>
    </div>

    <!-- Note Form -->
    <el-card class="note-form-card">
      <template #header>
        <div class="card-header">
          <h3>{{ isEditing ? 'Edit Note' : 'Add New Note' }}</h3>
          <el-button v-if="isEditing" type="text" @click="resetForm">
            <i class="bi bi-plus-circle"></i> Add New
          </el-button>
        </div>
      </template>
      
      <el-form 
        ref="noteFormRef"
        :model="noteForm"
        :rules="formRules"
        label-position="top"
        @submit.prevent="handleSubmit"
      >
        <el-form-item label="Title" prop="title">
          <el-input
            v-model="noteForm.title"
            placeholder="Enter title"
          />
        </el-form-item>

        <el-form-item label="Content" prop="content">
          <el-input
            v-model="noteForm.content"
            type="textarea"
            :rows="4"
            placeholder="Enter note content"
          />
        </el-form-item>

        <el-form-item label="Color">
          <el-color-picker v-model="noteForm.color" />
        </el-form-item>

        <el-form-item label="Tags">
          <el-tag
            v-for="tag in noteForm.tags"
            :key="tag"
            closable
            @close="removeTag(tag)"
            class="tag-item"
          >
            {{ tag }}
          </el-tag>
          <el-input
            v-if="inputVisible"
            ref="tagInputRef"
            v-model="inputValue"
            class="tag-input"
            size="small"
            @keyup.enter="handleInputConfirm"
            @blur="handleInputConfirm"
          />
          <el-button v-else class="button-new-tag" size="small" @click="showInput">
            + New Tag
          </el-button>
        </el-form-item>

        <el-form-item>
          <el-button 
            type="primary" 
            native-type="submit" 
            :loading="isSubmitting"
          >
            {{ isEditing ? 'Update Note' : 'Add Note' }}
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- Search and Filter -->
    <div class="search-filter-container">
      <el-input
        v-model="searchQuery"
        placeholder="Search notes"
        prefix-icon="el-icon-search"
      />
    </div>

    <!-- Notes Display -->
    <div class="notes-display">
      <el-empty v-if="filteredNotes.length === 0" description="No notes found" />
      
      <!-- Pinned Notes Section -->
      <template v-if="pinnedNotes.length > 0">
        <h3 class="section-title">
          <i class="bi bi-pin-angle"></i> Pinned Notes
        </h3>
        <div class="notes-grid">
          <el-card 
            v-for="note in pinnedNotes" 
            :key="note._id"
            class="note-card"
            :style="{ 'border-top': `3px solid ${note.color}` }"
          >
            <template #header>
              <div class="note-header">
                <h4>{{ note.title }}</h4>
                <div class="note-actions">
                  <el-button size="small" circle type="text" @click="togglePin(note)">
  <i class="bi bi-pin-angle"></i>
</el-button>
                  <el-button
                    size="small"
                    circle
                    @click="editNote(note)"
                    type="text"
                  >
                  <i class="bi bi-pencil"></i>
                  </el-button>


                  <el-button
                    size="small"
                     
                    circle
                    @click="deleteNote(note)"
                    type="text"
                  >
                  <i class="bi bi-trash"></i>
                </el-button>
                </div>
              </div>
            </template>
            <div class="note-content">
              <p>{{ note.content }}</p>
              <div class="note-tags">
                <el-tag
                  v-for="tag in note.tags"
                  :key="tag"
                  size="small"
                  class="note-tag"
                >
                  {{ tag }}
                </el-tag>
              </div>
              <div class="note-date">
                {{ formatDate(note.updatedAt) }}
              </div>
            </div>
          </el-card>
        </div>
      </template>

      <!-- Other Notes Section -->
      <template v-if="unpinnedNotes.length > 0">
        <h3 class="section-title" v-if="pinnedNotes.length > 0">
          <i class="bi bi-journal-text"></i> Other Notes
        </h3>
        <div class="notes-grid">
          <el-card 
            v-for="note in unpinnedNotes" 
            :key="note._id"
            class="note-card"
            :style="{ 'border-top': `3px solid ${note.color}` }"
          >
            <template #header>
              <div class="note-header">
                <h4>{{ note.title }}</h4>
                <div class="note-actions">
                  <el-button
                    size="small"
                    circle
                    @click="togglePin(note)"
                    type="text"
                  >
                  <i class="bi bi-pin-angle"></i>
                </el-button>
                
                  <el-button
                    size="small"
                    
                    circle
                    @click="editNote(note)"
                    type="text"
                  >
                  <i class="bi bi-pencil"></i>
                </el-button>
                  <el-button
                    size="small"
                    circle
                    @click="deleteNote(note)"
                    type="text"
                  >
                  <i class="bi bi-trash"></i>
                </el-button>
                </div>
              </div>
            </template>
            <div class="note-content">
              <p>{{ note.content }}</p>
              <div class="note-tags">
                <el-tag
                  v-for="tag in note.tags"
                  :key="tag"
                  size="small"
                  class="note-tag"
                >
                  {{ tag }}
                </el-tag>
              </div>
              <div class="note-date">
                {{ formatDate(note.updatedAt) }}
              </div>
            </div>
          </el-card>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue';
import { ElMessage, ElMessageBox, FormInstance } from 'element-plus';
import { useRouter } from 'vue-router';
import axios from 'axios';
import type { Note } from '../type/types';

// Constants
const API_URL = import.meta.env.VITE_API_URL;

// Router
const router = useRouter();

// Form
const noteFormRef = ref<FormInstance>();
const noteForm = ref({
  _id: null as string | null,
  title: '',
  content: '',
  color: '#ffffff',
  tags: [] as string[],
  isPinned: false
});

const formRules = {
  title: [
    { required: true, message: 'Title is required', trigger: 'blur' },
    { min: 3, max: 100, message: 'Title should be 3 to 100 characters', trigger: 'blur' }
  ],
  content: [
    { required: true, message: 'Content is required', trigger: 'blur' }
  ]
};

// Tags Input
const inputVisible = ref(false);
const inputValue = ref('');
const tagInputRef = ref();

// State
const notes = ref<Note[]>([]);
const isLoading = ref(false);
const isSubmitting = ref(false);
const isEditing = ref(false);
const searchQuery = ref('');

// Computed
const filteredNotes = computed(() => {
  if (!searchQuery.value) return notes.value;
  
  const query = searchQuery.value.toLowerCase();
  return notes.value.filter(note => 
    note.title.toLowerCase().includes(query) ||
    note.content.toLowerCase().includes(query) ||
    note.tags.some(tag => tag.toLowerCase().includes(query))
  );
});

const pinnedNotes = computed(() => {
  return filteredNotes.value.filter(note => note.isPinned);
});

const unpinnedNotes = computed(() => {
  return filteredNotes.value.filter(note => !note.isPinned);
});

// Methods
const fetchNotes = async () => {
  try {
    isLoading.value = true;
    const response = await axios.get(`${API_URL}/notes`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    notes.value = response.data;
  } catch (error: any) {
    if (error.response?.status === 401) {
      ElMessage.error('Please signup to manage notes');
      router.push('/signup');
    } else {
      ElMessage.error('Failed to fetch notes');
      console.error('Error fetching notes:', error);
    }
  } finally {
    isLoading.value = false;
  }
};

const handleSubmit = async () => {
  if (!noteFormRef.value) return;
  
  await noteFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        isSubmitting.value = true;
        const data = { ...noteForm.value };

        if (isEditing.value && noteForm.value._id) {
          await axios.put(
            `${API_URL}/notes/${noteForm.value._id}`,
            data,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
              }
            }
          );
          ElMessage.success('Note updated successfully');
        } else {
          await axios.post(
            `${API_URL}/notes`,
            data,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
              }
            }
          );
          ElMessage.success('Note added successfully');
        }
        
        resetForm();
        fetchNotes();
      } catch (error: any) {
        ElMessage.error(error.response?.data?.message || 'Failed to save note');
      } finally {
        isSubmitting.value = false;
      }
    }
  });
};

const editNote = (note: Note) => {
  isEditing.value = true;
  noteForm.value = {
    _id: note._id,
    title: note.title,
    content: note.content,
    color: note.color,
    tags: [...note.tags],
    isPinned: note.isPinned
  };
};

const deleteNote = async (note: Note) => {
  try {
    await ElMessageBox.confirm(
      'Are you sure you want to delete this note?',
      'Warning',
      {
        confirmButtonText: 'Yes',
        cancelButtonText: 'No',
        type: 'warning'
      }
    );

    await axios.delete(`${API_URL}/notes/${note._id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    ElMessage.success('Note deleted successfully');
    fetchNotes();
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('Failed to delete note');
    }
  }
};

const togglePin = async (note: Note) => {
  try {
    await axios.patch(
      `${API_URL}/notes/${note._id}/toggle-pin`,
      {},
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      }
    );
    
    ElMessage.success(`Note ${note.isPinned ? 'unpinned' : 'pinned'} successfully`);
    fetchNotes();
  } catch (error) {
    ElMessage.error('Failed to toggle pin status');
    console.error('Error toggling pin status:', error);
  }
};

const resetForm = () => {
  if (noteFormRef.value) {
    noteFormRef.value.resetFields();
  }
  noteForm.value = {
    _id: null,
    title: '',
    content: '',
    color: '#ffffff',
    tags: [],
    isPinned: false
  };
  isEditing.value = false;
};

// Tag related methods
const showInput = () => {
  inputVisible.value = true;
  nextTick(() => {
    tagInputRef.value.input.focus();
  });
};

const handleInputConfirm = () => {
  if (inputValue.value && !noteForm.value.tags.includes(inputValue.value)) {
    noteForm.value.tags.push(inputValue.value);
  }
  inputVisible.value = false;
  inputValue.value = '';
};

const removeTag = (tag: string) => {
  noteForm.value.tags = noteForm.value.tags.filter(t => t !== tag);
};

// Utility functions
const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};

// Initialize
onMounted(() => {
  fetchNotes();
});
</script>

<style scoped>
.notes-container {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.notes-header {
  text-align: center;
  margin-bottom: 32px;
}

.notes-header h2 {
  background: linear-gradient(135deg, #00c4cc, #7209b7);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  font-size: 2rem;
  margin-bottom: 8px;
}

.notes-header p {
  color: #666;
}

.note-form-card {
  margin-bottom: 24px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-filter-container {
  margin-bottom: 24px;
}

.section-title {
  margin-top: 24px;
  margin-bottom: 16px;
  font-size: 1.25rem;
  color: #333;
  border-bottom: 1px solid #eee;
  padding-bottom: 8px;
}

.notes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
}

.note-card {
  transition: all 0.3s ease;
}

.note-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 20px rgba(0, 0, 0, 0.1);
}

.note-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.note-header h4 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
}

.note-content {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.note-content p {
  margin-top: 0;
  flex-grow: 1;
  white-space: pre-wrap;
}

.note-tags {
  margin-top: 8px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.note-tag {
  margin-right: 8px;
  margin-bottom: 8px;
}

.note-date {
  margin-top: 16px;
  font-size: 0.8rem;
  color: #999;
  text-align: right;
}

.tag-item {
  margin-right: 8px;
  margin-bottom: 8px;
}

.tag-input {
  width: 100px;
  margin-right: 8px;
  vertical-align: bottom;
}

.button-new-tag {
  margin: 8px 0;
}
</style> 