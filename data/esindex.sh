#!/bin/sh
host=$ES_HOST
core=$ES_CORE

read -p "Enter User: " user
read -s -p "Enter Password: " password

if [[ -z $host ]]; then
  echo "Could not find environment variable ES_HOST using default";
  host="http://localhost"
fi

if [[ -z $core ]]; then
  echo "Could not find environment variable ES_CORE using default";
  core="en"
fi

echo "Deleting index... "
echo `curl -u "$user:$password" -s -w "%{http_code}\n" -XDELETE "$host:9200/en"`

echo "Creating index... "
echo `curl -u "$user:$password" -s -w "%{http_code}\n" -XPUT "$host:9200/en" --data-binary @index.json`

echo "Indexing religions..."
for file in ../rawdata/religions/en/*.json
do
    filename="${file##*/}"
    filename=${filename%.*}
    printf "Uploading $file... "
    echo `curl -u "$user:$password" -s -o /dev/null -w "%{http_code}\n" -XPOST "$host:9200/en/religion/$filename" --data-binary @$file`
done

echo "Indexing authors..."
for file in ../rawdata/authors/en/*.json
do
    filename="${file##*/}"
    filename=${filename%.*}
    printf "Uploading $file... "
    echo `curl -u "$user:$password" -s -o /dev/null -w "%{http_code}\n" -XPOST "$host:9200/en/author/$filename" --data-binary @$file`
done

echo "Indexing books..."
for file in ../rawdata/reference-library/*.xml
do
    printf "Uploading $file... "
    echo `curl -u "$user:$password" -s -o /dev/null -w "%{http_code}\n" -XPOST "$host:9200/_book" --data-binary @$file`
done
