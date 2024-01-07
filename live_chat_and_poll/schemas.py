from pydantic import BaseModel, Field
from typing import Dict
from typing import Optional
from pydantic import BaseModel, ValidationError, validator
import re
class Poll(BaseModel):
    live_id: int
    question: str
    duration: Optional[int]
    correct_ans: int
    option: Dict[int, str] = Field(default_factory=dict)


class Vote(BaseModel):
    user_id: int
    question_id: int
    option_choosed: int

class Live(BaseModel):
    title: str

class UpdateLive(BaseModel):
    video_status: int
    meta_data: Dict

class LiveObjectPreview(BaseModel):
    id: int
    title: str
    live_key: str
    video_status: int
    meta_data: Dict
    created_at: str
    updated_at: str

class CreateUser(BaseModel):
    phone_number: str
    password: str

    @validator('phone_number')
    def validate_bd_phone_number(cls, v):
        pattern = r'^(?:\+88|88)?(01[3-9]\d{8})$'
        if not re.match(pattern, v):
            raise ValueError('Invalid Bangladeshi phone number format')
        return v

class Otp(BaseModel):
    phone_number: str
    otp: str

    @validator('phone_number')
    def validate_bd_phone_number(cls, v):
        pattern = r'^(?:\+88|88)?(01[3-9]\d{8})$'
        if not re.match(pattern, v):
            raise ValueError('Invalid Bangladeshi phone number format')
        return v

