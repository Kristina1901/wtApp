<template>
  <div v-if="props.modelValue" class="modal-overlay" @click="closeModal">
    <div class="modal" @click.stop>
      <p>{{ props.message }}</p>
      <div class="modal-buttons">
        <button v-if="props.showConfirmButton" @click="confirm" class="button">
          OK
        </button>
        <button v-if="props.showCancelButton" @click="cancel" class="button">
          {{ $t("cancel") }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  modelValue: boolean;
  message: string;
  showConfirmButton?: boolean;
  showCancelButton?: boolean;
}>();

const emit = defineEmits<{
  (event: "update:modelValue", value: boolean): void;
  (event: "confirm"): void;
  (event: "cancel"): void;
}>();
const closeModal = () => {
  emit("update:modelValue", false);
};
const confirm = () => {
  emit("confirm");
  closeModal();
};
const cancel = () => {
  emit("cancel");
  closeModal();
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  top: 0;
  right: 0;
  left: 0;
  bottom: 0;
}
.modal {
  background: white;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
  color: #797979;
}
.modal-buttons {
  margin-top: 20px;
}
.modal-buttons button {
  margin: 0 10px;
}
.button {
  cursor: pointer;
  border-radius: 5px;
  background: #3457d5;
  color: white;
  border: 1px solid #00008b;
  padding: 5px;
}
</style>
