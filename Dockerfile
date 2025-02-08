# Project environment
FROM node:18.0.0-alpine3.15

# Install MongoDB client tools
RUN apk update && \
    apk add --no-cache mongodb-tools

# Container directory
WORKDIR /app

# Copy package.json and package-lock.json files
COPY package*.json ./

# Install packages
RUN npm install

# Create the wait-for-it.sh script with debug statements
RUN echo '#!/usr/bin/env bash\n\
echo "Starting wait-for-it.sh script"\n\
# Usage: wait-for-it.sh host:port [-t timeout] [-- command args]\n\
#  -h HOST | --host=HOST     Host or IP under test\n\
#  -p PORT | --port=PORT     TCP port under test\n\
#  -t TIMEOUT | --timeout=TIMEOUT  Timeout in seconds, zero for no timeout\n\
#  -- COMMAND ARGS           Execute COMMAND ARGS after the test finishes\n\
\n\
cmdname=$(basename $0)\n\
\n\
echoerr() { if [[ $QUIET -ne 1 ]]; then echo "$@" 1>&2; fi }\n\
\n\
usage()\n\
{\n\
    exitcode="$1"\n\
    cat << USAGE >&2\n\
Usage:\n\
    $cmdname host:port [-t timeout] [-- command args]\n\
    -h HOST | --host=HOST     Host or IP under test\n\
    -p PORT | --port=PORT     TCP port under test\n\
    -t TIMEOUT | --timeout=TIMEOUT  Timeout in seconds, zero for no timeout\n\
    -- COMMAND ARGS           Execute COMMAND ARGS after the test finishes\n\
USAGE\n\
    exit "$exitcode"\n\
}\n\
\n\
wait_for()\n\
{\n\
    if [[ "$TIMEOUT" -gt 0 ]]; then\n\
        echoerr "$cmdname: waiting $TIMEOUT seconds for $HOST:$PORT"\n\
    else\n\
        echoerr "$cmdname: waiting for $HOST:$PORT without a timeout"\n\
    fi\n\
    start_ts=$(date +%s)\n\
    while :\n\
    do\n\
        if [[ "$ISBUSY" -eq 1 ]]; then\n\
            nc -z "$HOST" "$PORT"\n\
            result=$?\n\
        else\n\
            (echo > /dev/tcp/$HOST/$PORT) >/dev/null 2>&1\n\
            result=$?\n\
        fi\n\
        if [[ $result -eq 0 ]]; then\n\
            end_ts=$(date +%s)\n\
            elapsed=$((end_ts - start_ts))\n\
            echoerr "$cmdname: $HOST:$PORT is available after $elapsed seconds"\n\
            return 0\n\
        fi\n\
        sleep 1\n\
    done\n\
}\n\
\n\
while [[ $# -gt 0 ]]\n\
do\n\
    case "$1" in\n\
        *:* )\n\
        hostport=(${1//:/ })\n\
        HOST=${hostport[0]}\n\
        PORT=${hostport[1]}\n\
        shift 1\n\
        ;;\n\
        -h | --host)\n\
        HOST="$2"\n\
        if [[ "$HOST" == "" ]]; then break; fi\n\
        shift 2\n\
        ;;\n\
        -p | --port)\n\
        PORT="$2"\n\
        if [[ "$PORT" == "" ]]; then break; fi\n\
        shift 2\n\
        ;;\n\
        -t | --timeout)\n\
        TIMEOUT="$2"\n\
        if [[ "$TIMEOUT" == "" ]]; then break; fi\n\
        shift 2\n\
        ;;\n\
        --)\n\
        shift\n\
        break\n\
        ;;\n\
        --help)\n\
        usage 0\n\
        ;;\n\
        *)\n\
        echoerr "Unknown argument: $1"\n\
        usage 1\n\
        ;;\n\
    esac\n\
done\n\
\n\
if [[ "$HOST" == "" || "$PORT" == "" ]]; then\n\
    echoerr "Error: you need to provide a host and port to test."\n\
    usage 2\n\
fi\n\
\n\
wait_for\n\
\n\
echo "wait-for-it.sh script completed"\n\
\n\
exec "$@"\n' > /app/wait-for-it.sh

# Make wait-for-it.sh executable
RUN chmod +x /app/wait-for-it.sh

# Copy the rest of the application files
COPY . .

# Container port
EXPOSE 3001

# Last command to run the project
CMD ["sh", "-c", "/app/wait-for-it.sh mongo:27017 -- npm run migrate:up && npm run dev"]
