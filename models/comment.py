import models
from models.base_models import Basemodels, Base
import sqlalchemy
from sqlalchemy import Column, String, ForeignKey, Integer
from sqlalchemy.orm import relationship


class Comment(Basemodels, Base):
    __tablename__ = 'comments'
    if models.storage_t == "db":
        user_id = Column(String(60), ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
        
        text = Column(String(1024), nullable=True)
        
    else:
        user_id = ""
        number_of_likes = 0
        reply = ""
        text = ""

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

