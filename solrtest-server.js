Solrtest.solr = Npm.require('solr-client');

Solrtest.client = Solrtest.solr.createClient();
Solrtest.client.autoCommit = true;

Solrtest.searchSync = Meteor.wrapAsync(Solrtest.client.search, Solrtest.client);

Meteor.methods({
  'Solrtest.query': function(q) {
    var query = Solrtest.client.createQuery().q({title_t : q}).start(0).rows(100);
    var result = Solrtest.searchSync(query);
    console.log(result);

    return result;
  }
});
