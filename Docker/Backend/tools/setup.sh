#!/bin/bash

echo "Installing dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

echo "Launch Flask server..."
export FLASK_APP=run:create_app
export PYTHONUNBUFFERED=1
python -u seed_users.py

python -u run.py
