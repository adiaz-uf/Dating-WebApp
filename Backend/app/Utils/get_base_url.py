import os
from flask import request # type: ignore

def get_base_ip():
    try:
        
        host = request.host
        ip = host.split(':')[0]  # only IP
        return ip
    except RuntimeError:
        return os.getenv("APP_HOST_IP", "127.0.0.1")
    
def get_frontend_base_url():
    ip = get_base_ip()
    port = os.getenv("FRONTEND_PORT")
    return f"http://{ip}:{port}"


def get_backend_base_url():
    ip = get_base_ip()
    port = os.getenv("BACKEND_PORT")
    return f"http://{ip}:{port}"
