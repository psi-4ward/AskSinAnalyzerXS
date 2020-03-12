<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated reveal>
      <q-toolbar>
        <q-toolbar-title class="q-mx-lg q-my-sm gt-xs" style="overflow: visible">
          <router-link to="/">
            <q-avatar rounded class="q-mr-md">
              <img src="favicon-96x96.png">
            </q-avatar>
            <span class="logo-text">
              AskSin Analyzer XS
            </span>
          </router-link>
        </q-toolbar-title>

        <q-space class="lt-sm"/>

        <q-tabs>
          <q-route-tab icon="dashboard" to="/home" />
          <q-route-tab icon="list" to="/list" />
          <q-route-tab icon="history" to="/history" />
          <q-route-tab icon="settings" to="/settings" />
          <q-route-tab icon="info" to="/info" />
        </q-tabs>

        <q-space/>

      </q-toolbar>

    </q-header>

    <q-page-container>
      <errors/>
      <transition name="route" mode="out-in" :appear="true">
        <router-view/>
      </transition>
    </q-page-container>
  </q-layout>
</template>

<script>
  import Errors from './components/Errors';
  export default {
    name: 'App',
    components: { Errors },

    computed: {
      errors() {
        return [...this.$service.data.errors, ...this.$root.errors];
      }
    }
  }
</script>

<style lang="stylus">
  .q-toolbar a
    line-height 1;

  .q-toolbar__title a
    text-decoration none
    color white

  .logo-text
    @media (max-width 950px)
      display none

  .q-tabs__arrow
    display none !important
</style>
