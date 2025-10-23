<template>
  <div class="event-detail">
    <div class="page-header">
      <h2>Event Details</h2>
      <div class="header-actions">
        <el-button @click="$router.go(-1)">
          <el-icon><ArrowLeft /></el-icon>
          Back
        </el-button>
        <el-button
          v-if="event && !loading"
          type="warning"
          @click="editEvent"
          :icon="Edit"
        >
          Edit
        </el-button>
        <el-button
          v-if="event && !loading"
          type="danger"
          @click="confirmDelete"
          :icon="Delete"
        >
          Delete
        </el-button>
      </div>
    </div>

    <!-- Error State -->
    <el-alert
      v-if="error"
      :title="error"
      type="error"
      :closable="false"
      style="margin-bottom: 20px"
    />

    <!-- Event Details -->
    <el-card
      v-if="event && !loading"
      class="event-card"
      v-loading="loading"
      element-loading-text="Loading event..."
    >
      <div class="event-content">
        <div class="event-header">
          <h3 class="event-name">{{ event.name }}</h3>
          <div class="event-badges">
            <el-tag :type="getTypeColor(event.type)" size="large">
              {{ formatType(event.type) }}
            </el-tag>
            <el-tag :type="getPriorityColor(event.priority)" size="large">
              Priority: {{ event.priority }}
            </el-tag>
          </div>
        </div>

        <el-divider />

        <div class="event-details">
          <el-descriptions :column="1" border>
            <el-descriptions-item label="ID">
              <el-text class="event-id">{{ event.id }}</el-text>
            </el-descriptions-item>
            <el-descriptions-item label="Name">
              {{ event.name }}
            </el-descriptions-item>
            <el-descriptions-item label="Description">
              <div class="description-content">
                {{ event.description }}
              </div>
            </el-descriptions-item>
            <el-descriptions-item label="Type">
              <el-tag :type="getTypeColor(event.type)">
                {{ formatType(event.type) }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="Priority">
              <el-tag :type="getPriorityColor(event.priority)">
                {{ event.priority }} - {{ getPriorityLabel(event.priority) }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="Created">
              {{ formatDateTime(event.createdAt) }}
            </el-descriptions-item>
            <el-descriptions-item label="Last Updated">
              {{ formatDateTime(event.updatedAt) }}
            </el-descriptions-item>
          </el-descriptions>
        </div>
      </div>
    </el-card>

    <!-- Delete Confirmation Dialog -->
    <el-dialog v-model="deleteDialogVisible" title="Confirm Delete" width="30%">
      <span>Are you sure you want to delete event "{{ event?.name }}"?</span>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="deleteDialogVisible = false">Cancel</el-button>
          <el-button type="danger" @click="deleteEvent" :loading="deleting">
            Delete
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useEventsStore } from "../stores/events.js";
import { ArrowLeft, Edit, Delete } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";

export default {
  name: "EventDetail",
  components: {
    ArrowLeft,
    Edit,
    Delete,
  },
  props: {
    id: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const router = useRouter();
    const eventsStore = useEventsStore();

    const deleteDialogVisible = ref(false);
    const deleting = ref(false);

    // Computed properties
    const event = computed(() => eventsStore.currentEvent);
    const loading = computed(() => eventsStore.loading);
    const error = computed(() => eventsStore.error);

    // Methods
    const loadEvent = async () => {
      try {
        await eventsStore.fetchEvent(props.id);
      } catch (error) {
        console.error("Failed to load event:", error);
        ElMessage.error("Event not found");
        router.push("/events");
      }
    };

    const editEvent = () => {
      router.push(`/events/${props.id}/edit`);
    };

    const confirmDelete = () => {
      deleteDialogVisible.value = true;
    };

    const deleteEvent = async () => {
      try {
        deleting.value = true;
        await eventsStore.deleteEvent(props.id);
        ElMessage.success("Event deleted successfully");
        router.push("/events");
      } catch (error) {
        console.error("Failed to delete event:", error);
        ElMessage.error("Failed to delete event");
      } finally {
        deleting.value = false;
        deleteDialogVisible.value = false;
      }
    };

    const getTypeColor = (type) => {
      const colors = {
        app: "primary",
        liveops: "success",
        crosspromo: "warning",
        ads: "danger",
      };
      return colors[type] || "info";
    };

    const getPriorityColor = (priority) => {
      if (priority >= 8) return "danger";
      if (priority >= 5) return "warning";
      if (priority >= 3) return "primary";
      return "info";
    };

    const getPriorityLabel = (priority) => {
      if (priority >= 8) return "Critical";
      if (priority >= 5) return "High";
      if (priority >= 3) return "Medium";
      return "Low";
    };

    const formatType = (type) => {
      const typeMap = {
        app: "App",
        liveops: "Live Ops",
        crosspromo: "Cross Promo",
        ads: "Ads",
      };
      return typeMap[type] || type;
    };

    const formatDateTime = (dateString) => {
      return new Date(dateString).toLocaleString();
    };

    // Lifecycle
    onMounted(() => {
      loadEvent();
    });

    return {
      event,
      loading,
      error,
      deleteDialogVisible,
      deleting,
      editEvent,
      confirmDelete,
      deleteEvent,
      getTypeColor,
      getPriorityColor,
      getPriorityLabel,
      formatType,
      formatDateTime,
      ArrowLeft,
      Edit,
      Delete,
    };
  },
};
</script>

<style scoped>
.event-detail {
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

.header-actions {
  display: flex;
  gap: 10px;
}

.event-card {
  margin-top: 20px;
}

.event-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.event-name {
  margin: 0;
  color: #303133;
  font-size: 1.5rem;
}

.event-badges {
  display: flex;
  gap: 10px;
}

.event-id {
  font-family: monospace;
  font-size: 12px;
  color: #909399;
}

.description-content {
  white-space: pre-wrap;
  word-break: break-word;
}
</style>
