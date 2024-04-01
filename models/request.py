from models.base_models import Basemodels, Base
import sqlalchemy
import models
from sqlalchemy import JSON, Column, DateTime, String, ForeignKey, Integer, Text
from sqlalchemy.sql import func


class Request(Basemodels, Base):
    __tablename__ = 'requests'
    if models.storage_t == "db":
        painters_id = Column(String(60), ForeignKey(
            'painters.id', ondelete='CASCADE'), nullable=False)
        user_id = Column(String(60), ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
        JobLenght = Column(Integer)
        JobWidth = Column(Integer)
        JobType = Column(String(255))
        
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)