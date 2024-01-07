import json

def is_valid_json(input_data):
    try:
        json.loads(json.dumps(input_data))
        return True
    except ValueError:
        return False

def is_valid_type(key, expected_type, message):
    return isinstance(message.get(key), expected_type)

def validate_message_format(message):
    if not is_valid_json(message):
        return False

    try:
        required_keys = ['message', 'user_name']
        if not all(key in message for key in required_keys):
            return False

        if not (is_valid_type('message', str, message)):
            return False

        if message['message'] == 'POLL' or message['message'] == 'RESULT':
            return 'poll_id' in message and is_valid_type('poll_id', int, message)

        return True
    except:
        return False
