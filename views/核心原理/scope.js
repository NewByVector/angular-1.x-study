function Scope () {
    this.$$watchList = [];
    this.$init();
    this.$bind();
}
Scope.prototype = {
    constructor: Scope,
    $init: function () {
        //以ng-model为例
        var list = document.querySelectorAll('[ng-model]');
        for (var i = 0, len = list.length; i < len; i++) {
            var bindData = list[i].getAttribute('ng-model');
            this.$watch(bindData);
        }
    },
    $bind: function () {
        //以ng-click为例
        var that = this;
        var list = document.querySelectorAll('[ng-click]');
        for (var i = 0,len = list.length; i < len; i++) {
            list[i].onclick = function () {
                var func = this.getAttribute('ng-click');
                that[func]();
                that.$digest();
            };
        }  
    },
    $render: function (name, newVal) {
        var list = document.querySelectorAll('[ng-model=' + name + ']');
        for (var i = 0, len = list.length; i < len; i++) {
            list[i].value = newVal;
        }
    },
    $watch: function (name, listener) {
        var index = -1;
        for (var i = 0; i < this.$$watchList.length; i++) {
            if (this.$$watchList[i].name === name) {
                index = i;
                break;
            }
        }
        if (index == -1) {
            this.$$watchList.push({
                name: name,
                listener: listener || function (){}
            });
        } else {
            this.$$watchList.splice(index, 1, {
                name: name, 
                listener: listener || function (){}
            });
        }
    },
    $digest: function () {
        var list = this.$$watchList;
        var watch, newVal, oldVal;
        var dirty = true;
        var checkTimes = 0;
        while(dirty) {
            for (var i = 0, len = list.length; i < len; i++) {
                dirty = false;
                watch = list[i];
                newVal = this[watch.name];
                oldVal = watch.last;
                if (newVal != oldVal) {
                    this.$render(watch.name, newVal);
                    watch.listener(newVal, oldVal);
                    dirty = true;
                }
                watch.last = newVal;
            }
            checkTimes++;
            if (checkTimes > 10 && dirty) {
                throw new Error('over max ttl');
            }
        }
    }
};