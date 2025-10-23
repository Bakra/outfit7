<template>
  <div class="event-form">
    <div class="page-header">
      <h2>{{ isEdit ? "Edit Event" : "Create New Event" }}</h2>
      <el-button @click="$router.go(-1)">
        <el-icon><ArrowLeft /></el-icon>
        Back
      </el-button>
    </div>

    <!-- Error State -->
    <el-alert
      v-if="error"
      :title="error"
      type="error"
      :closable="false"
      style="margin-bottom: 20px"
    />

    <!-- Form -->
    <el-card
      v-if="!loading || !isEdit"
      class="form-card"
      v-loading="loading && isEdit"
      element-loading-text="Loading event..."
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="120px"
        @submit.prevent="submitForm"
      >
        <el-form-item label="Name" prop="name">
          <el-input
            v-model="form.name"
            placeholder="Enter event name"
            :disabled="submitting"
          />
        </el-form-item>

        <el-form-item label="Description" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="4"
            placeholder="Enter event description"
            :disabled="submitting"
          />
        </el-form-item>

        <el-form-item label="Type" prop="type">
          <el-select
            v-model="form.type"
            placeholder="Select event type"
            :disabled="submitting"
            style="width: 100%"
          >
            <el-option
              v-for="type in availableTypes"
              :key="type.value"
              :label="type.label"
              :value="type.value"
              :disabled="type.disabled"
            />
          </el-select>
          <div v-if="!canCreateAds && form.type === 'ads'" class="type-warning">
            <el-text type="warning" size="small">
              <el-icon><Warning /></el-icon>
              Ads type events are not available in your region
            </el-text>
          </div>
        </el-form-item>

        <el-form-item label="Priority" prop="priority">
          <el-slider
            v-model="form.priority"
            :min="0"
            :max="10"
            :marks="priorityMarks"
            :disabled="submitting"
          />
          <div class="priority-display">
            Priority: {{ form.priority }} -
            {{ getPriorityLabel(form.priority) }}
          </div>
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            @click="submitForm"
            :loading="submitting"
            :icon="isEdit ? Edit : Plus"
          >
            {{ isEdit ? "Update Event" : "Create Event" }}
          </el-button>
          <el-button @click="resetForm" :disabled="submitting">
            Reset
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useEventsStore } from "../stores/events.js";
import { EventType } from "../services/api.js";
import { ArrowLeft, Edit, Plus, Warning } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import { useTranslations } from "../composables/useTranslations.js";

export default {
  name: "EventForm",
  components: {
    ArrowLeft,
    Edit,
    Plus,
    Warning,
  },
  props: {
    id: String,
  },
  setup(props) {
    const router = useRouter();
    const route = useRoute();
    const eventsStore = useEventsStore();

    const formRef = ref();
    const submitting = ref(false);

    // Computed properties
    const isEdit = computed(() => !!props.id);
    const loading = computed(() => eventsStore.loading);
    const error = computed(() => eventsStore.error);
    const canCreateAds = computed(() => eventsStore.canCreateAds);

    // Form data
    const form = reactive({
      name: "",
      description: "",
      type: "",
      priority: 5,
    });

    // Form validation rules
    const rules = {
      name: [
        { required: true, message: "Please enter event name", trigger: "blur" },
        {
          min: 1,
          max: 100,
          message: "Name should be 1-100 characters",
          trigger: "blur",
        },
      ],
      description: [
        {
          required: true,
          message: "Please enter event description",
          trigger: "blur",
        },
        {
          min: 1,
          max: 500,
          message: "Description should be 1-500 characters",
          trigger: "blur",
        },
      ],
      type: [
        {
          required: true,
          message: "Please select event type",
          trigger: "change",
        },
      ],
      priority: [
        { required: true, message: "Please set priority", trigger: "change" },
        {
          type: "number",
          min: 0,
          max: 10,
          message: "Priority must be between 0-10",
          trigger: "change",
        },
      ],
    };

    // Available event types
    const availableTypes = computed(() => [
      { label: "App", value: EventType.APP, disabled: false },
      { label: "Live Ops", value: EventType.LIVEOPS, disabled: false },
      { label: "Cross Promo", value: EventType.CROSSPROMO, disabled: false },
      { label: "Ads", value: EventType.ADS, disabled: !canCreateAds.value },
    ]);

    // Priority markers
    const priorityMarks = {
      0: "0",
      2: "2",
      5: "5",
      8: "8",
      10: "10",
    };

    // Methods
    const loadEvent = async () => {
      if (!props.id) return;

      try {
        const event = await eventsStore.fetchEvent(props.id);
        form.name = event.name;
        form.description = event.description;
        form.type = event.type;
        form.priority = event.priority;
      } catch (error) {
        console.error("Failed to load event:", error);
        ElMessage.error("Failed to load event");
        router.push("/events");
      }
    };

    const submitForm = async () => {
      if (!formRef.value) return;

      try {
        await formRef.value.validate();

        // Check if ads type is allowed
        if (form.type === EventType.ADS && !canCreateAds.value) {
          ElMessage.error("Ads type events are not available in your region");
          return;
        }

        submitting.value = true;

        if (isEdit.value) {
          await eventsStore.updateEvent(props.id, form);
          ElMessage.success("Event updated successfully");
          router.push(`/events/${props.id}`);
        } else {
          const newEvent = await eventsStore.createEvent(form);
          ElMessage.success("Event created successfully");
          router.push(`/events/${newEvent.id}`);
        }
      } catch (error) {
        console.error("Form submission failed:", error);
        if (error.errors) {
          // Validation errors
          return;
        }
        ElMessage.error(error.message || "Failed to save event");
      } finally {
        submitting.value = false;
      }
    };

    const resetForm = () => {
      if (isEdit.value) {
        loadEvent();
      } else {
        form.name = "";
        form.description = "";
        form.type = "";
        form.priority = 5;
      }
      formRef.value?.clearValidate();
    };

    const getPriorityLabel = (priority) => {
      if (priority >= 8) return "Critical";
      if (priority >= 5) return "High";
      if (priority >= 3) return "Medium";
      return "Low";
    };

    // Watch for ads permission changes
    watch(canCreateAds, (newValue) => {
      if (!newValue && form.type === EventType.ADS) {
        form.type = "";
        ElMessage.warning("Ads type is no longer available in your region");
      }
    });

    // Watch for route changes to handle navigation between create/edit
    watch(
      () => route.path,
      async (newPath, oldPath) => {
        if (newPath !== oldPath) {
          // Reset form when navigating between different routes
          if (newPath === "/events/new") {
            // Switching to create mode
            form.name = "";
            form.description = "";
            form.type = "";
            form.priority = 5;
            formRef.value?.clearValidate();
            eventsStore.clearError();
          } else if (newPath.includes("/edit") && props.id) {
            // Switching to edit mode
            await loadEvent();
          }

          // Re-check ads permission
          await eventsStore.checkAdsPermission();
        }
      },
      { immediate: false }
    );

    // Watch for props.id changes (more reliable for this specific case)
    watch(
      () => props.id,
      async (newId, oldId) => {
        if (newId !== oldId) {
          if (newId) {
            // Switching to edit mode with an ID
            await loadEvent();
          } else {
            // Switching to create mode (no ID)
            form.name = "";
            form.description = "";
            form.type = "";
            form.priority = 5;
            formRef.value?.clearValidate();
            eventsStore.clearError();
          }
        }
      },
      { immediate: false }
    );

    // Lifecycle
    onMounted(async () => {
      // Check ads permission
      await eventsStore.checkAdsPermission();

      // Load event if editing
      if (isEdit.value) {
        await loadEvent();
      }
    });

    return {
      formRef,
      form,
      rules,
      isEdit,
      loading,
      error,
      submitting,
      canCreateAds,
      availableTypes,
      priorityMarks,
      submitForm,
      resetForm,
      getPriorityLabel,
      ArrowLeft,
      Edit,
      Plus,
      Warning,
    };
  },
};
</script>

<style scoped>
.event-form {
  max-width: 800px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0;
  color: #303133;
}

.form-card {
  margin-top: 20px;
}

.type-warning {
  margin-top: 8px;
}

.priority-display {
  margin-top: 10px;
  font-size: 14px;
  color: #606266;
}
</style>
