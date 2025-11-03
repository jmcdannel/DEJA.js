<script setup lang="ts">
import { useMenu } from '@/core/Menu/useMenu'

const { menuConfig, saveFavorite, removeFavorite } = useMenu()

</script>
<template>
    <v-card flat class="bg-transparent" title="Footer Menu" subtitle="Select Favorites">
        <v-card-text class="pa-0">
            <v-list dense>
                <template v-if="menuConfig && menuConfig.length">
                    <v-list-item
                        v-for="item in menuConfig"
                        :key="item.name"
                        >
                        <v-btn 
                            variant="outlined"
                            :key="item.label"
                            @click="item.isFavorite ? removeFavorite(item.name) : saveFavorite(item.name)"
                            :color="item.isFavorite ? item.color : 'gray-500'"
                            :append-icon="item.icon"
                            :prepend-icon="(item.isFavorite ? 'mdi-star' : 'mdi-star-outline')"
                        >{{  item.label }}</v-btn>
                       
                    </v-list-item>
                </template>

                <template v-else>
                    <v-row class="ma-0 pa-2" align="center" justify="center">
                        <v-col class="text-center">
                            <div class="subtitle-2">No menu items available</div>
                        </v-col>
                    </v-row>
                </template>
            </v-list>
        </v-card-text>
    </v-card>
</template>