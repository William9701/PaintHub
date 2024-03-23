from models.base_models import Basemodels, Base
import sqlalchemy
import models
from sqlalchemy import Column, Integer, String, Text, DECIMAL, DateTime

class Product(Basemodels, Base):
	__tablename__ = 'products'
	if models.storage_t == "db":
		Name = Column(String(255))
		Description = Column(Text)
		Price = Column(Integer)
		stripeId = Column(String(100))
		QuantityAvailable = Column(Integer)
		Brand = Column(String(100))
		Category = Column(String(100))
		Material = Column(String(100))
		Color = Column(String(50))
		Size = Column(String(50))
		Weight = Column(Integer)
		Dimensions = Column(String(100))
		ProductImage = Column(String(100))
		ColorImage = Column(String(100))
		AverageRating = Column(DECIMAL(3, 2))
		Reviews = Column(Text)
		DiscountPercentage = Column(Integer)
		SalePrice = Column(Integer)
		Tags = Column(String(255))

	def __init__(self, *args, **kwargs):
		super().__init__(*args, **kwargs)