import firebase_admin
from firebase_admin import credentials
from loguru import logger
import os
import json

def init_firebase():
    project_id = os.environ.get("FIREBASE_PROJECT_ID", "hiresense-5e81a")
    os.environ.setdefault("GOOGLE_CLOUD_PROJECT", project_id)
    if not firebase_admin._apps:
        try:
            # Check if a specific service account path is provided
            service_account_path = os.environ.get("FIREBASE_CREDENTIALS")
            service_account_json = os.environ.get("FIREBASE_SERVICE_ACCOUNT_JSON")
            options = {"projectId": project_id}
            
            if service_account_path and os.path.exists(service_account_path):
                cred = credentials.Certificate(service_account_path)
                firebase_admin.initialize_app(cred, options=options)
                logger.info("Firebase Admin initialized with certificate.")
            elif service_account_json:
                cred = credentials.Certificate(json.loads(service_account_json))
                firebase_admin.initialize_app(cred, options=options)
                logger.info("Firebase Admin initialized from service-account JSON.")
            else:
                firebase_admin.initialize_app(options=options)
                logger.info("Firebase Admin initialized with application default credentials.")
        except Exception as e:
            logger.warning("Firebase Admin credentials unavailable; authenticated requests will be rejected.")

def verify_token(id_token: str):
    from firebase_admin import auth
    try:
        decoded_token = auth.verify_id_token(id_token)
        return decoded_token
    except Exception as e:
        logger.error(f"Error verifying Firebase ID token: {e}")
        return None
