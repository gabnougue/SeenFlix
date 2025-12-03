<template>
  <div class="star-rating" :class="{ 'interactive': interactive }">
    <div class="stars">
      <span
        v-for="star in 5"
        :key="star"
        class="star"
        :class="getStarClass(star)"
        @click="interactive && handleClick(star)"
        @mouseenter="interactive && handleHover(star)"
        @mouseleave="interactive && handleHover(0)"
      >
        ★
      </span>
    </div>
    <span v-if="showValue" class="rating-value">
      {{ displayValue }}
    </span>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: Number,
    default: 0
  },
  interactive: {
    type: Boolean,
    default: false
  },
  showValue: {
    type: Boolean,
    default: false
  },
  max: {
    type: Number,
    default: 5
  }
})

const emit = defineEmits(['update:modelValue'])

const hoverValue = ref(0)

const displayValue = computed(() => {
  if (props.max === 10) {
    return `${props.modelValue.toFixed(1)}/10`
  }
  // Pour les notes sur 5 (notes utilisateur), afficher en entier
  return `${Math.round(props.modelValue)}/5`
})

const getStarClass = (star) => {
  const value = props.interactive && hoverValue.value > 0 ? hoverValue.value : props.modelValue

  // Convertir la note en échelle 0-5 si nécessaire
  const normalizedValue = props.max === 10 ? value / 2 : value

  if (normalizedValue >= star) {
    return 'filled'
  } else if (normalizedValue >= star - 0.5) {
    return 'half'
  }
  return 'empty'
}

const handleClick = (star) => {
  if (props.interactive) {
    emit('update:modelValue', star)
  }
}

const handleHover = (star) => {
  if (props.interactive) {
    hoverValue.value = star
  }
}
</script>

<style scoped>
.star-rating {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.stars {
  display: flex;
  gap: 2px;
}

.star {
  font-size: 1.2rem;
  transition: all var(--transition-fast);
  color: var(--color-text-lighter);
}

.star.filled {
  color: #ffd700;
  text-shadow: 0 0 3px rgba(255, 215, 0, 0.5);
}

.star.half {
  background: linear-gradient(90deg, #ffd700 50%, var(--color-text-lighter) 50%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.star.empty {
  color: var(--color-text-lighter);
}

.interactive .star {
  cursor: pointer;
}

.interactive .star:hover {
  transform: scale(1.2);
}

.rating-value {
  font-size: var(--font-size-sm);
  color: var(--color-text-light);
  font-weight: 500;
  margin-left: var(--spacing-xs);
}
</style>
