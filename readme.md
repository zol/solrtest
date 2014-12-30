### Installation

This POC works out of the box with a default solr installation

```
brew install solr
solr start -f
```

Next, run the example

```
cd example
meteor
```

To access the solr console, go to http://localhost:8983/solr/#/collection1/query

Unfortunately, node-solr would crash when adding documents when I tried to use
a solr config not from the main installation directory (I didn't bother debugging why so far). Instead, I modified `/usr/local/Cellar/solr/4.10.2/example/solr/collection1/conf/schema.xml` and `/usr/local/Cellar/solr/4.10.2/example/solr/collection1/conf/solrconfig.xml` with the included files in `example/private/solr`.