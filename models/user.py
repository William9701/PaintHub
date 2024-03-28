from models.base_models import Basemodels, Base
import sqlalchemy
import models
from sqlalchemy import JSON, Column, DateTime, String, ForeignKey, Integer
from sqlalchemy.sql import func


class User(Basemodels, Base):
    __tablename__ = 'users'
    if models.storage_t == "db":
        id = Column(String(250), primary_key=True)
        email = Column(String(250), nullable=False)
        hashed_password = Column(String(250), nullable=False)
        session_id = Column(String(250), nullable=True)
        reset_token = Column(String(250), nullable=True)
        first_name = Column(String(100), nullable=False)
        last_name = Column(String(100), nullable=False)
        billing_address = Column(String(255))
        Image = Column(String(255))
        shipping_address = Column(String(255))
        phone_number = Column(String(20))
        payment_info = Column(String(100))
        purchase_history = Column(JSON, default=[])
        wishlist = Column(String(255))  
        cart_contents = Column(JSON, default=[])
        cart_contentsQuantity = Column(JSON, default={})
        preferred_colors = Column(String(100))

        preferred_brands = Column(String(100))
        painter_preferences = Column(String(100))
        notification_preferences = Column(String(100))
        last_login_at = Column(DateTime(timezone=True),
                               server_default=func.now(), onupdate=func.now())
        account_status = Column(String(20))

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
