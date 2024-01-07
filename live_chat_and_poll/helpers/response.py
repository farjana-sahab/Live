from fastapi.responses import JSONResponse
from fastapi import Response
from fastapi.encoders import jsonable_encoder

class CustomResponse:

    @classmethod
    def success(cls, data=None, message=None, status_code=200, extra_fields=None):
        return cls._build_response(data, message, status_code, extra_fields)

    @classmethod
    def basic_response(cls, data=None, message=None, status_code=200, extra_fields=None):
        return cls._build_response(data, message, status_code, extra_fields)

    @classmethod
    def error(cls, message, status_code=400, extra_fields=None):
        return cls._build_response(None, message, status_code, extra_fields)

    @staticmethod
    def _build_response(data, message, status_code, extra_fields=None):
        response_data = {
            'results': data,
            'message': message
        }
        if extra_fields:
            response_data.update(extra_fields)

        json_compatible_item_data = jsonable_encoder(response_data)
        return JSONResponse(content=json_compatible_item_data, status_code=status_code)
