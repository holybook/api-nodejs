#!/usr/bin/env bash
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

for file in "$@"
do
    echo -ne "Uploading $file... "
    echo `curl -u "$user:$password" -s -o /dev/null -w "%{http_code}\n" -XPOST "$host:9200/_book" --data-binary @$file`
done

rm tmp

