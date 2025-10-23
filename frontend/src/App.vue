<template>
  <div id="app">
    <el-container>
      <!-- Header -->
      <el-header height="60px" class="header">
        <div class="header-content">
          <h1 class="title">Events7 Dashboard</h1>
          <div class="header-right">
            <el-menu
              mode="horizontal"
              :default-active="$route.name"
              class="navigation"
              router
            >
              <el-menu-item index="/events">
                <el-icon><List /></el-icon>
                <span>{{ t("navigation.events") }}</span>
              </el-menu-item>
              <el-menu-item index="/events/new">
                <el-icon><Plus /></el-icon>
                <span>{{ t("events.createNew") }}</span>
              </el-menu-item>
            </el-menu>
            <LanguageSelector />
          </div>
        </div>
      </el-header>

      <!-- Main Content -->
      <el-main>
        <router-view />
      </el-main>
    </el-container>
  </div>
</template>

<script>
import { List, Plus } from "@element-plus/icons-vue";
import LanguageSelector from "./components/LanguageSelector.vue";
import { useTranslations } from "./composables/useTranslations.js";

export default {
  name: "App",
  components: {
    List,
    Plus,
    LanguageSelector,
  },
  setup() {
    const { t } = useTranslations();

    return {
      t,
    };
  },
};
</script>

<style scoped>
.header {
  background-color: #409eff;
  color: white;
  display: flex;
  align-items: center;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.title {
  margin: 0;
  color: white;
  font-size: 1.5rem;
}

.navigation {
  background-color: transparent;
  border-bottom: none;
}

.navigation .el-menu-item {
  color: white;
}

.navigation .el-menu-item:hover,
.navigation .el-menu-item.is-active {
  background-color: rgba(255, 255, 255, 0.1);
  color: white;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  height: 100vh;
}

.el-main {
  padding: 20px;
}
</style>
