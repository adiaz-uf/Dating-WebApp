#!/bin/bash

echo "Installing dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

echo "Launch Flask server..."
cd /backend 
export FLASK_APP=run:create_app
python seed_users.py && flask run --host=0.0.0.0 --port=3001 #TODO
