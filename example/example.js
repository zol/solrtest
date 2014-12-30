Packages = new Mongo.Collection('packages');

if (Meteor.isClient) {
  var results = new ReactiveVar([]);
  var stats = new ReactiveVar({});

  Template.hello.rendered = function() {
    $(this.find('input')).focus();
  }
  
  Template.hello.helpers({
    results: function () { return results.get(); },
    stats: function () { return stats.get(); }
  });

  Template.hello.events({
    'keyup input': function (event) {
      console.log('typed:' + event.target.value);
      Meteor.call('Solrtest.query', event.target.value, function(error, result) {
        if (error) {
          console.error(error);
          results.set([]);
          stats.set({});
        } else {
          results.set(result.response.docs);
          stats.set(result.responseHeader);
        }
      });
    }
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    if (Meteor.call('Solrtest.ping').status === 'OK') {
      if (Packages.find().count() === 0) {
        var data = JSON.parse(Assets.getText('packages.json'));
        var records = [];

        console.log('Loading ' + data.length + ' items');
        data.forEach(function(item) {
          // stick with the default schema solr ships with out of the box
          var record = {
            title_t: item.name,
            description_t: ''
          }
        
          if (record.latestVersion)
            record.description_t = record.latestVersion.description;

          record.id = Packages.insert(record);
          records.push(record);
        });
        console.log('Finished loading package data into db.');
      
        console.log('Loading data into solr...');
        Meteor.call('Solrtest.deleteAll');
        var result = Solrtest.wrapped['add'](records);
        console.log('Finished loading data into solr...');
      }
    };
  });
}