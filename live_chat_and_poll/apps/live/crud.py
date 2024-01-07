import models
from sqlalchemy.orm import Session
from slugify import slugify
import random
import string

class LiveCrud:

    def create_live(self, db: Session, live_schema):
        slug = slugify(live_schema.title)
        random_string = ''.join(random.choices(string.ascii_lowercase + string.digits, k=6))
        live_key = slug + "-" + random_string

        live = models.Live(title=live_schema.title, live_key=live_key)
        db.add(live)
        db.commit()
        db.refresh(live)
        return live

    def get_all_live(self, db: Session):
        live_obj = db.query(models.Live).order_by(models.Live.created_at.desc()).limit(30).all()
        return live_obj

    def get_specific_live_by_id(self, db: Session, id):
        live_obj = db.query(models.Live).filter(models.Live.id == id).first()
        return live_obj

    def get_specific_live_by_live_key(self, db: Session, live_key):
        live_obj = db.query(models.Live).filter(models.Live.live_key == live_key).first()
        return live_obj

    def update_live(self, db: Session, live_update_schema, key):
        live = db.query(models.Live).filter(models.Live.live_key == key).first()
        live.video_status = live_update_schema.video_status
        live.meta_data = live_update_schema.meta_data
        db.commit()
        db.refresh(live)
        return live

    def update_live_key_status(self, db: Session, live_key, status):
        live = db.query(models.Live).filter(models.Live.live_key == live_key).first()
        live.live_key_status = status
        db.commit()
        db.refresh(live)
        return live

