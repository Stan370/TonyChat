import requests
import json
import os

# Configuration
BASE_URL = "http://localhost:8001"
NEXTJS_API_URL = "http://localhost:3000/api/rag"

def test_upload_file():
    """Test file upload endpoint"""
    print("Testing file upload...")
    
    # Create a test file
    test_content = "This is a test knowledge file about AI and machine learning."
    with open("test_knowledge.txt", "w") as f:
        f.write(test_content)
    
    # Upload the file
    with open("test_knowledge.txt", "rb") as f:
        files = {"file": ("test_knowledge.txt", f, "text/plain")}
        response = requests.post(f"{BASE_URL}/rag/upload", files=files)
    
    print(f"Upload response: {response.status_code}")
    print(f"Response: {response.json()}")
    return response.status_code == 200

def test_list_files():
    """Test listing files endpoint"""
    print("\nTesting list files...")
    response = requests.get(f"{BASE_URL}/rag/files")
    print(f"List files response: {response.status_code}")
    print(f"Files: {response.json()}")
    return response.status_code == 200

def test_get_file():
    """Test getting file content"""
    print("\nTesting get file content...")
    response = requests.get(f"{BASE_URL}/rag/file/test_knowledge.txt")
    print(f"Get file response: {response.status_code}")
    print(f"Content: {response.json()}")
    return response.status_code == 200

def test_set_settings():
    """Test setting conversation settings"""
    print("\nTesting set settings...")
    settings = {
        "conversation_id": "test_conv_123",
        "knowledge_files": ["test_knowledge.txt"],
        "model": "gpt-3.5-turbo",
        "api_key": "your-api-key-here"
    }
    response = requests.post(f"{BASE_URL}/rag/settings", json=settings)
    print(f"Set settings response: {response.status_code}")
    print(f"Response: {response.json()}")
    return response.status_code == 200

def test_rag_query():
    """Test RAG query endpoint"""
    print("\nTesting RAG query...")
    query_data = {
        "query": "What is machine learning?",
        "conversation_id": "test_conv_123"
    }
    response = requests.post(f"{BASE_URL}/rag/query", json=query_data)
    print(f"RAG query response: {response.status_code}")
    print(f"Response: {response.json()}")
    return response.status_code == 200

def test_nextjs_api():
    """Test Next.js API proxy"""
    print("\nTesting Next.js API proxy...")
    query_data = {
        "query": "What is AI?",
        "conversation_id": "test_conv_123",
        "settings": {
            "knowledge_files": ["test_knowledge.txt"],
            "model": "gpt-3.5-turbo"
        }
    }
    response = requests.post(NEXTJS_API_URL, json=query_data)
    print(f"Next.js API response: {response.status_code}")
    print(f"Response: {response.json()}")
    return response.status_code == 200

def cleanup():
    """Clean up test files"""
    print("\nCleaning up test files...")
    if os.path.exists("test_knowledge.txt"):
        os.remove("test_knowledge.txt")
    print("Cleanup complete")

def main():
    """Run all tests"""
    print("=== RAG API Testing Suite ===\n")
    
    tests = [
        ("Upload File", test_upload_file),
        ("List Files", test_list_files),
        ("Get File", test_get_file),
        ("Set Settings", test_set_settings),
        ("RAG Query", test_rag_query),
        ("Next.js API", test_nextjs_api)
    ]
    
    results = []
    for test_name, test_func in tests:
        try:
            result = test_func()
            results.append((test_name, result))
            print(f"✓ {test_name}: {'PASS' if result else 'FAIL'}")
        except Exception as e:
            print(f"✗ {test_name}: ERROR - {str(e)}")
            results.append((test_name, False))
    
    print("\n=== Test Summary ===")
    passed = sum(1 for _, result in results if result)
    total = len(results)
    print(f"Passed: {passed}/{total}")
    
    cleanup()

if __name__ == "__main__":
    main() 