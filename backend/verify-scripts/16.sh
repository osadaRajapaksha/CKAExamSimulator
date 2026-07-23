#!/bin/bash
schedule=$(kubectl get cronjob hello-cron -o jsonpath='{.spec.schedule}' 2>/dev/null)
if [ "$schedule" = "* * * * *" ]; then
    echo "Validation Passed! CronJob configured successfully."
    exit 0
else
    echo "Validation Failed: CronJob 'hello-cron' is missing or has incorrect schedule."
    exit 1
fi
