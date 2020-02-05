<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated reveal>
      <q-toolbar>
        <q-toolbar-title class="q-mx-lg q-my-sm gt-xs" style="overflow: visible">
          <router-link to="/">
            AskSin Analyzer XS
          </router-link>
        </q-toolbar-title>

        <q-space class="lt-sm"/>

        <q-tabs>
          <q-route-tab icon="dashboard" to="/home" />
          <q-route-tab icon="list" to="/list" />
          <q-route-tab icon="settings" to="/settings" />
          <q-route-tab icon="info" to="/info" />
        </q-tabs>

        <q-space/>

      </q-toolbar>

    </q-header>

    <q-page-container>
      <div class="page" style="padding-bottom: 0" v-for="err in errors">
        <q-banner class="text-white bg-red" inline-actions>
          <template v-slot:avatar>
            <q-icon name="warning" color="white"/>
          </template>
          <span class="text-bold">
            {{ err }}
          </span>
        </q-banner>
      </div>

      <transition name="route" mode="out-in" :appear="true">
        <router-view/>
      </transition>
    </q-page-container>
  </q-layout>
</template>

<script>
  export default {
    name: 'App',

    computed: {
      errors() {
        return [...this.$service.data.errors, ...this.$root.errors];
      }
    }
  }
</script>

<style lang="stylus" scoped>
  .q-toolbar a
    line-height 1;

  .q-toolbar__title a
    text-decoration none
    color white
</style>
