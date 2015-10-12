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

echo "Deleting indices... "
echo `curl -u "$user:$password" -s -w "%{http_code}\n" -XDELETE "$host:9200/meta"`
echo `curl -u "$user:$password" -s -w "%{http_code}\n" -XDELETE "$host:9200/text-en"`

echo "Creating indices... "
echo `curl -u "$user:$password" -s -w "%{http_code}\n" -XPUT "$host:9200/meta" --data-binary @schema/meta.json`
echo `curl -u "$user:$password" -s -w "%{http_code}\n" -XPUT "$host:9200/text-en" --data-binary @schema/text-en.json`

echo "Indexing religions..."
for file in ../../rawdata/religions/*.json
do
    filename="${file##*/}"
    filename=${filename%.*}
    printf "Uploading $file... "
    echo `curl -u "$user:$password" -s -o /dev/null -w "%{http_code}\n" -XPOST "$host:9200/meta/religion/$filename" --data-binary @$file`
done

echo "Indexing authors..."
for file in ../../rawdata/authors/*.json
do
    filename="${file##*/}"
    filename=${filename%.*}
    printf "Uploading $file... "
    echo `curl -u "$user:$password" -s -o /dev/null -w "%{http_code}\n" -XPOST "$host:9200/meta/author/$filename" --data-binary @$file`
done

echo "Indexing books..."
for file in ../../rawdata/reference-library/*.xml
do
    printf "Uploading $file... "
    xsltproc -o "tmp.json" xml2json.xsl $file
    echo `curl -u "$user:$password" -s -o /dev/null -w "%{http_code}\n" -XPOST "$host:9200/_bulk" --data-binary @tmp.json`
done
rm tmp.json
