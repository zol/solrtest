Packages = new Mongo.Collection('packages');

if (Meteor.isClient) {
  var results = new ReactiveVar([]);
  var stats = new ReactiveVar({});

  Template.hello.rendered = function() {
    $(this.find('input')).focus();
  }
  
  Template.hello.helpers({
    results: function () { return results.get(); },
    stats: function () { return stats.get(); },
    highlighted: function(string) {
      var st = stats.get();
      
      if (st && st.params && st.params.q) {
        var query = st.params.q;
        return string.replace(query, '<b>' + query + '</b>');
      } else {
        return string;
      }
    }
  });

  Template.hello.events({
    'keyup input': function (event) {
      console.log('typed:' + event.target.value);
      var start = new Date;
      Meteor.call('Solrtest.query', event.target.value, function(error, result) {
        if (error) {
          console.error(error);
          results.set([]);
          stats.set({});
        } else {
          results.set(result.response.docs);
          stats.set(_.extend(result.responseHeader, {
            totalTime: new Date - start
          }));
        }
      });
    }
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    if (Packages.find().count() === 0) {
      var data = JSON.parse(Assets.getText('packages.json'));
      
      console.log('Loading ' + data.length + ' items into mongo');
      data.forEach(function(item) {
        // fixup data
        if (item.latestVersion) {
          item.latestVersion.published = 
            new Date(item.latestVersion.published['$date']);
        }
        item.lastUpdated = new Date(item.lastUpdated['$date']);
        delete item.metadata;
        
        // console.log(item);
        Packages.insert(item);
        
        console.log('Finished loading package data into db.');
      });
    };
    
    if (Meteor.call('Solrtest.ping').status === 'OK') {
      console.log('Ensuring packages are indexed by solr');
      var records = Packages.find().map(function(x) {
        return {
          id: x.name,
          name: x.name,
          description: x.latestVersion ? x.latestVersion.description : '',
          atscore: x.score,
          hidden: x.latestVersion ? x.latestVersion.unmigrated : false
        }
      });

      var result = Solrtest.wrapped['add'](records);

      console.log('Finished indexing into solr');
      console.log(result);
    } else {
      console.error('Cannot ping solr server, is it installed and running?');
    }
 });
}