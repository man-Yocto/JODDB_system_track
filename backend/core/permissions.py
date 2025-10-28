# core/permissions.py
from rest_framework import permissions


class IsRoleRequired(permissions.BasePermission):
    """
    Custom DRF permission class for role-based access control.
    
    Usage in ViewSet:
        permission_classes = [IsRoleRequired(['planning', 'admin'])]
    
    Or dynamically:
        def get_permissions(self):
            if self.action == 'create':
                return [IsRoleRequired(['planning'])]
            return [IsRoleRequired(['planning', 'supervisor', 'quality', 'technician'])]
    """
    
    def __init__(self, allowed_roles=None):
        """
        Initialize with a list of allowed roles.
        
        Args:
            allowed_roles (list): List of role strings that are allowed access
        """
        self.allowed_roles = allowed_roles or []
    
    def has_permission(self, request, view):
        """
        Check if the authenticated user's role is in the allowed roles list.
        """
        # User must be authenticated
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Superusers always have access
        if request.user.is_superuser:
            return True
        
        # Check if user's role is in allowed roles
        user_role = getattr(request.user, 'role', None)
        
        if not user_role:
            return False
        
        return user_role in self.allowed_roles
    
    def __call__(self):
        """
        Allow the permission to be instantiated in permission_classes list.
        """
        return self


# Convenience permission classes for common role combinations
class IsPlanningEngineer(IsRoleRequired):
    """Only Planning Engineers can access"""
    def __init__(self):
        super().__init__(allowed_roles=['planning', 'admin'])


class IsTechnician(IsRoleRequired):
    """Only Technicians can access"""
    def __init__(self):
        super().__init__(allowed_roles=['technician', 'admin'])


class IsQualityInspector(IsRoleRequired):
    """Only Quality Inspectors can access"""
    def __init__(self):
        super().__init__(allowed_roles=['quality', 'admin'])


class IsSupervisor(IsRoleRequired):
    """Only Supervisors can access"""
    def __init__(self):
        super().__init__(allowed_roles=['supervisor', 'admin'])


class IsAdmin(IsRoleRequired):
    """Only System Admins can access"""
    def __init__(self):
        super().__init__(allowed_roles=['admin'])


class IsStaffOrReadOnly(permissions.BasePermission):
    """
    Allow read-only access to any authenticated user,
    but write access only to planning/supervisor/admin roles.
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Read permissions for all authenticated users
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Write permissions only for staff roles
        user_role = getattr(request.user, 'role', None)
        return user_role in ['planning', 'supervisor', 'admin'] or request.user.is_superuser