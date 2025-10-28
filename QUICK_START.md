# Quick Start Guide - JODDB with Real API Integration

## 🚀 Setup (First Time Only)

### 1. Backend Setup
```bash
cd /home/aabusnin/Desktop/42amman/GitHub/JODDB_hackathon

# Activate virtual environment
source venv/bin/activate

# Install dependencies (if not already)
pip install -r requirements.txt

# Run migrations
python3 manage.py migrate

# Create seed users (if not already)
python3 manage.py seed_users

# Start backend server
python3 manage.py runserver
```

Backend should now be running at: **http://localhost:8000**

---

### 2. Frontend Setup
```bash
# Open new terminal
cd /home/aabusnin/Desktop/42amman/GitHub/JODDB_hackathon/frontend

# Install dependencies (if not already)
npm install

# Start development server
npm run dev
```

Frontend should now be running at: **http://localhost:5173**

---

## 🎯 Test the Integration

### Step 1: Open Browser
Navigate to: **http://localhost:5173**

### Step 2: Test Login (Real API)
Try these credentials:

| Username | Password | Role |
|----------|----------|------|
| `tech_1` | `tech123` | Technician |
| `pe_1` | `pe123` | Planning Engineer |
| `qi_1` | `qi123` | Quality Inspector |
| `super_1` | `super123` | Supervisor |

### Step 3: Verify Integration
Open browser console (F12) and check:
```javascript
// After login, you should see:
localStorage.getItem('access_token')  // JWT token
localStorage.getItem('user')          // User data
```

### Step 4: Test Task Operations (as Technician)
1. Login as `tech_1` / `tech123`
2. You should see task cards
3. Click "Start Task" - watch Network tab for API call
4. Wait a few seconds
5. Click "End Task" - watch Network tab for API call

---

## 📊 What Changed

### Before (Mock Data)
- ❌ Fake login with hardcoded passwords
- ❌ Tasks stored in JavaScript only
- ❌ No backend communication

### After (Real API)
- ✅ Real JWT authentication
- ✅ All data from Django database
- ✅ Every action calls backend API
- ✅ Full integration verified

---

## 🔍 Verify Real API Calls

### Open Browser DevTools (F12) → Network Tab

You should see these requests:

1. **Login:**
   ```
   POST http://localhost:8000/api/v1/auth/login/
   Request: {"username": "tech_1", "password": "tech123"}
   Response: {"access": "...", "refresh": "...", "user": {...}}
   ```

2. **Get Tasks:**
   ```
   GET http://localhost:8000/api/v1/tasks/
   Headers: Authorization: Bearer <token>
   Response: [{"id": 1, "operation_name": "...", ...}]
   ```

3. **Start Task:**
   ```
   PATCH http://localhost:8000/api/v1/tasks/1/start/
   Headers: Authorization: Bearer <token>
   Response: {"id": 1, "status": "in_progress", ...}
   ```

4. **End Task:**
   ```
   PATCH http://localhost:8000/api/v1/tasks/1/end/
   Headers: Authorization: Bearer <token>
   Body: {"notes": "..."}
   Response: {"id": 1, "status": "done", "efficiency": ..., ...}
   ```

---

## 🎬 Run the Demo

Follow the complete demo script:
```bash
# Open the demo script
cat DEMO_SCRIPT.md
```

Or jump to key sections:
1. **Part 1:** Login as different roles (1 min)
2. **Part 2:** Create Job Order as PE (1 min)
3. **Part 3:** Start/End task as Technician (1.5 min)
4. **Part 4:** Verify auto-update of metrics (30 sec)
5. **Part 5:** QI inspection & rejection (1 min)

---

## ⚠️ Troubleshooting

### Backend not responding?
```bash
# Check if running:
curl http://localhost:8000/admin/

# If not working, restart:
python manage.py runserver
```

### CORS errors in browser?
Check `joddb_backend/settings.py`:
```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
]
```

### Frontend not loading?
```bash
# Check if Vite is running:
cd frontend
npm run dev
```

### Login fails?
```bash
# Verify users exist:
python3 manage.py shell
>>> from core.models import User
>>> User.objects.filter(username='tech_1').exists()
True

# If False, run seed:
python3 manage.py seed_users

# If getting "No active account" error, reset passwords:
python3 manage.py shell << 'EOF'
from core.models import User
users_passwords = {
    'tech_1': 'tech123',
    'pe_1': 'pe123',
    'qi_1': 'qi123',
    'super_1': 'super123',
}
for username, password in users_passwords.items():
    user = User.objects.get(username=username)
    user.set_password(password)
    user.save()
    print(f"✅ Updated {username}")
EOF
```

---

## 📁 Key Files Added

1. **`frontend/.env`** - API URL configuration
2. **`frontend/src/services/api.ts`** - Complete API layer
3. **`frontend/src/components/TechnicianTaskCard.tsx`** - Task component with API calls
4. **`frontend/src/contexts/AuthContext.tsx`** - Updated with real JWT auth
5. **`DEMO_SCRIPT.md`** - 5-minute demonstration guide
6. **`SMART_PROMPT_7_IMPLEMENTATION.md`** - Complete documentation

---

## ✅ Success Checklist

- [x] Backend running on port 8000
- [x] Frontend running on port 5173
- [x] Can login with real credentials
- [x] JWT token stored in localStorage
- [x] Tasks load from database
- [x] Start task calls backend API
- [x] End task calls backend API
- [x] Metrics update automatically
- [x] No mock data used

---

## 🎯 What's Working

✅ **Authentication:** Real JWT tokens from Django  
✅ **Task Management:** Start/End via API  
✅ **Job Orders:** Create/List via API  
✅ **Metrics:** Real-time progress from database  
✅ **Role-Based Access:** Enforced by backend  
✅ **Data Persistence:** Everything in Django DB  

---

## 🎉 You're All Set!

Your JODDB system now has **full frontend-backend integration** with:
- Real API calls
- JWT authentication
- Database persistence
- Real-time updates

Ready for demo! 🚀
