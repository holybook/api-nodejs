# Holybook API

An api for searching in books, querying and browsing meta information about books and creating collections of quotations.

## Getting Started

`npm install`

`node app.js`

## Technical Details

The api uses an underlying elasticsearch cluster to store the data and perform the search operations. The elasticsearch
data schema is stored in `data/index.json`.

