from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('authenticate.urls')),
]

# ⚠️ ВАЖНО: подключаем MEDIA и в PROD
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

# STATIC можно оставить только для DEBUG
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)