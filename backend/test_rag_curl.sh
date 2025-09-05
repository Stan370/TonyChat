#!/bin/bash

# RAG API Test Script using curl
BASE_URL="http://localhost:8001"
NEXTJS_API="http://localhost:3000/api/rag"

echo "=== RAG API Testing with curl ==="

# Test 1: List files
echo -e "\n1. Testing list files endpoint:"
curl -X GET "$BASE_URL/rag/files" \
  -H "Content-Type: application/json"

# Test 2: Set conversation settings
echo -e "\n\n2. Testing set settings endpoint:"
curl -X POST "$BASE_URL/rag/settings" \
  -H "Content-Type: application/json" \
  -d '{
    "conversation_id": "test_conv_123",
    "knowledge_files": ["test_knowledge.txt"],
    "model": "gpt-3.5-turbo",
    "api_key": "your-api-key-here"
  }'

# Test 3: RAG Query (Python backend)
echo -e "\n\n3. Testing RAG query endpoint (Python backend):"
curl -X POST "$BASE_URL/rag/query" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "What is machine learning?",
    "conversation_id": "test_conv_123"
  }'

# Test 4: Next.js API proxy
echo -e "\n\n4. Testing Next.js API proxy:"
curl -X POST "$NEXTJS_API" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "What is AI?",
    "conversation_id": "test_conv_123",
    "settings": {
      "knowledge_files": ["test_knowledge.txt"],
      "model": "gpt-3.5-turbo"
    }
  }'

echo -e "\n\n=== Testing Complete ===" 