<template>
  <div class="favorite-editor">
    <div class="editor-section">
      <label class="editor-label">Ma note</label>
      <StarRating
        v-model="localRating"
        :interactive="true"
        :showValue="true"
        @update:modelValue="handleRatingChange"
      />
    </div>

    <div class="editor-section">
      <label class="editor-label" for="comment">Mon commentaire</label>
      <textarea
        id="comment"
        v-model="localComment"
        class="comment-input"
        placeholder="Partagez vos impressions sur ce film..."
        rows="3"
        maxlength="500"
        @blur="handleCommentBlur"
      ></textarea>
      <div class="comment-info">
        <span class="char-count">{{ commentLength }}/500</span>
        <button
          v-if="hasChanges"
          @click="saveChanges"
          class="btn-save"
          :disabled="saving"
        >
          {{ saving ? 'Enregistrement...' : 'Enregistrer' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import StarRating from './StarRating.vue'

const props = defineProps({
  favoriteId: {
    type: Number,
    required: true
  },
  initialRating: {
    type: Number,
    default: 0
  },
  initialComment: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update'])

const localRating = ref(props.initialRating || 0)
const localComment = ref(props.initialComment || '')
const saving = ref(false)
const hasChanges = ref(false)

const commentLength = computed(() => localComment.value?.length || 0)

// Détecter les changements
watch([localRating, localComment], () => {
  hasChanges.value =
    localRating.value !== props.initialRating ||
    localComment.value !== props.initialComment
})

const handleRatingChange = () => {
  // Auto-save sur changement de note
  if (localRating.value !== props.initialRating) {
    saveChanges()
  }
}

const handleCommentBlur = () => {
  // Auto-save quand on quitte le champ commentaire s'il y a des changements
  if (hasChanges.value) {
    saveChanges()
  }
}

const saveChanges = async () => {
  if (saving.value) return

  saving.value = true

  try {
    const data = {}
    if (localRating.value !== props.initialRating) {
      data.rating = localRating.value
    }
    if (localComment.value !== props.initialComment) {
      data.comment = localComment.value || null
    }

    emit('update', { favoriteId: props.favoriteId, data })
    hasChanges.value = false
  } catch (err) {
    console.error('Erreur lors de la sauvegarde', err)
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.favorite-editor {
  background: var(--color-primary-lighter);
  border-radius: var(--radius-md);
  padding: var(--spacing-md);
  margin-top: var(--spacing-md);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.editor-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.editor-label {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--color-primary);
}

.comment-input {
  width: 100%;
  padding: var(--spacing-sm) var(--spacing-md);
  border: 2px solid var(--color-primary-light);
  border-radius: var(--radius-md);
  font-family: var(--font-family);
  font-size: var(--font-size-sm);
  color: var(--color-text);
  resize: vertical;
  transition: all var(--transition-fast);
}

.comment-input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(136, 77, 167, 0.1);
}

.comment-input::placeholder {
  color: var(--color-text-lighter);
}

.comment-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.char-count {
  font-size: var(--font-size-xs);
  color: var(--color-text-light);
}

.btn-save {
  background: var(--color-primary);
  color: var(--color-white);
  padding: var(--spacing-xs) var(--spacing-md);
  font-size: var(--font-size-sm);
  border-radius: var(--radius-sm);
  font-weight: 600;
  transition: all var(--transition-fast);
}

.btn-save:hover:not(:disabled) {
  background: var(--color-primary-dark);
  transform: translateY(-1px);
}

.btn-save:disabled {
  opacity: 0.6;
}
</style>
