from models.base_models import Basemodels, Base
import sqlalchemy
import models
from sqlalchemy import JSON, Column, DateTime, String, ForeignKey, Integer, Text
from sqlalchemy.sql import func


class PaintersMedia(Basemodels, Base):
    __tablename__ = 'paintersMedia'
    if models.storage_t == "db":
        painters_id = Column(String(60), ForeignKey(
            'painters.id', ondelete='CASCADE'), nullable=False)
        photos = Column(JSON, default=[])
        video = Column(JSON, default=[])

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
