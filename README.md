# Holybook API

An api for searching in books, querying and browsing meta information about books and creating collections of quotations.

## Getting Started

### Elastic search:

Install elasticsearch: https://www.elastic.co/downloads/elasticsearch

`bin/elasticsearch`

### Setup data:

Cd into the data folder

`esindex.sh`

### Run server:

`npm install`

`npm start`

## Technical Details

The api uses an underlying elasticsearch cluster to store the data and perform the search operations. The elasticsearch
data schema is stored in `data/index.json`. 

### Support for multiple languages

The basic idea is to store the book text in separate indices, one for each
language. Metadata like authors, religions and book titles are stored in one single index, where internationalization is
achieved, by adding multiple fields (i.e. `title_en`, `title_de` and so on). See [One Language per Document](https://www.elastic.co/guide/en/elasticsearch/guide/current/one-lang-docs.html)
and [One Language per Field](https://www.elastic.co/guide/en/elasticsearch/guide/current/one-lang-fields.html) for more
information on this topic.

