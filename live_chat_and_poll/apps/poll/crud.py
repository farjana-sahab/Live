from sqlalchemy.orm import Session
import schemas
import models
from fastapi import Response, Depends
from fastapi.responses import JSONResponse
from sqlalchemy import text
from helpers.response import CustomResponse
from fastapi_cache.backends.redis import CACHE_KEY, RedisCacheBackend
from psycopg2 import errors


class PollViewSet:

    def get_single_poll(self, db: Session, poll_id):
        poll_obj = db.query(models.Question).filter(models.Question.id == poll_id).first()
        return poll_obj

    def get_current_ans_of_poll(self, db: Session, poll_id):
        poll_obj = db.query(models.Question.correct_ans).filter(models.Question.id == poll_id).first()
        return poll_obj

    def get_poll(self, db: Session, live_id = None):
        # query = text("SELECT * FROM questions")
        # result = db.execute(query)
        # data = result.fetchall()

        # column_names = result.keys()
        # question_list = [dict(zip(column_names, row)) for row in data]
        if live_id:
            questions = db.query(models.Question).filter(models.Question.live_id == live_id).all()
            return questions
            # response = CustomResponse.success(data=questions, message="sucessfully retrive")

        questions = db.query(models.Question).all()
        # response = CustomResponse.success(data=questions, message="sucessfully retrive")

        return questions

    def create_poll(self, db: Session, poll_schema):
        try:
            poll = models.Question(**poll_schema.dict())
            db.add(poll)
            db.commit()
            db.refresh(poll)
            return poll
        except Exception as e:
            print(errors.ForeignKeyViolation)
            db.rollback()
            raise e



class Result:

    def total_vote_count(self, db: Session, question_id):
        query = text("SELECT COUNT(*) as total_vote FROM vote WHERE question_id = :question_id")
        result = db.execute(query, {"question_id": question_id})
        row = result.fetchone()
        return row['total_vote']

    def retrive_result(self, db: Session, question_id):
        query = text("SELECT option_choosed, COUNT(*) as vote_count FROM vote WHERE question_id = :question_id GROUP BY option_choosed")
        result = db.execute(query, {"question_id": question_id})
        rows = result.fetchall()
        if rows:
            column_names = rows[0].keys()
            vote_list = [dict(zip(column_names, row)) for row in rows]
            return vote_list
        else:
            return None