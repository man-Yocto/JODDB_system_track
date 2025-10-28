from django.contrib import admin
from .models import User, JobOrder, Device, Task, Report, Inspection, SupervisorReview, PerformanceMetric, Notification

admin.site.register(User)
admin.site.register(JobOrder)
admin.site.register(Device)
admin.site.register(Task)
admin.site.register(Report)
admin.site.register(Inspection)
admin.site.register(SupervisorReview)
admin.site.register(PerformanceMetric)
admin.site.register(Notification)