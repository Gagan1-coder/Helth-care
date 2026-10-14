"""
LifeLink AI - Hospital Discovery Schemas
"""
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


class HospitalFacility(BaseModel):
    id: str
    name: str
    address: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    place_id: Optional[str] = None
    distance_km: Optional[float] = None
    drive_time_minutes: Optional[int] = None
    phone: Optional[str] = None
    emergency_services: List[str] = Field(default_factory=list)
    has_icu: Optional[bool] = None
    has_ambulance: Optional[bool] = None
    open_24x7: Optional[bool] = None
    source: str = "verified_regional_registry"
    directions_url: Optional[str] = None
    google_maps_url: Optional[str] = None
    verification_status: str = "verified_registry"  # 'verified_google_places', 'verified_registry', 'crowdsourced_osm', 'manual_entry'
    match_reason: Optional[str] = None
    retrieval_timestamp: Optional[str] = None
    rating: Optional[float] = None
    user_ratings_total: Optional[int] = None
    is_manually_entered: bool = False


class HospitalSearchRequest(BaseModel):
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    city_district: Optional[str] = None
    query: Optional[str] = None
    radius_km: float = 25.0
    category: Optional[str] = None


class HospitalSearchResponse(BaseModel):
    query_coordinates: Optional[Dict[str, float]] = None
    search_location_name: Optional[str] = None
    total_found: int
    data_source: str
    disclaimer: str = "Emergency facility availability, bed counts, and doctor status can change rapidly. Please call the facility directly or dial 108/112 before moving a critical patient."
    facilities: List[HospitalFacility]
