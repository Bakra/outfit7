<template>
  <div class="events-list">
    <div class="page-header">
      <h2>{{ t("events.title") }}</h2>
      <el-button
        type="primary"
        @click="$router.push('/events/new')"
        :icon="Plus"
      >
        {{ t("events.createNew") }}
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

    <!-- Events Table -->
    <el-table
      v-if="!loading && !error"
      :data="events"
      style="width: 100%"
      stripe
      border
      v-loading="loading"
      :element-loading-text="t('events.loadingEvents')"
    >
      >
      <el-table-column prop="name" :label="t('common.name')" min-width="150" />
      <el-table-column
        prop="description"
        :label="t('common.description')"
        min-width="200"
      />
      <el-table-column prop="type" :label="t('common.type')" width="120">
        <template #default="scope">
          <el-tag :type="getTypeColor(scope.row.type)">
            {{ t(`eventTypes.${scope.row.type}`) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        prop="priority"
        :label="t('common.priority')"
        width="100"
      >
        <template #default="scope">
          <el-tag :type="getPriorityColor(scope.row.priority)">
            {{ scope.row.priority }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        prop="createdAt"
        :label="t('common.created')"
        width="150"
      >
        <template #default="scope">
          {{ formatDate(scope.row.createdAt) }}
        </template>
      </el-table-column>
      <el-table-column :label="t('common.actions')" width="250" fixed="right">
        <template #default="scope">
          <div class="action-buttons">
            <el-button
              size="small"
              @click="viewEvent(scope.row.id)"
              :icon="View"
              class="action-btn"
            >
              {{ t("common.view") }}
            </el-button>
            <el-button
              size="small"
              type="warning"
              @click="editEvent(scope.row.id)"
              :icon="Edit"
              class="action-btn"
            >
              {{ t("common.edit") }}
            </el-button>
            <el-button
              size="small"
              type="danger"
              @click="confirmDelete(scope.row)"
              :icon="Delete"
              class="action-btn delete-btn"
            >
              {{ t("common.delete") }}
            </el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <!-- Empty State -->
    <el-empty
      v-if="!loading && !error && events.length === 0"
      :description="t('events.noEventsFound')"
    >
      <el-button type="primary" @click="$router.push('/events/new')">
        {{ t("events.createFirst") }}
      </el-button>
    </el-empty>

    <!-- Delete Confirmation Dialog -->
    <el-dialog
      v-model="deleteDialogVisible"
      :title="t('events.deleteConfirmTitle')"
      width="30%"
    >
      <span>{{
        t("events.deleteConfirmMessage", { name: eventToDelete?.name })
      }}</span>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="deleteDialogVisible = false">{{
            t("common.cancel")
          }}</el-button>
          <el-button type="danger" @click="deleteEvent" :loading="loading">
            {{ t("common.delete") }}
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { useEventsStore } from "../stores/events.js";
import { Plus, View, Edit, Delete } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import { useTranslations } from "../composables/useTranslations.js";
import { eventsApi } from "../services/api.js";

export default {
  name: "EventsList",
  components: {
    Plus,
    View,
    Edit,
    Delete,
  },
  setup() {
    const router = useRouter();
    const eventsStore = useEventsStore();
    const { t } = useTranslations();

    const deleteDialogVisible = ref(false);
    const eventToDelete = ref(null);

    // Computed properties
    const events = computed(() => eventsStore.events);
    const loading = computed(() => eventsStore.loading);
    const error = computed(() => eventsStore.error);

    // Methods
    const loadEvents = async () => {
      console.log("Loading events...");
      try {
        // Test backend connectivity first
        const isConnected = await eventsApi.testConnection();
        if (!isConnected) {
          throw new Error(
            "Cannot connect to backend server. Please make sure the backend is running on http://localhost:3000"
          );
        }

        await eventsStore.fetchEvents();
        console.log("Events loaded successfully:", eventsStore.events);
      } catch (error) {
        console.error("Failed to load events:", error);
        ElMessage.error(error.message || t("events.failedToLoad"));
      }
    };

    const viewEvent = (id) => {
      router.push(`/events/${id}`);
    };

    const editEvent = (id) => {
      router.push(`/events/${id}/edit`);
    };

    const confirmDelete = (event) => {
      eventToDelete.value = event;
      deleteDialogVisible.value = true;
    };

    const deleteEvent = async () => {
      try {
        await eventsStore.deleteEvent(eventToDelete.value.id);
        ElMessage.success(t("events.eventDeleted"));
        deleteDialogVisible.value = false;
        eventToDelete.value = null;
      } catch (error) {
        console.error("Failed to delete event:", error);
        ElMessage.error(t("events.failedToDelete"));
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

    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleDateString();
    };

    // Lifecycle
    onMounted(() => {
      loadEvents();
    });

    return {
      events,
      loading,
      error,
      deleteDialogVisible,
      eventToDelete,
      viewEvent,
      editEvent,
      confirmDelete,
      deleteEvent,
      getTypeColor,
      getPriorityColor,
      formatDate,
      Plus,
      View,
      Edit,
      Delete,
      t,
    };
  },
};
</script>

<style scoped>
.events-list {
  max-width: 1200px;
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

.action-buttons {
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: flex-start;
  padding-right: 8px;
}

.action-btn {
  margin: 0 !important;
  min-width: auto;
  flex-shrink: 0;
}

/* Responsive behavior for action buttons */
@media (max-width: 1024px) {
  .action-buttons {
    flex-direction: column;
    gap: 4px;
    align-items: stretch;
  }

  .action-btn {
    width: 100%;
    justify-content: center;
  }

  .delete-btn {
    margin-right: 0 !important;
  }
}

/* For very small screens */
@media (max-width: 768px) {
  .action-buttons {
    gap: 2px;
  }
}
</style>
