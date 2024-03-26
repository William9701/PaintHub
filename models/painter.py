from models.base_models import Basemodels, Base
import sqlalchemy
import models
from sqlalchemy import Column, DateTime, String, ForeignKey, Integer, Text
from sqlalchemy.sql import func


class Painter(Basemodels, Base):
    __tablename__ = 'painters'
    if models.storage_t == "db":
        id = Column(String(250), primary_key=True)
        email = Column(String(250), nullable=False)
        hashed_password = Column(String(250), nullable=False)
        session_id = Column(String(250), nullable=True)
        reset_token = Column(String(250), nullable=True)
        first_name = Column(String(100), nullable=False)
        state = Column(String(250))
        city = Column(String(250))
        last_name = Column(String(100), nullable=False)
        description = Column(Text)
        profile_image = Column(String(250))
        work_contents = Column(String(250))
        phone_number = Column(String(20))
        last_login_at = Column(DateTime(timezone=True),
                               server_default=func.now(), onupdate=func.now())
        account_status = Column(String(20))

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
