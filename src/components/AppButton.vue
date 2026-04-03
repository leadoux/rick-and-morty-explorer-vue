<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, type RouteLocationRaw } from 'vue-router'

const props = withDefaults(
  defineProps<{
    to?: RouteLocationRaw
    variant?: 'primary' | 'secondary'
    type?: 'button' | 'submit' | 'reset'
    disabled?: boolean
  }>(),
  {
    variant: 'primary',
    type: 'button',
    disabled: false,
  },
)

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const classes = computed(() => ({
  button: true,
  secondary: props.variant === 'secondary',
}))

const onButtonClick = (event: MouseEvent) => {
  emit('click', event)
}

const onLinkClick = (event: MouseEvent) => {
  if (props.disabled) {
    event.preventDefault()
    event.stopPropagation()
    return
  }
  emit('click', event)
}
</script>

<template>
  <RouterLink
    v-if="props.to"
    :to="props.to"
    :class="classes"
    :aria-disabled="props.disabled ? 'true' : undefined"
    @click="onLinkClick"
  >
    <slot />
  </RouterLink>
  <button v-else :type="props.type" :class="classes" :disabled="props.disabled" @click="onButtonClick">
    <slot />
  </button>
</template>
