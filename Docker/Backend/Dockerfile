FROM python:3.12-slim

WORKDIR /code

RUN apt-get update && apt-get install -y libpq-dev gcc && rm -rf /var/lib/apt/lists/*

COPY Docker/Backend/tools/requirements.txt /code/requirements.txt
COPY Docker/Backend/tools/setup.sh /code/setup.sh

COPY Backend/ /code/

RUN chmod +x /code/setup.sh

ENTRYPOINT ["bash", "/code/setup.sh"]