<template>
  <el-select
    v-model="selectedLanguage"
    @change="handleLanguageChange"
    size="small"
    style="width: 50px"
    :teleported="false"
    placement="bottom-end"
    :show-arrow="false"
  >
    <template #prefix>
      <div class="selected-flag">
        <img
          :src="getFlagUrl(getCurrentFlagCode())"
          :alt="getCurrentLanguageLabel()"
          class="flag-image"
        />
      </div>
    </template>
    <el-option
      v-for="lang in languageOptions"
      :key="lang.value"
      :label="lang.label"
      :value="lang.value"
      class="flag-option"
    >
      <span class="flag-option-content">
        <img
          :src="getFlagUrl(lang.flag)"
          :alt="lang.label"
          class="flag-image-option"
        />
        <span class="language-name">{{ lang.label }}</span>
      </span>
    </el-option>
  </el-select>
</template>

<script>
import { ref, computed, onMounted } from "vue";
import { useTranslations } from "../composables/useTranslations.js";

export default {
  name: "LanguageSelector",
  setup() {
    const { currentLanguage, setLanguage } = useTranslations();

    const selectedLanguage = ref(currentLanguage.value);

    const languageOptions = [
      { value: "en", label: "English", flag: "gb" },
      { value: "es", label: "Español", flag: "es" },
      { value: "fr", label: "Français", flag: "fr" },
    ];

    const handleLanguageChange = (newLanguage) => {
      setLanguage(newLanguage);
      selectedLanguage.value = newLanguage;
    };

    // Watch for external language changes
    const currentLang = computed(() => currentLanguage.value);

    onMounted(() => {
      selectedLanguage.value = currentLang.value;
    });

    const getCurrentFlag = () => {
      const current = languageOptions.find(
        (lang) => lang.value === selectedLanguage.value
      );
      return current ? current.flag : "gb";
    };

    const getCurrentFlagCode = () => {
      const current = languageOptions.find(
        (lang) => lang.value === selectedLanguage.value
      );
      return current ? current.flag : "gb";
    };

    const getCurrentLanguageLabel = () => {
      const current = languageOptions.find(
        (lang) => lang.value === selectedLanguage.value
      );
      return current ? current.label : "English";
    };

    const getFlagUrl = (countryCode) => {
      // Using flagcdn.com service for reliable flag images
      return `https://flagcdn.com/w40/${countryCode}.png`;
    };

    return {
      selectedLanguage,
      languageOptions,
      handleLanguageChange,
      getCurrentFlag,
      getCurrentFlagCode,
      getCurrentLanguageLabel,
      getFlagUrl,
    };
  },
};
</script>

<style scoped>
.el-select {
  margin-left: 16px;
}

.selected-flag {
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 24px;
}

.flag-image {
  width: 24px;
  height: 18px;
  object-fit: cover;
  border-radius: 2px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.flag-image-option {
  width: 20px;
  height: 15px;
  object-fit: cover;
  border-radius: 2px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.flag-option {
  padding: 8px 12px;
}

.flag-option-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.language-name {
  font-size: 14px;
  color: #606266;
}

:deep(.el-select__wrapper) {
  padding: 4px;
  border: 1px solid transparent;
  background: transparent;
  box-shadow: none;
  cursor: pointer;
}

:deep(.el-select__wrapper:hover) {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
}

:deep(.el-input__inner) {
  display: none;
}

:deep(.el-input__wrapper) {
  padding: 0;
  background: transparent;
  box-shadow: none;
}

:deep(.el-select__selected-item) {
  display: none;
}

:deep(.el-select__placeholder) {
  display: none;
}
</style>
