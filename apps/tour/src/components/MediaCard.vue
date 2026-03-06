<script setup lang="ts">
interface MediaItem {
  id: string
  title: string
  description: string
  type: 'video' | 'audio'
  category: 'introduction' | 'technical' | 'overview' | 'area-detail'
  area: string
  duration: string
  thumbnail?: string
  url: string
  featured: boolean
}

interface Props {
  media: MediaItem
}

defineProps<Props>()
defineEmits<{
  play: [mediaId: string]
  'view-details': [mediaId: string]
}>()
</script>

<template>
  <v-card
    elevation="2"
    class="media-card cursor-pointer transition-transform duration-deja-fast ease-deja-standard hover:-translate-y-0.5"
    hover
    @click="$emit('play', media.id)"
  >
    <div class="media-thumbnail">
      <v-img
        v-if="media.thumbnail"
        :src="media.thumbnail"
        height="160"
        cover
      >
        <div class="play-overlay">
          <v-icon icon="mdi-play-circle" size="48" color="white"></v-icon>
        </div>
      </v-img>
      <div v-else class="thumbnail-placeholder">
        <v-icon 
          :icon="media.type === 'video' ? 'mdi-video' : 'mdi-music'" 
          size="48" 
          class="media-icon"
        ></v-icon>
        <div class="play-overlay">
          <v-icon icon="mdi-play-circle" size="48" color="white"></v-icon>
        </div>
      </div>
      
      <v-chip 
        class="media-type-chip"
        :color="media.type === 'video' ? 'primary' : 'accent'"
        size="small"
      >
        <v-icon 
          :icon="media.type === 'video' ? 'mdi-video' : 'mdi-music'" 
          size="16" 
          class="mr-1"
        ></v-icon>
        {{ media.type.toUpperCase() }}
      </v-chip>
      
      <v-chip 
        v-if="media.featured"
        class="featured-chip"
        color="secondary"
        size="small"
      >
        <v-icon icon="mdi-star" size="16" class="mr-1"></v-icon>
        Featured
      </v-chip>
    </div>
    
    <v-card-title class="text-h6 pb-2">
      {{ media.title }}
    </v-card-title>
    
    <v-card-text class="pt-0">
      <p class="text-body-2 text-medium-emphasis mb-3">
        {{ media.description }}
      </p>
      
      <div class="d-flex justify-space-between align-center">
        <v-chip size="small" color="info" variant="tonal">
          {{ media.area }}
        </v-chip>
        <span class="text-caption text-medium-emphasis">
          {{ media.duration }}
        </span>
      </div>
    </v-card-text>
    
    <v-card-actions>
      <v-btn 
        color="primary" 
        variant="text"
        @click.stop="$emit('play', media.id)"
      >
        <v-icon icon="mdi-play" class="mr-1"></v-icon>
        Play
      </v-btn>
      <v-spacer></v-spacer>
      <v-btn 
        icon="mdi-information" 
        size="small"
        @click.stop="$emit('view-details', media.id)"
      ></v-btn>
    </v-card-actions>
  </v-card>
</template>

<style scoped>
.media-thumbnail {
  position: relative;
  height: 160px;
  overflow: hidden;
}

.thumbnail-placeholder {
  height: 100%;
  background: rgb(var(--v-theme-surface-variant));
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.media-icon {
  opacity: 0.4;
  color: rgb(var(--v-theme-on-surface-variant));
}

.play-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 250ms cubic-bezier(0.4, 0, 0.2, 1);
}

.media-card:hover .play-overlay {
  opacity: 1;
}

.media-type-chip {
  position: absolute;
  top: 8px;
  left: 8px;
  z-index: 2;
}

.featured-chip {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 2;
}
</style>
