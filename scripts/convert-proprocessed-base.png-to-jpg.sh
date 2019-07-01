#!/bin/bash

find ./src/assets/preprocessed -type f -name 'base.png' | while read f ; do
  sips -s format jpeg -s formatOptions 80 "${f}" --out "${f%png}jpg";
  rm "${f}";
done
