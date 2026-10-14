"""
LifeLink AI - Location and Spatial Services
Provides verified Haversine distance calculation, location confidence rating,
and secure map link generation. Never fabricates coordinates.
"""
import math
import logging
from typing import Optional, Tuple, Dict, Any
from app.schemas.emergency import LocationConfidence

logger = logging.getLogger("lifelink.location")

def calculate_haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calculate the great circle distance between two points on the earth in kilometers.
    """
    R = 6371.0  # Earth's radius in kilometers
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(dlon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    distance_km = R * c
    return round(distance_km, 2)


def estimate_drive_time(distance_km: float, is_urban: bool = True) -> int:
    """
    Estimate transit driving time in minutes based on distance.
    Assumes average 35 km/h for emergency transit in mixed roads.
    """
    avg_speed_kmh = 35.0 if is_urban else 50.0
    time_hours = distance_km / avg_speed_kmh
    minutes = int(math.ceil(time_hours * 60))
    return max(1, minutes)


def assess_location_confidence(accuracy_meters: Optional[float]) -> LocationConfidence:
    """
    Classifies location confidence based on GPS accuracy radius.
    """
    if accuracy_meters is None or accuracy_meters < 0:
        return LocationConfidence.UNAVAILABLE
    if accuracy_meters <= 25.0:
        return LocationConfidence.PRECISE
    elif accuracy_meters <= 250.0:
        return LocationConfidence.APPROXIMATE
    else:
        return LocationConfidence.APPROXIMATE


def generate_google_maps_url(lat: float, lon: float) -> str:
    return f"https://www.google.com/maps?q={lat:.6f},{lon:.6f}"


def generate_google_directions_url(dest_lat: float, dest_lon: float, origin_lat: Optional[float] = None, origin_lon: Optional[float] = None) -> str:
    if origin_lat is not None and origin_lon is not None:
        return f"https://www.google.com/maps/dir/?api=1&origin={origin_lat:.6f},{origin_lon:.6f}&destination={dest_lat:.6f},{dest_lon:.6f}"
    return f"https://www.google.com/maps/dir/?api=1&destination={dest_lat:.6f},{dest_lon:.6f}"
