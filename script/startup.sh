#!/bin/bash
while [[ "$(curl -s -o /dev/null -w ''%{http_code}'' localhost:3000/api/startup)" != "200" ]]; do sleep 1; done
