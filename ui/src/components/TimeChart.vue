<template>
  <div>
    <div ref="chart" style="height:300px"></div>
  </div>
</template>

<script>
  import Highcharts from 'highcharts/highstock';

  export default {
    name: "TimeChart",
    props: {
      data: {
        type: Array,
        required: true
      },
    },

    updateInterval: null,

    mounted() {
      const $vm = this;
      const setTimeFilterDebounced = $vm.$debounce((min, max) => {
        $vm.$root.timefilter.start = Math.floor(min / 1000);
        $vm.$root.timefilter.stop = Math.ceil(max / 1000);
      }, 500);

      this.hightchart = Highcharts.stockChart(this.$refs.chart, {
        chart: {
          zoomType: 'x',
          marginRight: 25,
          animation: this.$service.data.config.animations,
        },
        tooltip: {
          valueDecimals: 0
        },
        time: { useUTC: false },
        rangeSelector: {
          inputEnabled: false,
          buttons: [{
            type: 'minute',
            count: 1,
            text: '1m'
          }, {
            type: 'minute',
            count: 5,
            text: '5m'
          }, {
            type: 'minute',
            count: 10,
            text: '10m'
          }, {
            type: 'minute',
            count: 30,
            text: '30m'
          }, {
            type: 'hour',
            count: 1,
            text: '1h'
          }, {
            type: 'all',
            text: 'All'
          }]
        },
        title: { text: 'Telegramme' },
        exporting: { enabled: false },
        xAxis: {
          events: {
            afterSetExtremes(ev) {
              setTimeFilterDebounced(ev.min, ev.max);
            },
            type: 'datetime',
            ordinal: false,
          }
        },
        yAxis: [
          {
            opposite: false
          },
          {
            opposite: true,
            max: -40,
            min: -120,
          }
        ],
        plotOptions: {
          column: {
            groupPadding: 0.1,
            dataGrouping: {
              groupPixelWidth: 30
            }
          },
        },
        series: [
          {
            name: 'Telegramme',
            type: 'column',
            maxPointWidth: 15,
          },
          {
            name: 'RSSI Noise',
            type: 'line',
            color: '#ff5200',
            lineWidth: 2,
            yAxis: 1
          }
        ]
      });
      this.updateData();
      this.updateInterval = setInterval(this.updateData.bind(this), 1000);
    },

    beforeDestroy() {
      clearTimeout(this.updateInterval);
    },

    data() {
      return {};
    },

    methods: {
      updateData() {
        let m = new Map();
        this.data.forEach(t => {
          let cnt = m.get(t.tstamp * 1000) || 0;
          cnt++;
          m.set(t.tstamp * 1000, cnt);
        });
        // Highstock seems to be buggy with zoom-vals causing duplicated data
        this.hightchart.series[0].setData(Array.from(m), false);
        this.hightchart.series[1].setData([...this.$service.rssiLog], false);
        this.hightchart.redraw();
      },
    }
  }
</script>

<style lang="stylus" scoped>

</style>
