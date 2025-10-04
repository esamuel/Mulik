#!/bin/bash

# Script to set Netlify environment variables from .env file

echo "🔧 Setting Netlify environment variables..."

# Read .env file and set each variable
while IFS='=' read -r key value; do
  # Skip comments and empty lines
  if [[ ! "$key" =~ ^# && -n "$key" ]]; then
    # Remove any quotes from value
    value=$(echo "$value" | sed 's/^"\(.*\)"$/\1/' | sed "s/^'\(.*\)'$/\1/")
    
    if [[ -n "$value" ]]; then
      echo "Setting $key..."
      npx netlify-cli env:set "$key" "$value"
    fi
  fi
done < .env

echo "✅ Environment variables set!"
echo "🚀 Now redeploy with: npm run build && npx netlify-cli deploy --prod"
