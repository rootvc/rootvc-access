#!/bin/bash

if [[ -z "${NEXT_PUBLIC_APP_URL}" ]]; then
  URL="localhost:3000"
else
  URL="${NEXT_PUBLIC_APP_URL}"
fi

while [[ "$(curl -s -o /dev/null -w ''%{http_code}'' ${URL}/api/startup)" != "200" ]]; do sleep 1; done
