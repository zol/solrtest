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

// potentially should escape other crap too
function escape(string) {
  return string.replace(':', '\:');
}

Meteor.methods({
  'Solrtest.query': function(q) {
    // lucene query
    // var query = Solrtest.client.createQuery().q({name : q}).start(0).rows(100);
    
    // edismax query
    var query = Solrtest.client.createQuery().q(escape(q))
                .edismax()
                .qf({name : 1.0})
                // .mm(2) // not sure what this means
                .start(0)
                .rows(100);


    // To do highlighting, you must construct the query by hand
    // var query = {
    //   q: q,
    //   mm: 2,
    //   defType: 'edismax',
    //   qf: 'name^1',
    //   start: 0,
    //   rows: 10,
    //   hl : true,
    //  'hl.fl' : 'name'
    // };
     
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

