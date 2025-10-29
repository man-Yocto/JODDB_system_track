#!/bin/bash

# Job Templates API Testing Script
# Run this after logging in and getting a token

echo "🧪 Testing Job Templates API Endpoints"
echo "========================================"
echo ""

# Set your base URL and token
API_URL="http://localhost:8000/api/v1"
TOKEN="your-access-token-here"

echo "📝 Note: Replace TOKEN variable with your actual access token"
echo ""

# Test 1: Create a new job with processes
echo "Test 1: Creating a new job template..."
echo "--------------------------------------"
curl -X POST "$API_URL/jobs/" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Test Laptop Assembly",
    "description": "Test job for API verification",
    "processes": [
      {
        "operation_name": "Install CPU",
        "standard_time_seconds": 180,
        "task_type": "technician",
        "order": 1
      },
      {
        "operation_name": "Quality Check",
        "standard_time_seconds": 60,
        "task_type": "quality",
        "order": 2
      }
    ]
  }' \
  | python3 -m json.tool

echo -e "\n"

# Test 2: Get all jobs
echo "Test 2: Fetching all jobs..."
echo "--------------------------------------"
curl -X GET "$API_URL/jobs/" \
  -H "Authorization: Bearer $TOKEN" \
  | python3 -m json.tool

echo -e "\n"

# Test 3: Update a job (requires job ID from Test 1)
echo "Test 3: Update job details..."
echo "--------------------------------------"
echo "Run this manually with the job ID from Test 1:"
echo "curl -X PATCH \"$API_URL/jobs/{JOB_ID}/\" \\"
echo "  -H \"Content-Type: application/json\" \\"
echo "  -H \"Authorization: Bearer \$TOKEN\" \\"
echo "  -d '{\"name\": \"Updated Laptop Assembly\"}'"

echo -e "\n"

# Test 4: Delete a job (requires job ID)
echo "Test 4: Delete job..."
echo "--------------------------------------"
echo "Run this manually with the job ID:"
echo "curl -X DELETE \"$API_URL/jobs/{JOB_ID}/\" \\"
echo "  -H \"Authorization: Bearer \$TOKEN\""

echo -e "\n"
echo "✅ Manual Testing Guide"
echo "======================"
echo "1. Login as planning engineer to get token"
echo "2. Replace TOKEN in this script with your actual token"
echo "3. Run: bash test_jobs_api.sh"
echo "4. Check responses for 200/201 status codes"
echo ""
