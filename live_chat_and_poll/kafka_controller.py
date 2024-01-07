import json
import asyncio
from aiokafka import AIOKafkaConsumer, AIOKafkaProducer
from fastapi import FastAPI, Depends, status, Response, BackgroundTasks
from database import SessionLocal, engine
from sqlalchemy.orm import Session

from database import get_db
import models



async def consume():
    loop = asyncio.get_event_loop()
    consumer = AIOKafkaConsumer('poll', loop=loop,
                                bootstrap_servers="localhost:29092")
    await consumer.start()
    try:
        async for msg in consumer:
            try:
                print(f'Consumer msg: {msg.value.decode("utf-8")}')
                consume_data = msg.value.decode("utf-8")
                msg_dict = json.loads(consume_data)
                question_id = int(msg_dict.get('question_id'))
                option_choosed = msg_dict.get('option_choosed')
                user_id = msg_dict.get('user_id')
                vote = models.Vote(question_id=question_id, option_choosed=option_choosed, user_id=user_id)
                db = SessionLocal()
                try:
                    db.add(vote)
                    db.commit()
                    db.refresh(vote)
                except Exception as e:
                    print(f"Database Error: {e}")
                    db.rollback()
                finally:
                    db.close()
            except Exception as e:
                print(e)
                pass
    finally:
        await consumer.stop()



class KafkaManager:

    def __init__(self, kafka_server):
        self.kafka_server = kafka_server
        self.loop = asyncio.get_event_loop()
        self.producer = AIOKafkaProducer(
        loop=self.loop, bootstrap_servers=kafka_server)


    async def send_message(self, data, topic):
        await self.producer.start()
        # try:
        print(f'Sendding message with value: {data}')
        value_json = json.dumps(data).encode('utf-8')
        await self.producer.send_and_wait(topic=topic, value=value_json)
        # finally:
        #     await self.producer.stop()


    # def check_is_topic_exist(self, topic_name):
    #     topic_metadata = self.admin_client.list_topics()
    #     existing_topics = topic_metadata.topics
    #     if topic_name in existing_topics:
    #         return True
    #     return False


    # def send_message(self, data):
    #     self.producer.send("poll", json.dumps(data).encode("utf-8"))

    # async def kafka_message_consumer(self):
    #     while True:
    #         obj = []
    #         data = await asyncio.to_thread(self.consumer.poll)

    #         for topic, messages in data.items():
    #             for message in messages:
    #                 key = message.key
    #                 value = message.value.decode("utf-8")
    #                 obj.append({
    #                     'key':key,
    #                     'value':value
    #                 })
    #         await asyncio.sleep(1)
    #         print('achi')
    #         print(obj)
    #         return obj