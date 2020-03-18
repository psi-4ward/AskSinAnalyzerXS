<template>
  <div v-if="telegram">
    <h4 class="text-center">
      {{ telegram.dc }}% DutyCyle
      von {{ telegram.fromName || telegram.fromSerial }}
      um {{ telegram.tstamp | date }}
    </h4>
    <div v-if="dcWarning" class="text-center">
      <q-icon name="warning" color="red"/>
      Es sind keine Daten für eine volle Stunde verfügbar, der DutyCycle kann zu gering sein.
    </div>
    <div ref="chart" style="position: relative; height: 500px; max-height: 80vh"></div>
  </div>
</template>

<script>
  import Highcharts from 'highcharts';

  export default {
    name: 'DutyCyclePerDevice',

    props: {
      telegram: {
        type: Object,
        required: true
      }
    },

    computed: {
      seriesData() {
        const data = {};
        const lastTstamp = this.telegram.tstamp - 60 * 60;
        for (let i = this.$service.data.telegrams.length-1; i >= 0; i--) {
          const t = this.$service.data.telegrams[i];
          const to = t.toName || t.toSerial;
          if (t.fromAddr != this.telegram.fromAddr || t.tstamp > this.telegram.tstamp) continue;
          if (t.tstamp < lastTstamp) break;
          if(!data[to]) data[to] = 0;
          data[to] += (t.len + 1) * 0.81 / 360;
        }
        Object.keys(data).forEach(k => data[k] = Math.round(data[k]*100)/100);
        return Object.entries(data).map(([name, y]) => ({ name, y }));
      },
      dcWarning() {
        const telegrams = this.$service.data.telegrams;
        return this.telegram.tstamp - telegrams[0].tstamp < 60*60;
      }
    },

    watch: {
      data: {
        immediate: false,
        handler() {
          this.updateData();
        }
      }
    },

    mounted() {
      this.hightchart = Highcharts.chart(this.$refs.chart, {
        chart: {
          plotBackgroundColor: null,
          plotBorderWidth: null,
          plotShadow: false,
          type: 'pie',
          animation: true
        },
        title: false,
        plotOptions: {
          pie: {
            cursor: 'pointer',
            dataLabels: {
              enabled: true,
              format: '<b>{point.name}</b>: {point.y}%'
            },
          }
        },
        tooltip: false,
        legend: {
          align: 'right',
          verticalAlign: 'middle',
          layout: 'vertical',
          maxHeight: 330
        },
        series: [{
          name: 'DutyCycle',
          colorByPoint: true,
          data: []
        }]
      });
      this.updateData();
    },

    methods: {
      updateData() {
        this.hightchart.series[0].setData(this.seriesData, true, true);
      }
    }
  }
</script>
