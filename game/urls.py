from django.urls import path
from .views import *



urlpatterns = [
    path('', syllable_game_view, name='syllable_game_view'),
    ]