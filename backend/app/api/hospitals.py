"""
LifeLink AI - Hospitals API Routes
Geospatial and text search for verified regional and live OSM healthcare facilities.
"""
from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from app.schemas.hospital import HospitalSearchRequest, HospitalSearchResponse, HospitalFacility
from app.services.hospital_service import search_hospitals, VERIFIED_REGIONAL_HOSPITALS

router = APIRouter(prefix="/hospitals", tags=["Hospital Discovery"])


@router.post("/search", response_model=HospitalSearchResponse)
def search_facilities(req: HospitalSearchRequest):
    """
    Finds emergency facilities by coordinates or search query.
    Calculates verified Haversine distance and transit time.
    """
    response = search_hospitals(
        latitude=req.latitude,
        longitude=req.longitude,
        city_district=req.city_district,
        query=req.query,
        category=req.category,
        radius_km=req.radius_km
    )
    return response


@router.get("/{hospital_id}", response_model=HospitalFacility)
def get_facility_details(hospital_id: str):
    """
    Retrieves individual hospital facility record and verification status.
    """
    for h in VERIFIED_REGIONAL_HOSPITALS:
        if h["id"] == hospital_id:
            return HospitalFacility(**h)
    raise HTTPException(status_code=404, detail="Hospital facility not found in registry.")
