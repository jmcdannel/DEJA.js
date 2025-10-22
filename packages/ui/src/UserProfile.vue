<script setup lang="ts">
import { useCurrentUser } from 'vuefire'
import SignOut from './Signout.vue'
const user = useCurrentUser()

</script>
<template>
  <v-menu location="bottom">
      <template v-slot:activator="{ props }">
        <v-avatar
          type="button"
          v-bind="props"
          class="shadow-md border-2 border-white/20 mr-2"
        >
          <v-img
            v-if="user?.photoURL"
            :src="user?.photoURL"
            alt="user photo"
          />
          <span v-else class="w-8 h-8 rounded-full bg-gray-500 flex items-center justify-center text-white">
            {{ user?.displayName?.charAt(0) || '?' }}
          </span>
        </v-avatar>
      </template>
      <v-list>
        <v-list-item>
          <v-list-item-title>
            <span
              class="block text-sm font-semibold text-gray-900 dark:text-white"
              >{{ user?.displayName }}</span>
            <span
              class="block text-sm text-gray-900 truncate dark:text-white"
              >{{ user?.email }}</span>
          </v-list-item-title>          
        </v-list-item>
        <v-list-item>
          <a
            href="#"
            class="block py-2 px-4 text-sm hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-400 dark:hover:text-white"
            >
            <span class="flex items-center">
              <v-icon icon="mdi-account" class="mr-2" />
              My profile
            </span>
          </a>
        </v-list-item>
        <v-list-item>
          
          <a
            href="#"
            class="block py-2 px-4 text-sm hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-400 dark:hover:text-white"
            >
            
            <span class="flex items-center">
              <v-icon icon="mdi-cog" class="mr-2" />
              Account settings
            </span>
          </a>
        </v-list-item>
        <v-list-item>
          <a
          href="#"
          class="flex justify-between items-center py-2 px-4 text-sm hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
          >
            <span class="flex items-center">
              <v-icon icon="mdi-fire" class="mr-2" />
              Pro version
            </span>
          </a>
        </v-list-item>
        <v-list-item>
          <SignOut />
        </v-list-item>
      </v-list>
    </v-menu>

</template>