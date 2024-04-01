from models.base_models import Basemodels, Base
import sqlalchemy
import models
from sqlalchemy import JSON, Column, DateTime, String, ForeignKey, Integer, Text
from sqlalchemy.sql import func


class Notification(Basemodels, Base):
    __tablename__ = 'notifications'
    if models.storage_t == "db":
        user_id = Column(String(60), ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
        Text = Column(String(255))
        
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)