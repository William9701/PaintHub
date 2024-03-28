from models.base_models import Basemodels, Base
import sqlalchemy
import models
from sqlalchemy import JSON, Column, DateTime, String, ForeignKey, Integer
from sqlalchemy.sql import func


class Invoice(Basemodels, Base):
    __tablename__ = 'invoice'
    if models.storage_t == "db":
        user_id = Column(String(60), ForeignKey(
            'users.id', ondelete='CASCADE'), nullable=False)
        productCart = Column(JSON, default=[])
        delivery_charge = Column(Integer)
        total = Column(Integer)
        status = Column(String(250))

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
