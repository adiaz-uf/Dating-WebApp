FROM python:3.12-slim

WORKDIR /code

RUN apt-get update && apt-get install -y libpq-dev gcc && rm -rf /var/lib/apt/lists/*

COPY ./tools/ /code/

RUN chmod +x /code/setup.sh

ENTRYPOINT ["bash", "/code/setup.sh"]