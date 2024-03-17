from models.base_models import Basemodels, Base
from models.user import User
import models
from sqlalchemy import create_engine
from sqlalchemy.orm import scoped_session, sessionmaker
from os import getenv
from sqlalchemy.orm.session import Session
from sqlalchemy.exc import InvalidRequestError
from sqlalchemy.orm.exc import NoResultFound
from dotenv import load_dotenv

load_dotenv()

classes = {
    "User": User
}


class DBStorage:
    """interaacts with the MySQL database"""
    __engine = None
    __session = None

    def __init__(self):
        """Instantiate a DBStorage object"""
        PaintHub_MYSQL_USER = getenv('PaintHub_MYSQL_USER')
        PaintHub_MYSQL_PWD = getenv('PaintHub_MYSQL_PWD')
        PaintHub_MYSQL_HOST = getenv('PaintHub_MYSQL_HOST')
        PaintHub_MYSQL_DB = getenv('PaintHub_MYSQL_DB')
        PaintHub_ENV = getenv('PaintHub_ENV')
        self.__engine = create_engine('mysql+mysqldb://{}:{}@{}/{}'.
                                      format(PaintHub_MYSQL_USER,
                                             PaintHub_MYSQL_PWD,
                                             PaintHub_MYSQL_HOST,
                                             PaintHub_MYSQL_DB))
        if PaintHub_ENV == "test":
            Base.metadata.drop_all(self.__engine)

    @property
    def _session(self) -> Session:
        """Memoized session object
        """
        if self.__session is None:
            DBSession = sessionmaker(bind=self.__engine)
            self.__session = DBSession()
        return self.__session

    def all(self, cls=None):
        """query on the current database session"""
        new_dict = {}
        for clss in classes:
            if cls is None or cls is classes[clss] or cls is clss:
                objs = self.__session.query(classes[clss]).all()
                for obj in objs:
                    key = obj.__class__.__name__ + '.' + obj.id
                    new_dict[key] = obj
        return new_dict

    def new(self, obj):
        """add the object to the current database session"""
        self.__session.add(obj)

    def save(self):
        """commit all changes of the current database session"""
        self.__session.commit()

    def close(self):
        """call remove() method on the private session attribute"""
        self.__session.remove()

    def delete(self, obj=None):
        """delete from the current database session obj if not None"""
        if obj is not None:
            self.__session.delete(obj)

    def rollback(self):
        """ Roll back a session"""
        self.__session.rollback()

    def reload(self):
        """reloads data from the database"""
        Base.metadata.create_all(self.__engine)
        sess_factory = sessionmaker(bind=self.__engine, expire_on_commit=False)
        Session = scoped_session(sess_factory)
        self.__session = Session

    def get(self, cls, id):
        """
        Returns the object based on the class name and its ID, or
        None if not found
        """
        if cls not in classes.values():
            return None

        all_cls = models.storage.all(cls)
        for value in all_cls.values():
            if value.id == id:
                return value

        return None

    def add_user(self, email: str, hashed_password: str) -> User:
        """This is the add user method"""

        new_user = User(email=email, hashed_password=hashed_password)
        print(new_user.id)
        self._session.add(new_user)
        self._session.flush()  # flush the changes to the database
        self._session.commit()
        self._session.refresh(new_user)  # refresh the user instance
        return new_user

    def find_user_by(self, **kwargs) -> User:
        """This method takes in arbitrary keyword arguments and returns
        the first row found in the users table as filtered by the
        method’s input arguments"""
        try:
            # Construct the query dynamically based on kwargs
            query = self._session.query(User).filter_by(**kwargs)

        except InvalidRequestError:
            # If there is an invalid request error, raise it with a
            # meaningful message
            raise InvalidRequestError

        if query:
            # Get the first result or raise NoResultFound
            user_instance = query.one()

            return user_instance
        else:
            # If no results are found, raise NoResultFound
            raise NoResultFound

    def update_user(self, user_id: int, **kwargs) -> None:
        """This is a method that takes as argument a required user_id
        integer and arbitrary keyword arguments, and returns None"""
        user = self.find_user_by(id=user_id)
        if kwargs:
            for key, value in kwargs.items():
                if hasattr(user, key):
                    setattr(user, key, value)
                else:
                    raise ValueError(f"Invalid attribute: {key}")

        # Commit changes to the database
        self._session.commit()
