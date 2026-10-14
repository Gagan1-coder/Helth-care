"""
LifeLink AI - Core Database Layer
Provides unified Firestore access with transparent local development fallback.
Explicitly distinguishes between live Firebase Cloud Firestore and local dev storage.
"""
import os
import json
import logging
from typing import Dict, Any, List, Optional
from datetime import datetime
from app.core.config import settings

logger = logging.getLogger("lifelink.database")

# In-memory document storage for development/offline mode
_LOCAL_STORAGE: Dict[str, Dict[str, Any]] = {
    "users": {},
    "medical_profiles": {},
    "contacts": {},
    "emergency_events": {},
    "notification_logs": {},
    "agent_audit_logs": {},
}

_is_firebase_initialized = False
_firestore_client = None

def initialize_database():
    global _is_firebase_initialized, _firestore_client
    if settings.FIREBASE_CREDENTIALS_PATH and os.path.exists(settings.FIREBASE_CREDENTIALS_PATH):
        try:
            import firebase_admin
            from firebase_admin import credentials, firestore
            
            if not firebase_admin._apps:
                cred = credentials.Certificate(settings.FIREBASE_CREDENTIALS_PATH)
                firebase_admin.initialize_app(cred, {"projectId": settings.FIREBASE_PROJECT_ID})
            _firestore_client = firestore.client()
            _is_firebase_initialized = True
            logger.info("Successfully connected to live Firebase Cloud Firestore.")
        except Exception as e:
            logger.warning(f"Failed to initialize Firebase Admin: {e}. Falling back to Local Dev Store.")
            _is_firebase_initialized = False
            _firestore_client = None
    else:
        logger.info("No Firebase credentials provided. Operating in Local Development / Demo Store mode.")
        _is_firebase_initialized = False
        _firestore_client = None


class DatabaseRepository:
    def __init__(self, collection_name: str):
        self.collection_name = collection_name
        if collection_name not in _LOCAL_STORAGE:
            _LOCAL_STORAGE[collection_name] = {}

    @property
    def is_live_firebase(self) -> bool:
        return _is_firebase_initialized and _firestore_client is not None

    def get_status_info(self) -> Dict[str, Any]:
        return {
            "is_connected_to_firebase": self.is_live_firebase,
            "engine": "Firebase Cloud Firestore" if self.is_live_firebase else "Local Development In-Memory Store",
            "collection": self.collection_name,
            "document_count": len(_LOCAL_STORAGE.get(self.collection_name, {})) if not self.is_live_firebase else "cloud_managed",
            "credentials_configured": bool(settings.FIREBASE_CREDENTIALS_PATH and os.path.exists(settings.FIREBASE_CREDENTIALS_PATH))
        }

    def get(self, doc_id: str) -> Optional[Dict[str, Any]]:
        if self.is_live_firebase:
            try:
                doc = _firestore_client.collection(self.collection_name).document(doc_id).get()
                return doc.to_dict() if doc.exists else None
            except Exception as e:
                logger.error(f"Firestore get error: {e}")
                return None
        return _LOCAL_STORAGE[self.collection_name].get(doc_id)

    def create(self, doc_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
        data["id"] = doc_id
        if "created_at" not in data:
            data["created_at"] = datetime.utcnow().isoformat()
        data["updated_at"] = datetime.utcnow().isoformat()

        if self.is_live_firebase:
            try:
                _firestore_client.collection(self.collection_name).document(doc_id).set(data)
            except Exception as e:
                logger.error(f"Firestore create error: {e}")
        # Always maintain local copy for fast retrieval/dev
        _LOCAL_STORAGE[self.collection_name][doc_id] = data
        return data

    def update(self, doc_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        updates["updated_at"] = datetime.utcnow().isoformat()
        if self.is_live_firebase:
            try:
                _firestore_client.collection(self.collection_name).document(doc_id).update(updates)
            except Exception as e:
                logger.error(f"Firestore update error: {e}")

        if doc_id in _LOCAL_STORAGE[self.collection_name]:
            _LOCAL_STORAGE[self.collection_name][doc_id].update(updates)
            return _LOCAL_STORAGE[self.collection_name][doc_id]
        return None

    def list_all(self, limit: int = 100) -> List[Dict[str, Any]]:
        if self.is_live_firebase:
            try:
                docs = _firestore_client.collection(self.collection_name).limit(limit).stream()
                return [d.to_dict() for d in docs]
            except Exception as e:
                logger.error(f"Firestore list error: {e}")
        return list(_LOCAL_STORAGE[self.collection_name].values())[:limit]

    def find_by_user(self, user_id: str) -> List[Dict[str, Any]]:
        if self.is_live_firebase:
            try:
                docs = _firestore_client.collection(self.collection_name).where("userId", "==", user_id).stream()
                return [d.to_dict() for d in docs]
            except Exception as e:
                logger.error(f"Firestore find_by_user error: {e}")
        return [
            doc for doc in _LOCAL_STORAGE[self.collection_name].values()
            if doc.get("user_id") == user_id or doc.get("userId") == user_id
        ]

    def delete(self, doc_id: str) -> bool:
        if self.is_live_firebase:
            try:
                _firestore_client.collection(self.collection_name).document(doc_id).delete()
            except Exception as e:
                logger.error(f"Firestore delete error: {e}")
        if doc_id in _LOCAL_STORAGE[self.collection_name]:
            del _LOCAL_STORAGE[self.collection_name][doc_id]
            return True
        return False


# Export repository instances
users_repo = DatabaseRepository("users")
medical_profiles_repo = DatabaseRepository("medical_profiles")
contacts_repo = DatabaseRepository("contacts")
emergency_events_repo = DatabaseRepository("emergency_events")
notification_logs_repo = DatabaseRepository("notification_logs")
agent_audit_logs_repo = DatabaseRepository("agent_audit_logs")
