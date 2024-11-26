from django.shortcuts import render

# Create your views here.

def syllable_game_view(request):
    return render(request, 'game/home_page.html')