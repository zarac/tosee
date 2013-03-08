//* dust.js stuff
dust.onLoad = function(name, callback) {
    $.get(['views/', '.dust.html'].join(name), function(data) {
        callback(null, data);
    }, 'html').error(function() {
        console.log('Missing template "' + name + '".');
    });
};

var ItemList = (function() {
    var nextId = 1;

    return function(name) {
        this.id = nextId++;
        this.name = name || 'some list';
        this.items = [];
    };
})();

ItemList.prototype.add = function(item) {
    this.items.push(item);
};

$(function() {
    var items = new ItemList();
    items.add({name: 'another item'});
    items.add({name: 'a secret'});
    feedback(items);

    var items2 = new ItemList('the best list ever');
    items2.add({name: 'blueberry'});
    items2.add({name: 'yum'});
    items2.add({name: 'yum'});
    feedback(items2);
});
