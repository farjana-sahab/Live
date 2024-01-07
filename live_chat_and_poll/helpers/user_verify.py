# import models

# def verify_user(phone_number, db):
#     is_exist = bool(db.query(models.User.phone_number).filter(models.User.phone_number == phone_number).first())
#     if not is_exist:
#         return False
#     return is_exist