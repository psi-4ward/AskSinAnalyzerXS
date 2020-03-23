<template>
  <div>
    <q-table
      :dense="$q.screen.lt.md"
      title="CSV-Dateien"
      :data="files"
      :columns="columns"
      selection="multiple"
      :selected.sync="selected"
      :loading="loading"
      :pagination.sync="pagination"
      :filter="filter"
      row-key="name"
      :binary-state-sort="true"
    >
      <template v-slot:top>
        <q-btn color="primary"
          :disable="selected.length<1"
          label="importieren"
          @click="importCSV"
          :loading="importCsvLoading"
          icon="input"
        />
        <q-btn class="q-ml-sm"
          color="red"
          :disable="selected.length<1"
          label="löschen"
          @click="deleteFiles"
          :loading="deleteLoading"
          icon="delete_forever"
        />
        <q-space/>
        <q-input dense debounce="300" color="primary" v-model="filter">
          <template v-slot:append>
            <q-icon name="search"/>
          </template>
        </q-input>
        <q-space/>
        <q-btn color="green"
          :disable="$service.data.liveData"
          label="Livedaten streamen"
          @click="enableLiveData()"
          icon="play_circle_outline"
        />
      </template>
      <template v-slot:body-cell-btns="props">
        <q-td :props="props" style="width: 65px">
          <q-btn color="primary" icon="save_alt" dense title="download" @click="downloadCsv(props.row.name)" />
        </q-td>
      </template>
    </q-table>
    <p class="q-mt-md">
      <q-icon name="info" class="text-primary"/>
      Speicherort:
      {{ $service.data.config._appPath }}
    </p>
  </div>
</template>

<script>
  import { saveAs } from 'file-saver';

  function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  export default {
    name: 'HistoryFileList',
    data() {
      return {
        loading: true,
        importCsvLoading: false,
        deleteLoading: false,
        selected: [],
        pagination: {
          rowsPerPage: 10
        },
        filter: '',
        columns: [
          {
            name: 'name',
            label: 'Datei',
            align: 'left',
            field: row => row.name,
            sortable: true
          },
          {
            name: 'size',
            label: 'Größe',
            align: 'right',
            field: row => row.size,
            format: formatBytes,
          },
          {
            name: 'btns',
            align: 'right',
          }
        ],
        files: []
      };
    },

    async mounted() {
      this.loadFiles();
    },

    methods: {
      async loadFiles() {
        this.loading = true;
        this.files = (await this.$service.req('get csv-files'));
        this.loading = false;
      },

      async importCSV() {
        this.importCsvLoading = true;
        this.$service.clear();
        this.selected.forEach(async ({ name }) => {
          const csvData = await this.$service.req('get csv-content', name);
          await this.$service.loadCsvData(csvData);
        });
        this.importCsvLoading = false;
        this.$router.push('/list');
      },

      async deleteFiles() {
        this.deleteLoading = true;
        if(!confirm('Die Dateien werden gelöscht!')) {
          this.deleteLoading = false;
          return;
        }
        this.selected.forEach(async ({name}) => {
          await this.$service.req('delete csv-file', name);
        });
        await this.loadFiles();
        this.deleteLoading = false;
      },

      enableLiveData() {
        this.$service.enableLiveData();
        this.$router.push('/list');
      },

      async downloadCsv(name) {
        const csvData = await this.$service.req('get csv-content', name);
        saveAs(new Blob([csvData], { type: "text/csv;charset=utf-8" }), name);
      }
    }
  }
</script>

<style lang="stylus">
  thead th
    border-bottom 1px solid black !important
    font-weight bold !important
</style>
