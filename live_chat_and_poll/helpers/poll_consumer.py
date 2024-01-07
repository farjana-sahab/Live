
import models
from database import SessionLocal
import json

async def consume_redis_from_poll_channel():
        from main import redis_manager
        redis_client = await redis_manager.initialize()
        db = SessionLocal()

        try:
            channel, = await redis_client.subscribe("poll")
            try:
                async for message_bytes in channel.iter():
                    message_dict = json.loads(message_bytes)
                    question_id = int(message_dict.get('question_id'))
                    option_choosed = message_dict.get('option_choosed')
                    user_id = message_dict.get('user_id')

                    # save into database
                    vote = models.Vote(question_id=question_id, option_choosed=option_choosed, user_id=user_id)
                    with SessionLocal() as db:
                        try:
                            db.add(vote)
                            db.commit()
                            db.refresh(vote)
                        except Exception as e:
                            db.rollback()
                        finally:
                            db.close()
                            break
            except Exception as e:
                print(f"Error in poll consumer: {e}")
        except Exception as e:
            pass