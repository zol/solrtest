Solrtest.solr = Npm.require('solr-client');

Solrtest.client = Solrtest.solr.createClient();
Solrtest.client.autoCommit = true;

Solrtest.wrapped = {};

['add', 'search', 'deleteByQuery', 'ping', 'commit'].forEach(function(x) {
  Solrtest.wrapped[x] = Meteor.wrapAsync(Solrtest.client[x], Solrtest.client);
});

function logged(result) {
  Log.info(result);
  return result;
}

Meteor.methods({
  'Solrtest.query': function(q) {
    var query = Solrtest.client.createQuery().q({title_t : q}).start(0).rows(100);
    return logged(Solrtest.wrapped['search'](query));
  },
  'Solrtest.deleteAll': function() {
    logged(Solrtest.wrapped['deleteByQuery']('*:*'));
    logged(Solrtest.wrapped['commit']());
  },
  'Solrtest.ping': function() {
    var result;

    try {
      result = Solrtest.wrapped['ping']();
    } catch (e) {
      if (e.message.match('ECONNREFUSED'))
        return Log.error('Unable to connect to ping instance.');

      throw e;
    }
    
    return logged(result);
  }
});

