# core/management/commands/seed_users.py
from django.core.management.base import BaseCommand
from core.models import User


class Command(BaseCommand):
    help = 'Seeds the database with sample users for testing'

    def handle(self, *args, **kwargs):
        users_data = [
            {'username': 'pe_1', 'email': 'pe1@joddb.local', 'first_name': 'Ahmed', 
             'last_name': 'Planning', 'role': 'planning', 'is_staff': True},
            {'username': 'super_1', 'email': 'super1@joddb.local', 'first_name': 'Youssef',
             'last_name': 'Supervisor', 'role': 'supervisor', 'is_staff': True},
            {'username': 'qi_1', 'email': 'qi1@joddb.local', 'first_name': 'Fatima',
             'last_name': 'Quality', 'role': 'quality'},
            {'username': 'tech_1', 'email': 'tech1@joddb.local', 'first_name': 'Ali',
             'last_name': 'Technician', 'role': 'technician'},
            {'username': 'tech_2', 'email': 'tech2@joddb.local', 'first_name': 'Omar',
             'last_name': 'Technician', 'role': 'technician'},
            {'username': 'admin', 'email': 'admin@joddb.local', 'first_name': 'System',
             'last_name': 'Admin', 'role': 'admin', 'is_staff': True, 'is_superuser': True},
        ]
        
        for user_data in users_data:
            user, created = User.objects.get_or_create(
                username=user_data['username'],
                defaults=user_data
            )
            if created:
                user.set_password('pass')
                user.full_name = f"{user_data['first_name']} {user_data['last_name']}"
                user.save()
                self.stdout.write(self.style.SUCCESS(f'Created user: {user.username}'))
            else:
                self.stdout.write(self.style.WARNING(f'User exists: {user.username}'))