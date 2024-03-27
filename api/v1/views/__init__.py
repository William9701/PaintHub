""" Blueprint for API """
from flask import Blueprint

app_views = Blueprint('app_views', __name__, url_prefix='/api/v1')

from api.v1.views.index import *
from api.v1.views.users import *
from api.v1.views.products import *
from api.v1.views.admins import *
from api.v1.views.painters import *
from api.v1.views.paintersMedia import *
from api.v1.views.invoice import *