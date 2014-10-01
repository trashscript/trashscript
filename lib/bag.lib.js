// todo: make settings work
(function() {
    console.log('[trash] bag loading...');

    if (typeof(Storage) === "undefined") {
        console.log('[trash] bag failed to load.');
        window.bag = null;
        return;
    }

    var bag = {
        html: "",
        data: null,
        temp: {},
        verify: function() {
            for (var key in this.data) {
                if (key === null) {
                    delete this.data[key];
                } else if (this.data[key] === null) {
                    delete this.data[key];
                }
            }
        },
        load: function() {
            if (localStorage.bag) {
                this.data = JSON.parse(localStorage.bag);
                this.verify();
            }
        },
        save: function() {
            localStorage.bag = JSON.stringify(this.data);
            this.verify();
        },
        set: function(key, val, isTemp) {
            if (isTemp === true) {
                if (val === null && key in this.temp) {
                    delete this.temp[key];
                    return;
                }
                this.temp[key] = val;
                return;
            }
            if (val === null && key in this.data) {
                delete this.data[key];
                return;
            }
            this.data[key] = val;
        },
        get: function(key) {
            if (key in this.temp) {
                return this.temp[key];
            }
            return this.data[key];
        }
    };

    bag.load();
    console.log('[trash] bag loaded.');

    window.bag = bag;
})();