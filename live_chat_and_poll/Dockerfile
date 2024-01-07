FROM python:3.11

WORKDIR /code

# ENV REDIS_URL=redis://livestreamingredis.redis.cache.windows.net:6380,password=I85OuoVccAcfaQ0fMBK4ezmb0J5uciYOTAzCaPfJPRA=,ssl=True,abortConnect=False/
# ENV DATABASE_URL=postgresql://livestreamingpostgres:5F3cDt4M\?Ak@livestreamingpostgres.postgres.database.azure.com:5434/poll

COPY ./requirements.txt /code/requirements.txt

RUN pip install --no-cache-dir --upgrade -r /code/requirements.txt

COPY . /code

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]