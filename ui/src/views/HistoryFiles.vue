<template>
  <div class="page">
    <h1>Persistenter Datenspeicher</h1>
    <history-file-list/>
  </div>
</template>

<script>
  import HistoryFileList from '@/components/HistoryFileList.vue';

  export default {
    name: 'HistoryFilesView',
    components: {
      HistoryFileList,
    },
  }
</script>

<style scoped lang="stylus">
</style>
