from __future__ import annotations

import base64
import mimetypes
import os
from typing import Optional

import requests


def image_to_base64(file_path: str) -> str:
    with open(file_path, 'rb') as f:
        b64 = base64.b64encode(f.read()).decode('utf-8')
    mime, _ = mimetypes.guess_type(file_path)
    if not mime:
        raise ValueError('Unsupported or unknown file type')
    return f"data:{mime};base64,{b64}"


def get_token() -> Optional[str]:
    token = os.getenv('WATSONX_TOKEN')
    if token:
        return token

    api_key = os.getenv('IBMCLOUD_API_KEY')
    if not api_key:
        return None

    data = {
        'grant_type': 'urn:ibm:params:oauth:grant-type:apikey',
        'apikey': api_key,
    }
    headers = {'Content-Type': 'application/x-www-form-urlencoded'}
    try:
        resp = requests.post('https://iam.cloud.ibm.com/identity/token', data=data, headers=headers, timeout=20)
        resp.raise_for_status()
        return resp.json().get('access_token')
    except Exception:
        return None

