"""
URL configuration for joddb_backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
# joddb_backend/urls.py

from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import (
    TokenObtainPairView,  # For /login/ or /token/
    TokenRefreshView,     # For /token/refresh/
    TokenBlacklistView    # For /logout/
)
from core.views import UserRegistrationView # Import the new view
from rest_framework.routers import DefaultRouter
from core.views import (
    JobOrderViewSet, 
    TechnicianTaskViewSet, 
    UserManagementViewSet,
    TechnicianMetricsView,
    JobOrderMetricsView
)


# Router for ViewSets
router = DefaultRouter()
router.register(r'job-orders', JobOrderViewSet)
router.register(r'tasks', TechnicianTaskViewSet, basename='task') # basename needed for custom actions
router.register(r'users', UserManagementViewSet, basename='user-management')

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # --- API Authentication Endpoints ---
    path('api/v1/auth/register/', UserRegistrationView.as_view(), name='register'),
    
    # 1. Login (Obtain Access and Refresh Tokens)
    path('api/v1/auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    
    # 2. Refresh Token (Get a new Access Token)
    path('api/v1/auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Optional: Logout (Blacklist the Refresh Token)
    path('api/v1/auth/logout/', TokenBlacklistView.as_view(), name='token_blacklist'),

    # --- Core Application Endpoints ---
    path('api/v1/', include(router.urls)),
    
    # Metrics endpoints
    path('api/v1/metrics/technician/<int:id>/', TechnicianMetricsView.as_view(), name='technician-metrics'),
    path('api/v1/metrics/job-order/<int:id>/', JobOrderMetricsView.as_view(), name='job-order-metrics'),
]
