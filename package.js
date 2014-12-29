Package.describe({
  name: "percolate:solrtest",
  summary: "/* Fill me in! */",
  // version: "0.1.0",
  git: "https://github.com/percolatestudio/meteor-synced-cron.git"
});

Npm.depends({"solr-client": "0.5.0"});

Package.onUse(function(api) {
  api.versionsFrom('METEOR@1.0.2');

  api.use([], ['client', 'server']);

  api.addFiles(['solrtest-common.js']);
  api.addFiles(['solrtest-client.js'], 'client');
  api.addFiles(['solrtest-server.js'], 'server');

  api.export('Solrtest', ['client', 'server']);
});

Package.onTest(function(api) {
  api.use('tinytest');
  api.use('percolate:solrtest');
  api.addFiles('solrtest-tests.js');
});