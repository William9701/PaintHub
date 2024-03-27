from geopy.geocoders import Nominatim
from geopy.distance import geodesic

def get_coordinates(city):
    geolocator = Nominatim(user_agent="geo_distance_calculator")
    location = geolocator.geocode(city)
    if location:
        return location.latitude, location.longitude
    else:
        return None

def calculate_distance(city1, city2):
    coordinates1 = get_coordinates(city1)
    coordinates2 = get_coordinates(city2)
    
    if coordinates1 and coordinates2:
        distance = geodesic(coordinates1, coordinates2).kilometers
        return distance
    else:
        return "Unable to retrieve coordinates for one or both cities."

# Example usage:
city1 = "onitsha"
city2 = "owerri"
distance = calculate_distance(city1, city2)
print(f"The distance between {city1} and {city2} is approximately {distance:.2f} kilometers.")
