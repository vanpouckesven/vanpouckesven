var app = new Vue({
    el: '#guildwars2App',
    methods: {
        selectDailyItem: function (dailyItem) {
            if (!dailyItem.completed) {
                this.dailyItems.completed++;
            }
            else {
                this.dailyItems.completed--;
            }
        },
        copyWaypoints: function(items) {
            var waypointString = '';

            items.forEach(function(item) {
               if(item.waypoint_code) {
                   waypointString += item.waypoint_code +  ' ';
               }
            });

            var $temp = $("<input>");
            $("body").append($temp);
            $temp.val(waypointString).select();
            document.execCommand("copy");
            $temp.remove();

        },
        showImage: function(item) {
            this.currentItem = item;
        },
        determineWorldBosses: function () {
            var today = new Date();
            var hour = today.getHours();
            var minutes = today.getMinutes();

            if (this.currentWorldBoss && this.isWorldBossUpcomming(this.currentWorldBoss, hour, minutes)) {
                this.calculateWorldBossCountdown(this.currentWorldBoss);
                this.calculateWorldBossCountdown(this.nextWorldBoss);

                this.$forceUpdate();
                return;
            }

            var currentWorldBoss = worldBossSpawnTimes[0];
            for (var i = 1; i < worldBossSpawnTimes.length; i++) {
                var nextWorldBoss = worldBossSpawnTimes[i];
                if (this.isWorldBossUpcomming(currentWorldBoss, hour, minutes)) {
                    break;
                }
                else {
                    currentWorldBoss = nextWorldBoss;
                }
            }

            if (currentWorldBoss == nextWorldBoss) {
                nextWorldBoss = worldBossSpawnTimes[0];
            }

            this.currentWorldBoss = currentWorldBoss;
            this.nextWorldBoss = nextWorldBoss;

            this.calculateWorldBossCountdown(this.currentWorldBoss);
            this.calculateWorldBossCountdown(this.nextWorldBoss);
            this.$forceUpdate();
        },
        isWorldBossUpcomming: function (worldBoss, currentHour, currentMinutes) {
            return currentHour < worldBoss.hour ||
                (currentHour == worldBoss.hour && currentMinutes < worldBoss.minutes);
        },
        calculateWorldBossCountdown: function (worldBoss) {
            var now = moment();
            var worldBossDate = moment();

            worldBossDate.minutes(worldBoss.minutes);
            worldBossDate.hours(worldBoss.hour);
            worldBossDate.seconds(59);

            var duration = moment.duration(worldBossDate.diff(now));

            worldBoss.durationHours = duration.hours();
            worldBoss.durationMinutes = duration.minutes();
        }
    },
    filters: {
      normalizeTime: function(value) {
        return (value < 10) ? '0' + value : value;
      }
    },
    mounted: function () {
        var today = new Date();
        this.todayDateString = today.getDate() + '' + (today.getMonth() + 1) + '' + today.getFullYear();
        this.localStorageString = 'dailyItems-' + this.todayDateString;

        if (localStorage.getItem(this.localStorageString)) {
            this.dailyItems = JSON.parse(localStorage.getItem(this.localStorageString));
        } else {
            var total = 0;
            total += this.dailyItems.general.length;

            this.dailyItems.ores.forEach(function(ore) {
                total += ore.veins.length;
            });

            this.dailyItems.total = total;
        }

        this.determineWorldBosses();
        setInterval(this.determineWorldBosses.bind(this), 60000);
    },
    data: {
        dailyItems: {
            general: defaultGeneralDailyItems,
            ores: defaultOres,
            total: 0,
            completed: 0
        },
        currentItem: {
          'map': '',
          'waypoint': '',
          'image': ''
        },
        todayDateString: '',
        localStorageString: '',
        currentWorldBoss: null,
        nextWorldBoss: null
    },
    watch: {
        dailyItems: {
            handler: function () {
                localStorage.setItem(this.localStorageString, JSON.stringify(this.dailyItems));
            },
            deep: true
        }
    }
});
