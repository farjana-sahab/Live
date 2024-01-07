
# from helpers.redis import redis_cache
import asyncio
from .crud import PollViewSet, Result
from fastapi.encoders import jsonable_encoder
from helpers.response import CustomResponse

async def get_poll_list(db, live_id):
    # cache_data = await cache_obj.get_cache(key_name="polls", cache=cache)
    # if cache_data and not live_id:
    #     response = CustomResponse.success(data=cache_data, message="sucessfully retrive")
    #     return response
    # return from cache

    poll=PollViewSet()

    # filter by teacher id
    if live_id:
        obj=poll.get_poll(live_id=live_id, db=db)
        response = CustomResponse.success(data=obj, message="sucessfully retrive")
        return response

    obj=poll.get_poll(db=db)

    # set cache
    # if obj:
    #     json_compatible_item_data = jsonable_encoder(obj)
    #     await cache_obj.set_cache(key_name="polls", data=json_compatible_item_data, cache=cache)


    response = CustomResponse.success(data=obj, message="sucessfully retrive")
    return response


async def get_poll_details_by_id(poll_id, db):
    # cache_key = f"poll_{poll_id}"
    # cache_data = await cache_obj.get_cache(key_name=cache_key, cache=cache)
    # if cache_data:
    #     response = CustomResponse.success(data=cache_data, message="sucessfully retrive")
    #     return response
    # retrive from cache

    poll=PollViewSet()
    obj = poll.get_single_poll(db=db, poll_id=poll_id)
    # if obj:
    #     json_compatible_item_data = jsonable_encoder(obj)
    #     await cache_obj.set_cache(key_name=cache_key, data=json_compatible_item_data, cache=cache)
    # cache item

    response = CustomResponse.success(data=obj, message="sucessfully retrive")
    return response

async def add_question_viewset(poll_schema, db):
    # await cache_obj.delete_cache(key_name="polls", cache=cache)
    poll=PollViewSet()
    try:
        obj=poll.create_poll(db=db, poll_schema=poll_schema)
        response = CustomResponse.success(data=obj, message="sucessfully retrive", status_code=201)
        return response
    except Exception as e:
        print(e.args)
        return CustomResponse.error(message=f"Error: {e.args}", status_code=400)

async def cast_vote_viewset(vote_schema):
    from main import redis_client
    data = {
        'user_id':vote_schema.user_id,
        'question_id':vote_schema.question_id,
        'option_choosed':vote_schema.option_choosed
    }
    await redis_client.publish_json("poll", data)
    # publish into redis

    response = CustomResponse.basic_response(message=f"we are taking your vote for option {vote_schema.option_choosed}", status_code=201)
    return response

async def result_viewset(question_id, db):
    # cache_key = f"vote_result_for_{question_id}"
    # cache_data = await cache_obj.get_cache(key_name=cache_key, cache=cache)
    # if cache_data:
    #     response = CustomResponse.basic_response(data=cache_data,message="successfully vote data retrive", status_code=200)
    #     return response

    question_id = int(question_id)
    result_cls = Result()
    poll_cls = PollViewSet()
    poll_obj = poll_cls.get_single_poll(db=db, poll_id=question_id)
    if not poll_obj:
        response = CustomResponse.error(message="There is no poll with this id", status_code=404)
        return response
    vote_results = result_cls.retrive_result(db=db, question_id=question_id)
    total_vote = result_cls.total_vote_count(db=db, question_id=question_id)
    correct_ans_of_this_poll = poll_obj.correct_ans

    # store in cache
    # json_compatible_item_data = jsonable_encoder(vote_results)
    # await cache_obj.set_cache(key_name=cache_key, data=json_compatible_item_data, cache=cache, expiration_time=2)
    extra_info = {
        'correct_ans': correct_ans_of_this_poll,
        'total_vote': total_vote
    }
    response = CustomResponse.basic_response(data=vote_results,message="successfully vote data retrive" if vote_results else "There is no vote casted yet", status_code=200, extra_fields=extra_info)

    return response