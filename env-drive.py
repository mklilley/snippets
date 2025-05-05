import json
from google.colab import auth
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from getpass import getpass
import io

# Global dictionary to store credentials for session-wide access
_credentials = {}

def authenticate():
    """
    Authenticate user by reading credentials from a Google Drive JSON file or prompting for manual input.
    Stores username and password in a global _credentials dictionary.
    """
    global _credentials
    
    # Try to load credentials from Google Drive
    try:
        # Authenticate user with Colab's Google account
        auth.authenticate_user()
        
        # Build Google Drive API service
        drive_service = build('drive', 'v3')
        
        # File ID of the JSON file on Google Drive
        file_id = 'REPLACE_WITH_ACTUAL_FILE_ID'
        
        # Download the file content
        request = drive_service.files().get_media(fileId=file_id)
        file_content = request.execute()
        
        # Decode bytes to string and parse JSON
        credentials = json.loads(file_content.decode('utf-8'))
        username = credentials.get('username')
        password = credentials.get('password')
        
        if not username or not password:
            raise ValueError("Credentials file missing 'username' or 'password' keys")
        
        # Store credentials
        _credentials['username'] = username
        _credentials['password'] = password
        print("Authentication successful (Google Drive).")
        
    except HttpError as e:
        print(f"Google Drive authentication failed: {e}")
        print("Falling back to manual input.")
        print("Note: Credentials will be hidden for security.")
        # Prompt for manual input
        username = getpass("Enter username: ")
        password = getpass("Enter password: ")
        _credentials['username'] = username
        _credentials['password'] = password
    except Exception as e:
        print(f"Unexpected error during Google Drive authentication: {e}")
        print("Falling back to manual input.")
        print("Note: Credentials will be hidden for security.")
        username = getpass("Enter username: ")
        password = getpass("Enter password: ")
        _credentials['username'] = username
        _credentials['password'] = password

def get_credentials():
    """
    Retrieve stored credentials. Raises an error if not set.
    """
    if not _credentials:
        raise ValueError("No credentials found. Please run authenticate() first.")
    return _credentials
