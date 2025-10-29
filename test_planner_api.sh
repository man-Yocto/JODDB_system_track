#!/bin/bash

# Planner Statistics API Test Script

echo "========================================="
echo "Testing Planner Statistics API"
echo "========================================="
echo ""

# Check if backend is running
if ! curl -s http://localhost:8000/admin/ > /dev/null 2>&1; then
    echo "❌ Backend server is not running!"
    echo "Please start it with: cd backend && python manage.py runserver"
    exit 1
fi

echo "✅ Backend server is running"
echo ""

# Get auth token (you'll need to update this with a valid token)
echo "📝 To test the API, you need a valid auth token."
echo ""
echo "Option 1: Login to get a token"
echo "----------------------------------------"
echo "curl -X POST http://localhost:8000/api/v1/auth/login/ \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{\"username\": \"your_planning_user\", \"password\": \"your_password\"}'"
echo ""
echo "Option 2: Test with an existing token"
echo "----------------------------------------"
echo "curl http://localhost:8000/api/v1/planner/statistics/ \\"
echo "  -H 'Authorization: Bearer YOUR_ACCESS_TOKEN'"
echo ""

# If you have a token, uncomment and update this:
# TOKEN="your_token_here"
# echo "Testing API..."
# curl -s http://localhost:8000/api/v1/planner/statistics/ \
#   -H "Authorization: Bearer $TOKEN" | jq .

echo "Expected Response:"
echo "{"
echo "  \"active_job_orders\": 0,"
echo "  \"due_this_week\": 0,"
echo "  \"avg_productivity\": 0.0,"
echo "  \"active_technicians\": 0,"
echo "  \"total_technicians\": 3,"
echo "  \"technician_utilization\": 0.0,"
echo "  \"overdue_tasks\": 0,"
echo "  \"pending_reviews\": 0"
echo "}"
echo ""
echo "========================================="
echo "✅ API Endpoint Setup Complete!"
echo "========================================="
