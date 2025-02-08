#!/usr/bin/env bash

# Usage: wait-for-it.sh host:port [-t timeout] [-- command args]
#  -h HOST | --host=HOST     Host or IP under test
#  -p PORT | --port=PORT     TCP port under test
#  -t TIMEOUT | --timeout=TIMEOUT  Timeout in seconds, zero for no timeout
#  -- COMMAND ARGS           Execute COMMAND ARGS after the test finishes

# example:
# wait-for-it.sh mongo:27017 --timeout=15 -- echo "MongoDB is up"

cmdname=$(basename $0)

echoerr() { if [[ $QUIET -ne 1 ]]; then echo "$@" 1>&2; fi }

usage()
{
    exitcode="$1"
    cat << USAGE >&2
Usage:
    $cmdname host:port [-t timeout] [-- command args]
    -h HOST | --host=HOST     Host or IP under test
    -p PORT | --port=PORT     TCP port under test
    -t TIMEOUT | --timeout=TIMEOUT  Timeout in seconds, zero for no timeout
    -- COMMAND ARGS           Execute COMMAND ARGS after the test finishes
USAGE
    exit "$exitcode"
}

wait_for()
{
    if [[ "$TIMEOUT" -gt 0 ]]; then
        echoerr "$cmdname: waiting $TIMEOUT seconds for $HOST:$PORT"
    else
        echoerr "$cmdname: waiting for $HOST:$PORT without a timeout"
    fi
    start_ts=$(date +%s)
    while :
    do
        if [[ "$ISBUSY" -eq 1 ]]; then
            nc -z "$HOST" "$PORT"
            result=$?
        else
            (echo > /dev/tcp/$HOST/$PORT) >/dev/null 2>&1
            result=$?
        fi
        if [[ $result -eq 0 ]]; then
            end_ts=$(date +%s)
            elapsed=$((end_ts - start_ts))
            echoerr "$cmdname: $HOST:$PORT is available after $elapsed seconds"
            return 0
        fi
        sleep 1
    done
}

# main logic
while [[ $# -gt 0 ]]
do
    case "$1" in
        *:* )
        hostport=(${1//:/ })
        HOST=${hostport[0]}
        PORT=${hostport[1]}
        shift 1
        ;;
        -h | --host)
        HOST="$2"
        if [[ "$HOST" == "" ]]; then break; fi
        shift 2
        ;;
        -p | --port)
        PORT="$2"
        if [[ "$PORT" == "" ]]; then break; fi
        shift 2
        ;;
        -t | --timeout)
        TIMEOUT="$2"
        if [[ "$TIMEOUT" == "" ]]; then break; fi
        shift 2
        ;;
        --)
        shift
        break
        ;;
        --help)
        usage 0
        ;;
        *)
        echoerr "Unknown argument: $1"
        usage 1
        ;;
    esac
done

if [[ "$HOST" == "" || "$PORT" == "" ]]; then
    echoerr "Error: you need to provide a host and port to test."
    usage 2
fi

wait_for

exec "$@"
