import database
from fastapi import APIRouter, Depends
from fastapi_cache.backends.redis import CACHE_KEY, RedisCacheBackend
import schemas
from sqlalchemy.orm import Session
# from main import redis_cache, cache_obj
from .views import get_poll_list, get_poll_details_by_id, add_question_viewset, cast_vote_viewset, result_viewset
import schemas

poll = APIRouter(
    tags=["poll"],
)

@poll.get("/get_poll")
async def get_poll(live_id: int = None, db: Session=Depends(database.get_db)):
    return await get_poll_list(db=db, live_id=live_id)


@poll.get("/get_poll/{poll_id}")
async def get_poll_details(poll_id, db: Session=Depends(database.get_db)):
    return await get_poll_details_by_id(poll_id=poll_id, db=db)

@poll.post("/add_question")
async def add_question(poll_schema:schemas.Poll, db: Session=Depends(database.get_db)):
    return await add_question_viewset(poll_schema=poll_schema, db=db)

@poll.post("/cast_vote")
async def cast_vote(vote_schema:schemas.Vote):
    return await cast_vote_viewset(vote_schema=vote_schema)

@poll.get("/results/{question_id}")
async def results(question_id, db: Session=Depends(database.get_db)):
    return await result_viewset(question_id=question_id, db=db)