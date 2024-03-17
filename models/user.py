from models.base_models import Basemodels, Base
import sqlalchemy
import models
from sqlalchemy import Column, String, ForeignKey, Integer

class User(Basemodels, Base):
    __tablename__ = 'users'
    if models.storage_t == "db":
        id = Column(String(250), primary_key=True)
        email = Column(String(250), nullable=False)
        hashed_password = Column(String(250), nullable=False)
        session_id = Column(String(250), nullable=True)
        reset_token = Column(String(250), nullable=True)