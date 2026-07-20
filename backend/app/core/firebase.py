import firebase_admin
from firebase_admin import credentials
from loguru import logger
import os

def init_firebase():
    os.environ['GOOGLE_CLOUD_PROJECT'] = 'hiresense-5e81a'
    if not firebase_admin._apps:
        try:
            # Check if a specific service account path is provided
            service_account_path = os.environ.get("FIREBASE_CREDENTIALS")
            options = {'projectId': 'hiresense-5e81a'}
            
            if service_account_path and os.path.exists(service_account_path):
                cred = credentials.Certificate(service_account_path)
                firebase_admin.initialize_app(cred, options=options)
                logger.info("Firebase Admin initialized with certificate.")
            else:
                try:
                    # Try to use Application Default Credentials
                    firebase_admin.initialize_app(options=options)
                    logger.info("Firebase Admin initialized with ADC and explicit projectId.")
                except ValueError:
                    # If ADC fails
                    firebase_admin.initialize_app(options=options)
                    logger.info("Firebase Admin initialized with explicit project ID.")
        except Exception as e:
            logger.warning(f"Firebase Admin initialization warning: {e}")

def verify_token(id_token: str):
    from firebase_admin import auth
    try:
        decoded_token = auth.verify_id_token(id_token)
        return decoded_token
    except Exception as e:
        logger.error(f"Error verifying Firebase ID token: {e}")
        return None
