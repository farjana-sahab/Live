from sqlalchemy.orm import Session
import models

class ChatCrud:

    def retrive_previous_chat(self, db: Session, id):
        chat_obj = db.query(models.LiveChat).order_by(models.LiveChat.id.desc()).limit(20).all()
        results = list(reversed(chat_obj))

        return results